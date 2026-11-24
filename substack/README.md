# Moonberry Journal: Substack kit

Publication: https://themoonberryhouse.substack.com/
Regenerate files any time: `node scripts/export-substack.mjs`

## How to publish a post (about 2 minutes)
1. Substack > Dashboard > New post > Article.
2. Open the post's `.html` file in a browser, select all, copy, and paste into the editor (headings, bold, lists, links come through).
3. Title and subtitle: the H1 and italic line at the top of the file.
4. Upload the cover image named in the comment at the top of the file (own image, or the shared `journal.jpg`) as the post image.
5. Settings (right panel) > SEO: set the original URL to the matching `themoonberryhouse.com/blog/<slug>` link.
6. Schedule it, then publish.

## One-time setup
- Settings > Domain: use a subdomain such as `journal.themoonberryhouse.com`, then add the DNS record Substack shows at your registrar.
- Settings > Welcome email: paste `00-welcome-to-the-moonberry-journal.html`.
- Add logo (`favicon.svg`/`og-image.png`), the About page, and the website subscribe link.

## Suggested schedule (3 per week)
| Week | Mon | Wed | Fri |
|---|---|---|---|
| 1 | Welcome | Why colouring calms the mind | Ten rainy-day colouring games |
| 2 | Colour coding feelings | Why your toddler fights bedtime | Why reading aloud still matters |
| 3 | Mindful colouring 10-minute ritual | Will two languages confuse my toddler? | Sensory-friendly colouring |
| 4 | What colours mean to kids | What your kid's drawings are telling you | When kids colour outside the lines |
| 5 | Why Grandma's Marathi stories matter | Journaling helps kids express feelings | iPad vs reading |
| 6 | The lost art of getting mail | Why kids who never write by hand struggle | (new post) |
