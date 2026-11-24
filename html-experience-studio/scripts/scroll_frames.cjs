#!/usr/bin/env node
/* Stills of a scroll-driven deck (ScrollStage) at chosen progress values, for review and per-scene approval.
   Usage: node scripts/scroll_frames.cjs <deck.html> [outDir] [--at 0,.1,.2,...] [--mobile] [--wait 900]
   - default --at: 0 .06 .14 .22 .3 .4 .5 .58 .72 .8 .96   (one still each, desktop 1440x900)  -> <out>/p_<nnn>.png
   - --mobile also renders 390x844                                                                -> <out>/m_<nnn>.png
   Uses ?p=<value> (ScrollStage jumps there without entrance delay). Reports JS errors and external requests.
   Then: python scripts/sheet.py <out> --glob "p_*.png" (contact sheet). Exit 1 on problems. */
const path = require('path'), fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require(path.join(__dirname, '..', 'tools', 'node_modules', 'playwright-core'))); }
const args = process.argv.slice(2), file = path.resolve(args[0] || '');
const out = path.resolve(args[1] && !args[1].startsWith('--') ? args[1] : path.join(path.dirname(file), 'frames'));
const val = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const at = val('--at', '0,.06,.14,.22,.3,.4,.5,.58,.72,.8,.96').split(',').map(Number), wait = +val('--wait', 900), mobile = args.includes('--mobile');
fs.mkdirSync(out, { recursive: true });
(async () => {
  let browser; for (const channel of [undefined, 'msedge', 'chrome']) { try { browser = await chromium.launch(Object.assign({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] }, channel ? { channel } : {})); break; } catch (e) { if (channel === 'chrome') throw e; } }
  let problems = 0;
  for (const vp of [{ w: 1440, h: 900, n: 'p' }].concat(mobile ? [{ w: 390, h: 844, n: 'm' }] : [])) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    page.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) external.push(u); });
    for (const p of at) {
      await page.goto('file://' + file + '?p=' + p);
      await page.waitForFunction(() => window.__stageReady, null, { timeout: 20000 });
      await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${vp.n}_${String(Math.round(p * 1000)).padStart(3, '0')}.png`) });
    }
    if (errors.length) { console.log(`[${vp.n}] JS errors:\n  ` + [...new Set(errors)].slice(0, 8).join('\n  ')); problems += errors.length; }
    if (external.length) { console.log(`[${vp.n}] external requests (not offline):\n  ` + [...new Set(external)].slice(0, 8).join('\n  ')); problems++; }
    await page.close();
  }
  await browser.close();
  console.log(problems ? `\n${problems} problem(s). Frames: ${out}` : `\nno errors. Frames: ${out}`);
  process.exit(problems ? 1 : 0);
})();
