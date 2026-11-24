#!/usr/bin/env node
/* Render one camera/film page (cam scenes: flyover, end-card, lift-cards, …) of a built deck to an H.264 MP4.
   Frame-exact: every frame is set through the scene clock (seek(t)) and the page's WAAPI animations are pinned
   to the same time, then screenshotted and piped into ffmpeg. No screen recording, no timers.

   Setup once (local, in <skill>/tools):  npm i playwright-core @ffmpeg-installer/win32-x64   (Windows)
     other OS: npm i playwright-core ffmpeg-static
   Usage:
     node film_export.cjs <deck.html> --page <id> [--out film.mp4] [--fps 60] [--w 1440] [--h 900]
                          [--dpr 1] [--blur 1] [--from 0] [--to <dur>] [--crf 18] [--ui] [--audio] [--stills 0,1.6,5]
       --blur N   motion blur: render N subframes per frame across 0.7 of a frame, averaged by ffmpeg (slow ×N)
       --ui       keep HUD/rail/hints in the video (hidden by default)
       --audio    add a silent AAC track (some platforms want one; reel-export also adds it)
       --stills   only write PNG stills at these times (seconds) – check them before a full render
*/
'use strict';
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const TOOLS = path.join(__dirname, '..', 'tools', 'node_modules');
const req = m => { try { return require(path.join(TOOLS, m)); } catch (e) { return require(m); } };

function ffmpegPath() {
  for (const m of ['@ffmpeg-installer/win32-x64/ffmpeg.exe', '@ffmpeg-installer/ffmpeg']) {
    const p = path.join(TOOLS, m); if (fs.existsSync(p) && p.endsWith('.exe')) return p;
  }
  try { return req('ffmpeg-static'); } catch (e) {}
  try { return req('@ffmpeg-installer/ffmpeg').path; } catch (e) {}
  return 'ffmpeg';
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const deck = args[0];
if (!deck || !opt('page')) { console.error('usage: node film_export.cjs <deck.html> --page <id> [--out film.mp4] [--fps 60] …'); process.exit(1); }
const pageId = opt('page'), fps = +opt('fps', 60), W = +opt('w', 1440), H = +opt('h', 900), dpr = +opt('dpr', 1);
const blur = Math.max(1, +opt('blur', 1)), crf = +opt('crf', 18), keepUi = !!opt('ui', false), audio = !!opt('audio', false);
const out = path.resolve(opt('out', path.join(path.dirname(deck), pageId + '.mp4')));
const stills = opt('stills', '') ? String(opt('stills')).split(',').map(Number) : null;

(async () => {
  const { chromium } = req('playwright-core');
  const launch = { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--hide-scrollbars'] };
  let browser;
  for (const channel of ['msedge', 'chrome', undefined]) { try { browser = await chromium.launch(Object.assign({ channel }, launch)); break; } catch (e) { if (!channel) throw e; } }
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dpr, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(require('url').pathToFileURL(path.resolve(deck)).href);
  await page.waitForFunction(() => window.Deck && document.querySelector('.stage'));
  if (!keepUi) await page.addStyleTag({ content: '#chrome,.hint-bar,.rail,.hud{display:none!important}' });
  // go to the page, let the deck transition finish, then take control of time
  const info = await page.evaluate(async id => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const active = () => [...document.querySelectorAll('#app .stage.is-active')].pop();
    for (let i = 0; i < 40 && !(active() && active().dataset.id === id && !Deck.busy()); i++) { if (!Deck.busy() && (!active() || active().dataset.id !== id)) Deck.go(id); await sleep(250); }
    await sleep(1400);
    const st = document.querySelector('#app .stage[data-id="' + id + '"]');
    const c = st && st._r && st._r.clock;
    if (!c) return { ok: false, type: st && st.dataset.type };
    c.pause();
    window.__exp = { c, anims: document.getAnimations() };
    window.__exp.anims.forEach(a => { try { a.pause(); } catch (e) {} });
    window.__setT = t => {
      window.__exp.c.seek(t);
      document.getAnimations().forEach(a => { try { if (a.playState !== 'paused') a.pause(); a.currentTime = t * 1000; } catch (e) {} });
    };
    return { ok: true, dur: c.dur, type: st.dataset.type };
  }, pageId);
  if (!info.ok) { console.error(`page "${pageId}" (${info.type}) has no film clock – only cam scenes can be exported`); await browser.close(); process.exit(2); }
  const from = +opt('from', 0), to = +opt('to', info.dur);
  const shot = () => page.screenshot({ type: stills ? 'png' : 'jpeg', quality: stills ? undefined : 94 });
  const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

  if (stills) {
    for (const t of stills) { await page.evaluate(t => window.__setT(t), t); await settle(); const f = out.replace(/\.mp4$/, '') + `_${t.toFixed(2)}s.png`; fs.writeFileSync(f, await shot()); console.log('still', f); }
    await browser.close(); return;
  }

  const rate = fps * blur, n = Math.round((to - from) * fps);
  const vf = [blur > 1 ? `tmix=frames=${blur}:weights='${Array(blur).fill(1).join(' ')}',select='not(mod(n\\,${blur}))'` : null,
    `fps=${fps}`, `scale=${W * dpr}:${H * dpr}:out_color_matrix=bt709:out_range=tv`, 'format=yuv420p'].filter(Boolean).join(',');
  const ff = ['-y', '-f', 'image2pipe', '-framerate', String(rate), '-c:v', 'mjpeg', '-i', '-'];
  if (audio) ff.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
  ff.push('-vf', vf, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart');
  if (audio) ff.push('-c:a', 'aac', '-b:a', '128k', '-shortest');
  ff.push(out);
  const enc = spawn(ffmpegPath(), ff, { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = ''; enc.stderr.on('data', d => { err = (err + d).slice(-3000); });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < blur; s++) {
      const t = from + (i + (blur > 1 ? (s / blur) * .7 : 0)) / fps;
      await page.evaluate(t => window.__setT(t), t); await settle();
      const buf = await shot();
      if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    }
    if (i % fps === 0) process.stdout.write(`\r${(i / fps).toFixed(1)}s / ${(to - from).toFixed(1)}s  (${((Date.now() - t0) / 1000).toFixed(0)}s elapsed)`);
  }
  enc.stdin.end();
  const code = await new Promise(r => enc.on('close', r));
  await browser.close();
  if (code !== 0) { console.error('\nffmpeg failed:\n' + err); process.exit(3); }
  console.log(`\nOK  ${out}  (${(fs.statSync(out).size / 1e6).toFixed(1)} MB, ${n} frames @ ${fps} fps${blur > 1 ? `, motion blur ×${blur}` : ''})`);
})().catch(e => { console.error(e); process.exit(1); });
