#!/usr/bin/env node
// Builds the Moonberry Journal from content/posts/*.md (zero dependencies).
//
//   node scripts/build-blog.mjs            build everything whose date is <= today (India time)
//   TODAY=2026-12-01 node scripts/build-blog.mjs   pretend it is another day (for testing)
//   node scripts/build-blog.mjs --check    validate only, write nothing
//
// A post is "scheduled" until its `date` arrives. Nothing in the future is rendered,
// listed, put in the sitemap or in the feed. Max MAX_PER_DAY posts may share a date.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://themoonberryhouse.com';
const MAX_PER_DAY = 3;
const PAGE_SIZE = 20;
const AUTHOR = 'Pranita Padwal';
const CHECK_ONLY = process.argv.includes('--check');

const CATEGORIES = JSON.parse(read('content/categories.json'));
const LOGO = read('scripts/logo.svg.txt');
const BERRIES = read('scripts/berries.svg.txt');

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function write(p, s) {
  if (CHECK_ONLY) return;
  const f = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = (msg) => { console.error('ERROR: ' + msg); process.exitCode = 1; };

// ---------- today (Asia/Kolkata) ----------
const TODAY = process.env.TODAY ||
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const human = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

// ---------- front matter ----------
function parsePost(file) {
  const raw = read(file).replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const k = line.match(/^([a-z_]+):\s*(.*)$/);
    if (k) meta[k[1]] = k[2].trim().replace(/^"(.*)"$/, '$1');
  }
  return { file, meta, body: m[2].trim() };
}

// ---------- tiny markdown ----------
function inline(s) {
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  return s;
}
function renderBlocks(lines, state) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if (line.startsWith(':::')) {                       // :::tips Title  ...  :::
      const title = line.slice(3).trim().replace(/^tips\s*/, '') || 'A few things worth knowing';
      const inner = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(':::')) inner.push(lines[i++]);
      i++;
      out.push(`<div class="tips"><h3>${inline(title)}</h3>${renderBlocks(inner, state)}</div>`);
    } else if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++;
    } else if (line.startsWith('> ')) {
      const q = [];
      while (i < lines.length && lines[i].startsWith('> ')) q.push(lines[i++].slice(2));
      out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
    } else if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ''));
      out.push(`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
    } else if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+[.)]\s+/, ''));
      out.push(`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`);
    } else if (/^— /.test(line) && i === lines.length - 1) {
      out.push(`<p class="signoff">${inline(line)}</p>`); i++;
    } else {
      const p = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|> |[-*]\s|\d+[.)]\s|:::)/.test(lines[i])) p.push(lines[i++]);
      const cls = state.first ? ' class="lede"' : '';
      state.first = false;
      out.push(`<p${cls}>${inline(p.join(' '))}</p>`);
    }
  }
  return out.join('\n    ');
}
const renderMarkdown = (md) => renderBlocks(md.split('\n'), { first: true });

// ---------- shared HTML pieces ----------
const FOOT = `<footer class="sitefoot">
  ${BERRIES}
  <p>The Moonberry House · colour books, journals &amp; stories for every kind of mind</p>
  <p><a href="${SITE}">themoonberryhouse.com</a></p>
</footer>`;

function head({ title, description, canonical, type, keywords, jsonld, published }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#3D2E72">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="The Moonberry Journal" href="/feed.xml">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="The Moonberry House">
<meta property="og:title" content="${esc(title.replace(/ — The Moonberry Journal$/, ''))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
${published ? `<meta property="article:published_time" content="${published}">\n<meta property="article:author" content="${AUTHOR}">\n` : ''}<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="stylesheet" href="/assets/blog.css">
</head>`;
}
const masthead = (inner, back = '<a class="backlink" href="/blog/">← All posts</a>') => `<body>
<div class="masthead">
  <div class="masthead-inner">
    <div class="topbar">
      <a class="brandmark" href="/">
        ${LOGO}
        <span>The Moonberry House</span>
      </a>
      ${back}
    </div>
    ${inner}
  </div>
</div>`;

const tagHtml = (cat) => `<span class="tag${cat.tagClass ? ' ' + cat.tagClass : ''}">${esc(cat.label)}</span>`;

