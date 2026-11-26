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
const AUTHOR = 'The Moonberry Desk';   // house byline, matches /authors/#desk
const DEFAULT_IMAGE = { url: 'https://themoonberryhouse.com/assets/blog/journal.jpg', width: 1600, height: 900 };
const CHECK_ONLY = process.argv.includes('--check');

const CATEGORIES = JSON.parse(read('content/categories.json'));
const SITE_GRAPH = JSON.parse(read('content/site-graph.json'));   // Organization, WebSite, nav (shared with the hand-built pages)
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
// In publish mode a bad post is skipped with a warning so the rest still go out.
// With --check any problem fails the run.
const fail = (msg) => { console.error((CHECK_ONLY ? 'ERROR: ' : '::warning::') + msg); if (CHECK_ONLY) process.exitCode = 1; };

// ---------- today (Asia/Kolkata) ----------
const TODAY = process.env.TODAY ||
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
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
      const id = m[2].toLowerCase().replace(/&/g, 'and').replace(/['’?]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (m[1].length === 2) state.toc.push({ id, text: m[2] });
      out.push(`<h${m[1].length} id="${id}">${inline(m[2])}</h${m[1].length}>`); i++;
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
    } else if (/^Warmly, Pranita$/.test(line)) {
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
function renderMarkdown(md) {
  const state = { first: false, toc: [] };   // the quick-answer box plays the lede role
  const html = renderBlocks(md.split('\n'), state);
  return { html, toc: state.toc };
}

// FAQ: "## Frequently asked questions" followed by "### Question?" + answer paragraph(s)
function extractFaq(md) {
  const m = md.match(/^##\s+(?:frequently asked questions|faqs?|common questions)[^\n]*\n([\s\S]*?)(?=^##\s|^:::|^Warmly, Pranita|$(?![\s\S]))/im);
  if (!m) return [];
  return m[1].split(/^###\s+/m).slice(1).map((blk) => {
    const [q, ...rest] = blk.trim().split('\n');
    const a = rest.join(' ').replace(/\*\*?|\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
    return { q: q.trim(), a };
  }).filter((x) => x.q && x.a);
}
const plain = (s) => s.replace(/\*\*?/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

// ---------- shared HTML pieces ----------
const FOOT = `<footer class="sitefoot">
  ${BERRIES}
  <p>The Moonberry House · colour books, journals &amp; stories for every kind of mind</p>
  <p><a href="${SITE}">themoonberryhouse.com</a> · <a href="/privacy/">Privacy &amp; cookies</a> · <a href="#" data-cookie-settings>Cookie settings</a> · <a href="/authors/">Our writers</a></p>
</footer>`;

function head({ title, description, canonical, type, keywords, jsonld, published, modified }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="author" content="${AUTHOR}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#3D2E72">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="The Moonberry Journal" href="/feed.xml">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="The Moonberry House">
<meta property="og:title" content="${esc(title.replace(/ \| The Moonberry Journal$/, ''))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${DEFAULT_IMAGE.url}">
<meta property="og:image:width" content="${DEFAULT_IMAGE.width}">
<meta property="og:image:height" content="${DEFAULT_IMAGE.height}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${DEFAULT_IMAGE.url}">
${published ? `<meta property="article:published_time" content="${published}">\n<meta property="article:modified_time" content="${modified || published}">\n<meta property="article:author" content="${AUTHOR}">\n` : ''}<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="stylesheet" href="/assets/blog.css">
<meta name="google-site-verification" content="DkJ-5eQgaqEalvf2IYY3YDG_DGmVP6lji345Xc6qkvM" />
<script src="/assets/consent.js" defer></script>
<link rel="stylesheet" href="/assets/nav.css">
<script src="/assets/nav.js" defer></script>
</head>`;
}
const NAV_LINKS = [['Play', '/play/'], ['Stories', '/stories/'], ['Web Stories', '/web-stories/'], ['For every mind', '/everyone/'], ['Grown-ups', '/grownups/'], ['Parents', '/parents/'], ['Books', '/books/'], ['Journal', '/blog/']];
// Site-wide menu (styles: /assets/nav.css, behaviour: /assets/nav.js). Journal is always the current section here.
const SITE_NAV = `<a class="sn-skip" href="#main" style="position:absolute;left:-9999px">Skip to content</a>
<header class="sn-header"><div class="sn-bar"><a class="sn-brand" href="/" aria-label="The Moonberry House"><img src="/favicon.svg" alt="" width="36" height="36"><span>The Moonberry House</span></a><nav class="sn-nav" id="snNav" aria-label="Main">${NAV_LINKS.map(([n, u]) => `<a href="${u}"${u === '/blog/' ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav><button class="sn-menu" id="snMenu" type="button" aria-expanded="false" aria-controls="snNav" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div></header>
`;
const masthead = (inner, back = '<a class="backlink" href="/blog/">← All posts</a>') => `<body>
${SITE_NAV}<div class="masthead">
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
  if (!meta.summary) problems.push('missing "summary" (the 30-60 word direct answer)');
  if (body.includes('—')) problems.push('contains an em dash');
  if (extractFaq(body).length < 3) problems.push('needs a "## Frequently asked questions" section with at least 3 "### Question?" entries');
  if (problems.length) { fail(`${f}: ${problems.join('; ')}`); continue; }
  slugs.add(slug);
  const words = body.split(/\s+/).length;
  all.push({ ...meta, slug, body, words, read: meta.read || Math.max(2, Math.round(words / 200)) });
}

const perDay = {};
for (const p of all) perDay[p.date] = (perDay[p.date] || 0) + 1;
const seen = {};
for (const p of all) {
  seen[p.date] = (seen[p.date] || 0) + 1;
  if (seen[p.date] > MAX_PER_DAY) { p.held = true; if (seen[p.date] === MAX_PER_DAY + 1) fail(`${perDay[p.date]} posts dated ${p.date}: only the first ${MAX_PER_DAY} go out (max ${MAX_PER_DAY} per day)`); }
}

const live = all.filter((p) => p.date <= TODAY && p.draft !== 'true' && !p.held);
const scheduled = all.filter((p) => p.date > TODAY && p.draft !== 'true');
const drafts = all.filter((p) => p.draft === 'true');

// legacy hand-written posts (already published as standalone html)
const legacy = JSON.parse(read('content/legacy-posts.json')).map((p) => ({ ...p, legacy: true }));
const timeline = [...live.map((p) => ({ ...p, legacy: false })), ...legacy]
  .sort((a, b) => (a.date === b.date ? (a.slug < b.slug ? 1 : -1) : a.date < b.date ? 1 : -1));

// ---------- post pages ----------
const ORG_REF = { '@id': `${SITE}/#organization` };
const DESK = { '@type': 'Organization', name: AUTHOR, url: `${SITE}/authors/#desk` };
const BLOG_REF = { '@id': `${SITE}/blog/#blog` };
const IMAGE_OBJ = { '@type': 'ImageObject', ...DEFAULT_IMAGE };

function postPage(p) {
  const cat = CATEGORIES[p.category];
  const url = `${SITE}/blog/${p.slug}`;
  const related = live.filter((o) => o.slug !== p.slug && o.category === p.category)
    .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
  const relatedHtml = related.length
    ? `<div class="related"><h3>Keep reading</h3><ul>${related.map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`).join('')}</ul></div>` : '';
  const { html, toc } = renderMarkdown(p.body);
  const faq = extractFaq(p.body);
  const modified = p.updated || p.date;
  const graph = [
    ...SITE_GRAPH,
    {
      '@type': 'Article', '@id': `${url}#article`, headline: p.title, description: p.description, abstract: p.summary,
      image: IMAGE_OBJ, datePublished: p.date, dateModified: modified, author: DESK, publisher: ORG_REF,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }, isPartOf: BLOG_REF,
      articleSection: cat.label, keywords: p.keywords, inLanguage: 'en', wordCount: p.words,
      articleBody: plain(p.body).replace(/^[#:>-]+\s*/gm, '').replace(/\s+/g, ' ').trim(),
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.quick'] },
    },
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Journal', item: SITE + '/blog/' },
        { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE}/blog/category/${p.category}/` },
        { '@type': 'ListItem', position: 4, name: p.title, item: url },
      ],
    },
    faq.length && {
      '@type': 'FAQPage', '@id': `${url}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ].filter(Boolean);
  const tocHtml = toc.length > 2
    ? `<nav class="toc" aria-label="In this post"><strong>In this post</strong><ol>${toc.map((t) => `<li><a href="#${t.id}">${inline(t.text)}</a></li>`).join('')}</ol></nav>` : '';
  return head({
    title: `${p.title} | The Moonberry Journal`, description: p.description, canonical: url, type: 'article',
    keywords: p.keywords, jsonld: { '@context': 'https://schema.org', '@graph': graph }, published: p.date, modified,
  }) + '\n' + masthead(`${tagHtml(cat)}
    <h1 class="posttitle">${esc(p.title)}</h1>
    <p class="meta"><span>Published <time datetime="${p.date}">${human(p.date)}</time></span>${modified !== p.date ? `<span>Updated <time datetime="${modified}">${human(modified)}</time></span>` : ''}<span>${p.read} min read</span><span>By <a class="byline" href="/authors/#desk">${AUTHOR}</a></span></p>`) + `

<main class="wrap" id="main">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog/">Journal</a> › <a href="/blog/category/${p.category}/">${esc(cat.label)}</a></nav>
  <article>
    <div class="quick"><strong>Quick answer</strong><p>${inline(p.summary)}</p></div>
    ${tocHtml}
    ${html}
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
    title: `${title} | Kids' Colouring, Calm & Storytelling Blog | The Moonberry House`,
    description: canonicalDesc, canonical: url, type: 'website',
    jsonld: { '@context': 'https://schema.org', '@graph': [
      ...SITE_GRAPH,
      { '@type': 'Blog', '@id': `${SITE}/blog/#blog`, name: 'The Moonberry Journal', url: `${SITE}/blog/`, description: canonicalDesc, inLanguage: 'en', publisher: ORG_REF, image: IMAGE_OBJ },
      { '@type': 'CollectionPage', '@id': `${url}#page`, name: title, url, isPartOf: BLOG_REF },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Journal', item: SITE + '/blog/' },
        ...(active ? [{ '@type': 'ListItem', position: 3, name: title, item: url }] : []),
      ] },
    ] },
  }) + '\n' + masthead(`<h1 class="blogtitle">${esc(title)}</h1>
    <p class="tagline">${esc(intro)}</p>`, '<a class="backlink" href="/">← Home</a>') + `

<main class="wrap" id="main">
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

// sitemap.xml (keeps the lastmod already on file for pages this script doesn't own)
const existing = {};
try { for (const m of read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)) existing[m[1].replace(SITE, '')] = m[2]; } catch {}
const STATIC = ['/', '/play/', '/stories/', '/web-stories/', '/everyone/', '/grownups/', '/parents/', '/books/', '/about/', '/authors/', '/privacy/', '/blog/',
  '/books/mama-goose-and-the-missing-little-star/', '/books/halloween-coloring-book/', '/books/my-big-vehicle-coloring-and-activity-book/',
  '/books/safari-snapshots/', '/books/paint-your-peace/',
  '/web-stories/mama-goose-and-the-missing-little-star/',
  '/web-stories/a-friendly-halloween/',
  '/web-stories/paint-your-peace-a-gentle-pause/',
  '/web-stories/my-big-vehicle-adventure/',
  '/web-stories/safari-snapshots-animal-adventure/'];
const newest = timeline[0] ? timeline[0].date : TODAY;
const urls = [
  ...STATIC.map((u) => ({ loc: u, lastmod: u === '/blog/' ? newest : existing[u] || TODAY })),
  ...Object.keys(CATEGORIES).filter((k) => timeline.some((p) => p.category === k)).map((k) => ({ loc: `/blog/category/${k}/`, lastmod: timeline.find((p) => p.category === k).date })),
  ...timeline.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updated || p.date })),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`);

