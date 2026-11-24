#!/usr/bin/env node
/* Stills + motion frames of a Studio deck, for the per-page approval and the design review.
   Usage: node scripts/studio_frames.cjs <deck.html> [outDir] [--motion] [--mobile] [--only id1,id2]
   - desktop 1440x900 still of every scene after its transition settled  -> <out>/still_<nn>_<id>.png
   - --mobile also 390x844                                                -> <out>/mobile_<nn>_<id>.png
   - --motion: 6 frames DURING the transition into each scene             -> <out>/motion_<nn>_<id>_<k>.png
   Reports JS errors, external requests, text overflowing the viewport. Exit 1 on errors.
   Then: python scripts/sheet.py <out> (contact sheets to look at). */
const path = require('path'), fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  ({ chromium } = require(path.join(__dirname, '..', 'tools', 'node_modules', 'playwright-core'))); }
const args = process.argv.slice(2), file = path.resolve(args[0] || '');
const out = path.resolve(args[1] && !args[1].startsWith('--') ? args[1] : path.join(path.dirname(file), 'frames'));
const motion = args.includes('--motion'), mobile = args.includes('--mobile');
const onlyI = args.indexOf('--only'), only = onlyI > -1 ? args[onlyI + 1].split(',') : null;
fs.mkdirSync(out, { recursive: true });
(async () => {
  let browser; for (const channel of [undefined, 'msedge', 'chrome']) { try { browser = await chromium.launch(Object.assign({ args: ['--use-angle=d3d11', '--enable-gpu'] }, channel ? { channel } : {})); break; } catch (e) { if (channel === 'chrome') throw e; } }
  let problems = 0;
  const vps = [{ w: 1440, h: 900, n: 'still' }].concat(mobile ? [{ w: 390, h: 844, n: 'mobile' }] : []);
  for (const vp of vps) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    page.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) external.push(u); });
    await page.goto('file://' + file);
    await page.waitForFunction(() => window.Studio && Studio.ready, null, { timeout: 30000 });
    const ids = await page.evaluate(() => Studio.scenes());
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i], nn = String(i + 1).padStart(2, '0');
      if (only && !only.includes(id)) continue;
      if (i > 0) await page.evaluate(k => Studio.go(k - 1, { instant: true }), i);   // start from the previous shot
      await page.evaluate(() => Studio.idle()); await page.waitForTimeout(300);
      if (motion && vp.n === 'still' && i > 0) {
        await page.evaluate(k => { window.__p = Studio.go(k); }, i);
        const t0 = Date.now();
        for (let k = 0; k < 6; k++) { await page.screenshot({ path: path.join(out, `motion_${nn}_${id}_${k}.png`) }); await page.waitForTimeout(420); }
        await page.evaluate(() => window.__p); await page.evaluate(() => Studio.idle());
      } else {
        await page.evaluate(k => Studio.go(k), i); await page.evaluate(() => Studio.idle());
      }
      await page.waitForTimeout(1600);
      const r = await page.evaluate(k => { const s = document.querySelector('.scene.cur'); if (!s) return {};
        const over = [...s.querySelectorAll('*')].filter(e => { if (e.closest('.anchor')) return false; const b = e.getBoundingClientRect(); return e.childElementCount === 0 && b.width && (b.bottom > innerHeight + 2 || b.right > innerWidth + 2 || b.left < -2); }).length;
        return { over, hx: document.documentElement.scrollWidth > innerWidth + 2 }; }, i);
      if (r.over) { console.log(`[${vp.n}] ${id}: ${r.over} element(s) outside the viewport`); problems++; }
      await page.screenshot({ path: path.join(out, `${vp.n}_${nn}_${id}.png`) });
    }
    if (errors.length) { console.log(`[${vp.n}] JS errors:\n  ` + [...new Set(errors)].slice(0, 8).join('\n  ')); problems += errors.length; }
    if (external.length) { console.log(`[${vp.n}] external requests (not offline):\n  ` + [...new Set(external)].slice(0, 8).join('\n  ')); problems++; }
    await page.close();
  }
  await browser.close();
  console.log(problems ? `\n${problems} problem(s). Frames: ${out}` : `\nno errors. Frames: ${out}`);
  process.exit(problems ? 1 : 0);
})();
