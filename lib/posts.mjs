// Reads the markdown files in posts/ and turns them into post objects, newest first.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, parseFrontMatter, slugify } from './markdown.mjs';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATED_FILE_NAME = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
const WORDS_PER_MINUTE = 200;

// Turns one markdown file into a post, or null for a draft.
export function parsePost(fileName, source) {
  const { data, body } = parseFrontMatter(source);
  if (data.draft === 'true') return null;

  const name = fileName.replace(/\.md$/, '');
  const dated = name.match(DATED_FILE_NAME);
  const date = data.date || (dated && dated[1]);
  if (!DATE_PATTERN.test(date || '')) {
    throw new Error(
      `posts/${fileName} needs a date: add "date: YYYY-MM-DD" at the top, ` +
        'or name the file YYYY-MM-DD-title.md',
    );
  }

  const slug = slugify(dated ? dated[2] : name);
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    title: data.title || slug,
    date,
    slug,
    summary: data.summary || '',
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    html: render(body),
  };
}

function newestFirst(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug.localeCompare(b.slug);
}

function assertUniqueSlugs(posts) {
  const seen = new Set();
  for (const { slug } of posts) {
    if (seen.has(slug)) throw new Error(`two posts share the address "${slug}"`);
    seen.add(slug);
  }
}

export function loadPosts(dir) {
  if (!existsSync(dir)) return [];
  const posts = readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parsePost(file, readFileSync(join(dir, file), 'utf8')))
    .filter(Boolean);
  assertUniqueSlugs(posts);
  return posts.sort(newestFirst);
}
