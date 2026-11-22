# Blog automation

- `posts/YYYY-MM-DD-slug.md`, one file per post. It goes live on the date in its name/front matter (India time). Max 3 per day (the build fails otherwise).
- `topics.json`, backlog of topic ideas. Add your own; status `pending` gets picked up.
- `categories.json`, categories, disclaimers and call-to-action boxes.
- Daily publish: `.github/workflows/publish.yml` (06:00 IST). Weekly drafting: `.github/workflows/generate.yml` (needs repo secret `ANTHROPIC_API_KEY`).
- To stop a scheduled post: delete its file, or add `draft: true` to the front matter. To edit: edit the file before its date.
- Locally: `node scripts/build-blog.mjs`, `DRY_RUN=1 node scripts/generate-posts.mjs`.
