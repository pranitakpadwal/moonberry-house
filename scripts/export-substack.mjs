// Exports every published blog post to substack/, ready to paste into the Substack editor.
// Usage: node scripts/export-substack.mjs
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://themoonberryhouse.com';
const out = 'substack';
fs.mkdirSync(out, { recursive: true });
const dec = s => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const files = fs.readdirSync('blog').filter(f => f.endsWith('.html') && f !== 'index.html');
const posts = [];
// Newer auto-drafted posts have no own image; the site falls back to journal.jpg.
const imageFor = slug => `${SITE}/assets/blog/${fs.existsSync(`assets/blog/${slug}.jpg`) ? slug : 'journal'}.jpg`;


for (const f of files) {
  const h = fs.readFileSync(path.join('blog', f), 'utf8');
  const slug = f.replace('.html', '');
  const title = dec((h.match(/<h1 class="posttitle">([\s\S]*?)<\/h1>/) || [])[1] || slug);
  const desc = dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const date = (h.match(/article:published_time" content="([^"]*)"/) || [])[1] || '';
  let body = (h.match(/<article>([\s\S]*?)<\/article>/) || [])[1];
  if (!body) continue;
  body = body
    .replace(/<div class="quick"><strong>([^<]*)<\/strong>([\s\S]*?)<\/div>/g, '<blockquote><strong>$1:</strong> $2</blockquote>')
    .replace(/<div class="(tips|faq)">/g, '')
    .replace(/<\/div>/g, '')
    .replace(/<p class="[^"]*">/g, '<p>')
    .replace(/ id="[^"]*"/g, '')
    .replace(/href="\/([^"]*)"/g, `href="${SITE}/$1"`)
    .replace(/<blockquote><strong>([^<]*):<\/strong> <p>([\s\S]*?)<\/p>/g, '<blockquote><strong>$1:</strong> $2');
  const img = imageFor(slug);
  const canon = `${SITE}/blog/${slug}`;
  const html = `<!doctype html>
<meta charset="utf-8">
<title>${title}</title>
<!-- SUBSTACK: Title = the H1 below. Subtitle = the italic line. Cover image: ${img}
     In Settings > Search engine, set the canonical/"original URL" to ${canon} if you want SEO credit to the main site. -->
<h1>${title}</h1>
<p><em>${desc}</em></p>
${body.trim()}
<hr>
<p>Originally published on <a href="${canon}">The Moonberry House</a>. Explore our books and the free colour game at <a href="${SITE}/">themoonberryhouse.com</a>.</p>
`;
  fs.writeFileSync(path.join(out, `${date}-${slug}.html`), html);
  posts.push({ date, slug, title, desc });
}
posts.sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
fs.writeFileSync(path.join(out, 'posts.json'), JSON.stringify(posts, null, 2));
console.log(`Exported ${posts.length} posts`);

// RSS feed for Substack's importer (and readers): /feed.xml with full content.
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const items = posts.slice().sort((a, b) => b.date.localeCompare(a.date)).map(p => {
  const file = fs.readFileSync(path.join(out, `${p.date}-${p.slug}.html`), 'utf8');
  const content = file.split(/<h1>[\s\S]*?<\/h1>\s*<p><em>[\s\S]*?<\/em><\/p>/)[1]
    .replace(/<hr>[\s\S]*$/, '').trim();
  const img = imageFor(p.slug);
  const url = `${SITE}/blog/${p.slug}`;
  return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date + 'T06:00:00+05:30').toUTCString()}</pubDate>
      <dc:creator>The Moonberry Desk</dc:creator>
      <description>${esc(p.desc)}</description>
      <enclosure url="${img}" type="image/jpeg" length="0"/>
      <content:encoded><![CDATA[<img src="${img}" alt="${esc(p.title)}">${content.replace(/]]>/g, ']]&gt;')}<p>Originally published on <a href="${url}">The Moonberry House</a>.</p>]]></content:encoded>
    </item>`;
}).join('\n');
fs.writeFileSync('substack-feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Moonberry Journal</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/substack-feed.xml" rel="self" type="application/rss+xml"/>
    <description>Colour-coding play, creative hobbies and screen-free ideas for children, every kind of learner, and grown-ups too.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`);
console.log('Wrote substack-feed.xml');
