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
  const img = `${SITE}/assets/blog/${slug}.jpg`;
  const canon = `${SITE}/blog/${slug}`;
  const html = `<!doctype html>
<meta charset="utf-8">
<title>${title}</title>
<!-- SUBSTACK: Title = the H1 below. Subtitle = the italic line. Upload the cover image (assets/blog/${slug}.jpg).
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
