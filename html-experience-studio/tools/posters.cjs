#!/usr/bin/env node
/* Render one still per library item (assets/library/posters/<kind>__<id>.jpg). The library shows them instantly and uses
   them as fallback where live iframes are blocked (e.g. sandboxed previews inside chat apps).
   Usage (after python scripts/build_library.py, which writes tools/_preview.html):
     node tools/posters.cjs            # all items
     node tools/posters.cjs design     # only one kind
   Then run python scripts/build_library.py again to embed the stills. */
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
let chromium; try { ({ chromium } = require(path.join(__dirname, 'node_modules', 'playwright-core'))); } catch (e) { console.error('cd tools && npm i playwright-core'); process.exit(2); }
const lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'library.json'), 'utf8'));
const designs = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'designs', 'designs.json'), 'utf8')).designs;
const items = designs.map(d => Object.assign({}, d, { kind: 'design' })).concat([{ kind: 'scene', id: 'model' }], lib.items.filter(i => !i.retired)).filter(i => !process.argv[2] || i.kind === process.argv[2] || i.id === process.argv[2]);
const worldUrl = it => require('url').pathToFileURL(path.join(ROOT, 'tools', '_worlds', it.file + '.html')).href + '#' + (it.poster || '');
const out = path.join(ROOT, 'assets', 'library', 'posters'); fs.mkdirSync(out, { recursive: true });
const wait = it => it.kind === 'sig' ? 2600 : it.kind === 'world' ? 2400 : it.kind === 'scene' ? 4300 : it.kind === 'design' ? 3800 : it.kind === 'cam' ? 3500 : it.kind === 'tr' ? 3150 : it.kind === 'tx' ? 650 : 2200;
(async () => {
  let browser; for (const channel of ['msedge', 'chrome', undefined]) { try { browser = await chromium.launch(Object.assign({ args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] }, channel ? { channel } : {})); break; } catch (e) { if (!channel) throw e; } }
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 });
  const url = 'file:///' + path.join(ROOT, 'tools', '_preview.html').replace(/\\/g, '/');
  for (const it of items) {
    const cfg = encodeURIComponent(JSON.stringify({ kind: it.kind, id: it.id, name: it.name, theme: 'midnight', demo: it.demo, set: it.set }));
    await page.goto('about:blank'); await page.goto(it.file ? worldUrl(it) : url + '#' + cfg);
    await page.waitForTimeout(wait(it));
    await page.screenshot({ path: path.join(out, it.kind + '__' + it.id + '.jpg'), type: 'jpeg', quality: 55 });
    process.stdout.write('.');
  }
  console.log('\nOK', items.length, 'stills ->', out);
  await browser.close();
})();
