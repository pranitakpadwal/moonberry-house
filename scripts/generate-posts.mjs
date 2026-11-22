#!/usr/bin/env node
// Tops up the publishing queue with new drafts written by Claude.
//
// Env:  ANTHROPIC_API_KEY (required)   CLAUDE_MODEL (default claude-sonnet-5-5)
//       POSTS_PER_DAY (1-3, default 2) DAYS_AHEAD (default 7)   DRY_RUN=1 (print plan only)
//
// Picks the next pending topics from content/topics.json, writes each as a dated markdown
// file in content/posts/, and marks the topic done. The daily build publishes it on its date.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(ROOT, 'content/posts');
const TOPICS_FILE = path.join(ROOT, 'content/topics.json');
const CATEGORIES = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/categories.json'), 'utf8'));
const PER_DAY = Math.min(3, Math.max(1, Number(process.env.POSTS_PER_DAY || 2)));
const DAYS_AHEAD = Number(process.env.DAYS_AHEAD || 7);
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const DRY = !!process.env.DRY_RUN;

const today = process.env.TODAY || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const slugify = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).replace(/-$/, '');

// which dates already have posts, and how many
const counts = {};
for (const f of fs.readdirSync(POSTS)) { const m = f.match(/^(\d{4}-\d{2}-\d{2})-/); if (m) counts[m[1]] = (counts[m[1]] || 0) + 1; }
const slots = [];
for (let d = addDays(today, 1); d <= addDays(today, DAYS_AHEAD); d = addDays(d, 1)) {
  for (let n = counts[d] || 0; n < PER_DAY; n++) slots.push(d);
}
const topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
const pending = topics.filter((t) => t.status === 'pending');
const plan = slots.slice(0, pending.length).map((date, i) => ({ date, topic: pending[i] }));
console.log(`${slots.length} open slots in the next ${DAYS_AHEAD} days; ${pending.length} topics pending; writing ${plan.length}`);
if (!pending.length) console.log('Topic backlog is empty. Add more to content/topics.json');
if (DRY || !plan.length) { plan.forEach((p) => console.log(p.date, '-', p.topic.title)); process.exit(0); }
if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY is not set'); process.exit(1); }

const example = fs.readFileSync(path.join(POSTS, fs.readdirSync(POSTS).filter((f) => f.endsWith('.md')).sort()[0]), 'utf8');
const SYSTEM = `You write blog posts for The Moonberry Journal, the blog of The Moonberry House (themoonberryhouse.com), a small brand of colouring books, a painting journal and picture books for every kind of mind, in English and Marathi. The founder is Pranita Padwal. Readers: parents of young children, parents and carers of neurodivergent or special-needs children, and adults and teens looking for calm, inner peace and gentle healing through colouring and painting.

VOICE: warm, calm, plain-spoken, kind, never preachy. British/Indian English spelling (colour, favourite). Short paragraphs. Sign off with a final line: Warmly, Pranita

HARD RULES (a post that breaks these is rejected):
- Never claim colouring or any activity cures, treats, heals or fixes a condition (autism, ADHD, anxiety, depression, trauma, dyslexia, etc.). Say "can help", "many people find", "may".
- Do not invent studies, statistics, percentages, named researchers, quotes or institutions. If you refer to research, keep it general and honest, including where evidence is mixed.
- Do not invent personal anecdotes, children, clients or "a mum I know". Use "you", "many parents", hypotheticals clearly framed as such.
- No diagnosing and no medical, therapy or dosage advice. Where relevant, say gently when to talk to a doctor, therapist, teacher or counsellor.
- Never imply a child is broken or behind. Respect every kind of mind. Use respectful language (autistic child or child with autism are both fine; avoid "suffers from", "special needs" as a label for the child's worth).
- No pushy selling. Do not mention products by name in the body (a call-to-action box is added automatically).
- Be culturally aware; examples may draw on Indian family life where natural, without stereotypes.
- NEVER use em dashes or en dashes anywhere. Use commas, colons, full stops or brackets instead.
- Original wording. Do not copy phrases from books, trademarked characters or other websites.

SEO AND ANSWER-ENGINE RULES (this blog's goal is to be quoted by Google, AI Overviews, ChatGPT, Claude and Perplexity):
- Write the post to answer one clear question a real parent or adult would type or ask an AI assistant. Name that question in the title or first subheading.
- "summary" (front matter) is a self-contained direct answer in 35-60 words that makes sense on its own, with the key fact first.
- Make subheadings (##) specific and, where natural, phrased as questions. Each section should open with a one or two sentence direct answer, then add detail.
- Define terms plainly the first time they appear. Prefer concrete steps, lists and short definitions that can be lifted out as an answer.
- Use the main topic phrase naturally in the title, first paragraph and one subheading. No keyword stuffing.
- End with "## Frequently asked questions" containing 3 or 4 "### Question?" entries, each followed by a 25-60 word plain-text answer (no markdown, no lists) that stands alone. Use questions people really ask.
- Be honest about what is not known or varies between children and adults. Calibrated, trustworthy statements get cited more than hype.

FORMAT: output ONLY a markdown file, starting with this front matter and then the body:
---
title: <the title, max 90 chars>
description: <one sentence, 120-180 chars, no quotes, includes the main topic>
category: <given category key>
date: <given date>
read: <minutes>
summary: <35-60 word direct answer>
keywords: <6 comma-separated search phrases>
---
Body: 700-950 words including the FAQ. First paragraph is a hook (no heading). Use "## " subheadings (3-5, then the FAQ), short paragraphs, bullet lists where useful, one callout written as a line ":::tips Title" then bullet lines then a line ":::" placed BEFORE the FAQ. Allowed inline: **bold**, *italic*, and internal links like [Colour game](/play/) or [Books](/books/) at most twice. No HTML, no images, no external links. The very last line is: Warmly, Pranita

Here is an example of the exact format and voice:

${example}`;