// news-sitemap.xml: the existing posts plus anything published in the last 2 days (Google News's window)
const cutoff = addDays(TODAY, -2);
const newsItems = timeline.filter((p) => p.legacy || p.date >= cutoff).sort((a, b) => (a.date < b.date ? 1 : -1));
write('news-sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsItems.map((p) => `  <url>
    <loc>${SITE}/blog/${p.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>The Moonberry Journal</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${p.date}</news:publication_date>
      <news:title>${esc(p.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
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

// llms.txt: a plain-text map of the site for AI assistants and answer engines
const byCat = Object.entries(CATEGORIES).map(([k, c]) => {
  const items = timeline.filter((p) => p.category === k);
  return items.length ? `\n### ${c.label}\n${items.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`).join('\n')}` : '';
}).join('\n');
write('llms.txt', `# The Moonberry House

> The Moonberry House makes colouring books, a painting journal and picture books for every kind of mind, in English and Marathi (मराठी). Founded by Pranita Padwal. The blog, The Moonberry Journal, covers colouring and creativity for children, calm and feelings, activities for autistic, ADHD and sensory-sensitive children, and mindful colouring for adults and teens looking for inner peace. It is a play-and-learning space, not a therapy or medical service.

## Main pages
- [Home](${SITE}/): what the house is about
- [Books](${SITE}/books/): five books on Amazon (picture book, colouring books, a painting journal)
- [Play](${SITE}/play/): a free colour-by-number game with no timers or scores
- [For every mind](${SITE}/everyone/): gentle, accessible design for different kinds of minds
- [For grown-ups](${SITE}/grownups/): quiet creative rituals for adults
- [For parents](${SITE}/parents/): a screen-free week of small activities
- [About](${SITE}/about/): the founder, Pranita Padwal
- [Our writers](${SITE}/authors/): who writes the Journal
- [Blog](${SITE}/blog/): The Moonberry Journal (RSS: ${SITE}/feed.xml)

## Blog posts
${byCat}
`);

console.log(`today ${TODAY}: ${live.length} auto-posts live, ${scheduled.length} scheduled, ${drafts.length} drafts, ${legacy.length} legacy posts`);
if (scheduled.length) {
  const last = scheduled.map((p) => p.date).sort().pop();
  console.log(`queue runs through ${last}`);
}
