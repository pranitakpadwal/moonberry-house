// Renders a 1600x900 branded cover for every post that has no image of its own.
// Usage: node scripts/render-covers.mjs   (needs Playwright + Chromium)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = process.cwd();
const logo = fs.readFileSync('scripts/logo.svg.txt', 'utf8');
const cats = JSON.parse(fs.readFileSync('content/categories.json', 'utf8'));
const dec = s => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = f => `file://${path.join(root, 'fonts', f)}`;

const jobs = [];
for (const f of fs.readdirSync('content/posts')) {
  const m = fs.readFileSync(path.join('content/posts', f), 'utf8');
  const slug = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
  if (fs.existsSync(`assets/blog/${slug}.jpg`)) continue;
  const title = (m.match(/^title:\s*(.+)$/m) || [])[1];
  const cat = (m.match(/^category:\s*(.+)$/m) || [])[1].trim();
  jobs.push({ slug, title: dec(title.replace(/^["']|["']$/g, '')), label: (cats[cat]?.label || '').toUpperCase() });
}
const stars = Array.from({ length: 60 }, (_, i) => {
  const r = n => ((Math.sin(i * 9301 + n * 49297) * 233280) % 1 + 1) % 1;
  return `<i style="left:${r(1) * 100}%;top:${r(2) * 80}%;width:${2 + r(3) * 5}px;height:${2 + r(3) * 5}px;opacity:${0.4 + r(4) * 0.5}"></i>`;
}).join('');

const page = j => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Baloo;font-weight:500 800;src:url(${font('baloo-500-800-latin.woff2')})}
@font-face{font-family:Mukta;font-weight:600;src:url(${font('mukta-600-latin.woff2')})}
@font-face{font-family:Mukta;font-weight:700;src:url(${font('mukta-700-latin.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1600px;height:900px;overflow:hidden;position:relative;background:linear-gradient(180deg,#241B4E 0%,#3D2E72 55%,#7352A0 100%);font-family:Mukta}
i{position:absolute;background:#fff;border-radius:50%}
.glow{position:absolute;right:-100px;top:-250px;width:900px;height:900px;background:radial-gradient(circle,rgba(255,235,200,.28),transparent 65%)}
.text{position:absolute;left:110px;top:0;bottom:0;width:860px;display:flex;flex-direction:column;justify-content:center;gap:34px;padding-bottom:40px}
.pill{align-self:flex-start;background:#FFC857;color:#3D2E72;font-weight:700;font-size:30px;letter-spacing:3px;padding:14px 26px;border-radius:40px}
h1{font-family:Baloo;font-weight:800;font-size:${j.title.length > 60 ? 62 : 72}px;line-height:1.12;color:#FFF6E0}
.by{color:#D9CFF5;font-weight:600;font-size:34px}
.moon{position:absolute;right:110px;top:215px;width:430px;height:430px}
.moon svg{width:100%;height:100%}
.snow{position:absolute;left:0;right:0;bottom:0;height:70px}
</style><div class="glow"></div>${stars}
<div class="text"><div class="pill">${esc(j.label)}</div><h1>${esc(j.title)}</h1><div class="by">The Moonberry House · themoonberryhouse.com</div></div>
<div class="moon">${logo}</div>
<svg class="snow" viewBox="0 0 1600 70" preserveAspectRatio="none"><path d="M0,30 Q400,0 800,22 T1600,18 V70 H0Z" fill="#FFFBF2"/></svg>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
for (const j of jobs) {
  const pg = await ctx.newPage();
  const tmp = `/tmp/cover-${j.slug}.html`;
  fs.writeFileSync(tmp, page(j));
  await pg.goto('file://' + tmp);
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `assets/blog/${j.slug}.jpg`, type: 'jpeg', quality: 88 });
  await pg.close();
  console.log('made', j.slug);
}
await browser.close();