const BANNED = [
  /\b(cures?|cured|curing)\b/i, /\bheals? (your|the) (autism|adhd|anxiety|depression|trauma)/i, /\bclinically proven\b/i,
  /\bstudies (show|prove)\b/i, /\bresearch (proves|shows that)\b/i, /\b\d{1,3}\s?(%|percent)\b/i, /\bscientists (say|found)\b/i,
  /\bguaranteed?\b/i, /\bmy (son|daughter|child|client|patient)\b/i, /\bdoctors? (recommend|agree)\b/i,
];

function validate(md, topic, date) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return 'no front matter';
  const body = m[2]; const fm = m[1];
  if (!new RegExp(`^category: ${topic.category}$`, 'm').test(fm)) return 'wrong category';
  if (!new RegExp(`^date: ${date}$`, 'm').test(fm)) return 'wrong date';
  const words = body.split(/\s+/).length;
  if (words < 550 || words > 1200) return `length ${words} words`;
  if (/<[a-z][\s\S]*>/i.test(body)) return 'contains HTML';
  if (!/^Warmly, Pranita\s*$/m.test(body)) return 'missing sign-off';
  if (/[—–]/.test(fm + body)) return 'contains em or en dash';
  if (!/^summary: .{150,420}$/m.test(fm)) return 'summary missing or wrong length';
  if (!/^##\s+frequently asked questions/im.test(body) || (body.match(/^###\s+.+\?\s*$/gm) || []).length < 3) return 'FAQ section missing or fewer than 3 questions';
  for (const re of BANNED) { const hit = (fm + body).match(re); if (hit) return `banned phrase: "${hit[0]}"`; }
  return null;
}

async function write(topic, date, feedback) {
  const cat = CATEGORIES[topic.category];
  const user = `Write the post.\nTitle idea: ${topic.title}\nAngle: ${topic.angle}\nCategory key: ${topic.category} (${cat.label}: ${cat.intro})\nDate: ${date}${feedback ? `\n\nYour previous attempt was rejected: ${feedback}. Fix that.` : ''}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
    });
    if (res.ok) return (await res.json()).content.map((c) => c.text || '').join('').trim();
    if ([429, 500, 502, 503, 529].includes(res.status) && attempt < 4) { await new Promise((r) => setTimeout(r, 2000 * attempt ** 2)); continue; }
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
}

let written = 0;
for (const { date, topic } of plan) {
  let md = await write(topic, date); let err = validate(md, topic, date);
  if (err) { console.log(`retry "${topic.title}": ${err}`); md = await write(topic, date, err); err = validate(md, topic, date); }
  if (err) { console.log(`REJECTED "${topic.title}" (${err}); saved as draft`); md = md.replace(/^---\n/, '---\ndraft: true\n'); }
  const title = (md.match(/^title:\s*(.*)$/m) || [, topic.title])[1].replace(/^"|"$/g, '');
  fs.writeFileSync(path.join(POSTS, `${date}-${slugify(title || topic.title)}.md`), md.endsWith('\n') ? md : md + '\n');
  topic.status = err ? 'draft' : 'done'; topic.date = date;
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 1));
  written++; console.log(`${err ? 'draft' : 'queued'} ${date}  ${title}`);
}
console.log(`done: ${written} posts`);
