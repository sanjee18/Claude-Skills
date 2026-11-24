#!/usr/bin/env node
/* Smoke test for decks built with build.py.
   Setup once:  cd scripts && npm i playwright && npx playwright install chromium
   Usage:       node scripts/check.cjs out/Name_v1.html [shots-dir]
   Checks: JS errors, every page + sub page enters, content taller than the viewport, horizontal overflow; screenshots at
   1440x900 and 390x844. Exit code 1 on errors. */
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  try { ({ chromium } = require(path.join(__dirname, '..', 'tools', 'node_modules', 'playwright-core'))); }
  catch (e2) { console.error('Einmalig: cd tools && npm i playwright-core   (nutzt installiertes Edge/Chrome)'); process.exit(2); } }

(async () => {
  const file = path.resolve(process.argv[2] || '');
  if (!fs.existsSync(file)) { console.error('file not found: ' + file); process.exit(2); }
  const out = path.resolve(process.argv[3] || path.join(path.dirname(file), 'shots')); fs.mkdirSync(out, { recursive: true });
  let browser; for (const channel of [undefined, 'msedge', 'chrome']) { try { browser = await chromium.launch(channel ? { channel } : {}); break; } catch (e) { if (channel === 'chrome') throw e; } }
  let problems = 0;
  for (const vp of [{ w: 1440, h: 900, n: 'desktop' }, { w: 390, h: 844, n: 'mobile' }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    const external = []; page.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u); });
    await page.goto('file://' + file); await page.waitForFunction(() => window.Deck && Deck.pages().length, null, { timeout: 8000 });
    const ids = await page.evaluate(() => Deck.pages()), subs = await page.evaluate(() => Deck.subIds());
    const wait = ms => page.waitForTimeout(ms);
    for (const id of ids) {
      await page.evaluate(i => Deck.go(i), id); await wait(2600);
      const r = await page.evaluate(i => { const s = document.querySelector('.stage[data-id="' + i + '"]'); const inn = s.firstElementChild; return { over: inn.scrollHeight - inn.clientHeight, hx: document.documentElement.scrollWidth > innerWidth + 2, entered: s.classList.contains('entered') }; }, id);
      if (!r.entered) { console.log(`[${vp.n}] ${id}: NOT entered`); problems++; }
      if (r.over > 4 && vp.n === 'desktop') { console.log(`[${vp.n}] ${id}: content ${r.over}px taller than the screen (shorten text / fewer items)`); problems++; }
      if (r.hx) { console.log(`[${vp.n}] ${id}: horizontal overflow`); problems++; }
      await page.screenshot({ path: path.join(out, `${vp.n}_${id}.png`) });
    }
    for (const id of subs) {
      await page.evaluate(() => Deck.go(0)); await wait(1200);
      const ok = await page.evaluate(async i => { const b = document.querySelector('[data-open="' + i + '"]'); if (!b) return 'no-trigger'; const hub = b.closest('.stage'); await Deck.go(hub.dataset.id); await new Promise(r => setTimeout(r, 2200)); b.click(); await new Promise(r => setTimeout(r, 2200)); return Deck.current() === i ? 'ok' : 'failed'; }, id);
      if (ok !== 'ok') { console.log(`[${vp.n}] sub ${id}: ${ok}`); problems++; } else await page.screenshot({ path: path.join(out, `${vp.n}_sub_${id}.png`) });
      await page.evaluate(() => Deck.back()); await wait(1200);
    }
    errors.forEach(e => { console.log(`[${vp.n}] JS error: ${e}`); problems++; });
    if (external.length) { console.log(`[${vp.n}] external requests (not offline!): ${[...new Set(external)].join(', ')}`); problems++; }
    await page.close();
  }
  await browser.close();
  console.log(problems ? `\n${problems} problem(s). Screenshots: ${out}` : `\nno errors. Screenshots: ${out}`);
  process.exit(problems ? 1 : 0);
})();