// ---------- load posts ----------
const files = fs.readdirSync(path.join(ROOT, 'content/posts')).filter((f) => f.endsWith('.md')).sort();
const all = [];
const slugs = new Set();
for (const f of files) {
  const { meta, body } = parsePost('content/posts/' + f);
  const slug = f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  const problems = [];
  for (const k of ['title', 'description', 'category', 'date']) if (!meta[k]) problems.push(`missing "${k}"`);
  if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) problems.push('date must be YYYY-MM-DD');
  if (meta.category && !CATEGORIES[meta.category]) problems.push(`unknown category "${meta.category}"`);
  if (slugs.has(slug)) problems.push('duplicate slug');
  if (meta.description && meta.description.length > 200) problems.push('description > 200 chars');
  if (problems.length) { fail(`${f}: ${problems.join('; ')}`); continue; }
  slugs.add(slug);
  const words = body.split(/\s+/).length;
  all.push({ ...meta, slug, body, words, read: meta.read || Math.max(2, Math.round(words / 200)) });
}

const perDay = {};
for (const p of all) perDay[p.date] = (perDay[p.date] || 0) + 1;
for (const [d, n] of Object.entries(perDay)) if (n > MAX_PER_DAY) fail(`${n} posts dated ${d} (max ${MAX_PER_DAY} per day)`);

const live = all.filter((p) => p.date <= TODAY && p.draft !== 'true');
const scheduled = all.filter((p) => p.date > TODAY && p.draft !== 'true');
const drafts = all.filter((p) => p.draft === 'true');

// legacy hand-written posts (already published as standalone html)
const legacy = JSON.parse(read('content/legacy-posts.json')).map((p) => ({ ...p, legacy: true }));
const timeline = [...live.map((p) => ({ ...p, legacy: false })), ...legacy]
  .sort((a, b) => (a.date === b.date ? (a.slug < b.slug ? 1 : -1) : a.date < b.date ? 1 : -1));

// ---------- post pages ----------
function postPage(p) {
  const cat = CATEGORIES[p.category];
  const url = `${SITE}/blog/${p.slug}`;
  const related = live.filter((o) => o.slug !== p.slug && o.category === p.category)
    .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
  const relatedHtml = related.length
    ? `<div class="related"><h3>Keep reading</h3><ul>${related.map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`).join('')}</ul></div>` : '';
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.date,
    author: { '@type': 'Person', name: AUTHOR },
    publisher: { '@type': 'Organization', name: 'The Moonberry House', logo: { '@type': 'ImageObject', url: `${SITE}/apple-touch-icon.png` } },
    image: `${SITE}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  return head({
    title: `${p.title} — The Moonberry Journal`, description: p.description, canonical: url, type: 'article',
    keywords: p.keywords, jsonld, published: p.date,
  }) + '\n' + masthead(`${tagHtml(cat)}
    <h1 class="posttitle">${esc(p.title)}</h1>
    <p class="meta"><span>${human(p.date)}</span><span>${p.read} min read</span><span>By ${AUTHOR}</span></p>`) + `

<main class="wrap">
  <article>
    ${renderMarkdown(p.body)}
${cat.note ? `\n    <p class="note">${esc(cat.note)}</p>\n` : ''}
    <div class="shelfcta">
      <h3>${esc(cat.cta.title)}</h3>
      <p>${esc(cat.cta.text)}</p>
      <a href="${cat.cta.href}">${esc(cat.cta.button)}</a>
    </div>
    ${relatedHtml}
  </article>

  <div class="postfooter">
    <a href="/blog/">← Back to all posts</a>
    <a href="/blog/category/${p.category}/">More in ${esc(cat.label)} →</a>
  </div>
</main>

${FOOT}
</body>
</html>
`;
}

// ---------- listing pages ----------
const card = (p) => {
  const cat = CATEGORIES[p.category];
  return `    <a class="postcard" href="/blog/${p.slug}">
      ${tagHtml(cat)}
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.description)}</p>
      <span class="readmore">Read the post →</span>
    </a>`;
};
const chips = (active) => `<nav class="chips" aria-label="Topics">${
  [['', 'All posts'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])]
    .map(([k, l]) => `<a href="${k ? `/blog/category/${k}/` : '/blog/'}"${k === active ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')
}</nav>`;

function listing({ items, baseUrl, pageNo, pages, title, intro, active, canonicalDesc }) {
  const url = SITE + (pageNo === 1 ? baseUrl : `${baseUrl}page/${pageNo}/`);
  const slice = items.slice((pageNo - 1) * PAGE_SIZE, pageNo * PAGE_SIZE);
  const pager = pages > 1 ? `<div class="pager"><span>${pageNo > 1 ? `<a href="${pageNo === 2 ? baseUrl : `${baseUrl}page/${pageNo - 1}/`}">← Newer posts</a>` : ''}</span><span>${pageNo < pages ? `<a href="${baseUrl}page/${pageNo + 1}/">Older posts →</a>` : ''}</span></div>` : '';
  return head({
    title: `${title} | Kids' Colouring, Calm & Storytelling Blog — The Moonberry House`,
    description: canonicalDesc, canonical: url, type: 'website',
    jsonld: { '@context': 'https://schema.org', '@type': 'Blog', name: 'The Moonberry Journal', url: `${SITE}/blog/`, publisher: { '@type': 'Organization', name: 'The Moonberry House', logo: `${SITE}/apple-touch-icon.png` } },
  }) + '\n' + masthead(`<h1 class="blogtitle">${esc(title)}</h1>
    <p class="tagline">${esc(intro)}</p>`, '<a class="backlink" href="/">← Home</a>') + `

<main class="wrap">
  ${chips(active)}
  <div class="postgrid">
${slice.map(card).join('\n')}
  </div>
  ${pager}
  <p class="comingsoon">A new post (or two) most days. <a href="/feed.xml">RSS feed</a></p>
</main>

${FOOT}
</body>
</html>
`;
}

function writeListing({ items, baseUrl, dir, ...rest }) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  for (let n = 1; n <= pages; n++) {
    write(n === 1 ? `${dir}/index.html` : `${dir}/page/${n}/index.html`, listing({ items, baseUrl, pageNo: n, pages, ...rest }));
  }
}

// ---------- write everything ----------
for (const p of live) write(`blog/${p.slug}.html`, postPage(p));

writeListing({
  items: timeline, baseUrl: '/blog/', dir: 'blog', title: 'The Moonberry Journal',
  intro: 'Notes on colour, calm and growing up, for kids, for every kind of mind, and for the grown-ups who love them.',
  active: '', canonicalDesc: 'Notes on colouring, creativity, calm and storytelling: gentle reading for parents, kids, neurodiverse families and anyone looking for a little inner peace.',
});
for (const [key, cat] of Object.entries(CATEGORIES)) {
  const items = timeline.filter((p) => p.category === key);
  if (!items.length) continue;
  writeListing({
    items, baseUrl: `/blog/category/${key}/`, dir: `blog/category/${key}`, title: cat.label,
    intro: cat.intro, active: key, canonicalDesc: cat.intro,
  });
}

// sitemap
const STATIC = ['/', '/play/', '/everyone/', '/grownups/', '/parents/', '/books/', '/about/', '/blog/'];
const urls = [
  ...STATIC.map((u) => ({ loc: u })),
  ...Object.keys(CATEGORIES).filter((k) => timeline.some((p) => p.category === k)).map((k) => ({ loc: `/blog/category/${k}/` })),
  ...timeline.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.date })),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);

// RSS feed (also handy for auto-posting to social via Zapier / IFTTT / Buffer)
const rfc822 = (iso) => new Date(iso + 'T06:00:00+05:30').toUTCString();
write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Moonberry Journal</title>
  <link>${SITE}/blog/</link>
  <description>Notes on colour, calm and growing up from The Moonberry House.</description>
  <language>en</language>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${timeline.slice(0, 30).map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/blog/${p.slug}</link>
    <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
    <pubDate>${rfc822(p.date)}</pubDate>
    <category>${esc(CATEGORIES[p.category].label)}</category>
    <description>${esc(p.description)}</description>
  </item>`).join('\n')}
</channel>
</rss>
`);

console.log(`today ${TODAY}: ${live.length} auto-posts live, ${scheduled.length} scheduled, ${drafts.length} drafts, ${legacy.length} legacy posts`);
if (scheduled.length) {
  const last = scheduled.map((p) => p.date).sort().pop();
  console.log(`queue runs through ${last}`);
}
