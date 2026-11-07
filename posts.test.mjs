import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parsePost, loadPosts } from './lib/posts.mjs';

test('a post takes its date and address from the file name', () => {
  const post = parsePost('2026-11-08-my-next-thought.md', 'Some words.');
  assert.equal(post.date, '2026-11-08');
  assert.equal(post.slug, 'my-next-thought');
  assert.equal(post.title, 'my-next-thought');
});

test('front matter date and title win over the file name', () => {
  const post = parsePost('2026-11-08-x.md', '---\ntitle: Hello there\ndate: 2026-12-01\n---\nbody');
  assert.equal(post.date, '2026-12-01');
  assert.equal(post.title, 'Hello there');
});

test('a draft is skipped', () => {
  assert.equal(parsePost('2026-11-08-x.md', '---\ndraft: true\n---\nbody'), null);
});

test('a post with no date fails with a message that says what to do', () => {
  assert.throws(() => parsePost('no-date.md', 'body'), /needs a date/);
});

test('reading time is at least one minute', () => {
  assert.equal(parsePost('2026-11-08-x.md', 'tiny').minutes, 1);
});

function withPostsFolder(files, check) {
  const dir = mkdtempSync(join(tmpdir(), 'posts-'));
  try {
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    check(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('posts are listed newest first', () => {
  withPostsFolder({ '2026-01-01-old.md': 'a', '2026-06-01-new.md': 'b', 'notes.txt': 'ignored' }, (dir) => {
    assert.deepEqual(loadPosts(dir).map((post) => post.slug), ['new', 'old']);
  });
});

test('two posts with the same address are rejected', () => {
  withPostsFolder({ '2026-01-01-same.md': 'a', '2026-02-01-same.md': 'b' }, (dir) => {
    assert.throws(() => loadPosts(dir), /share the address "same"/);
  });
});

test('a missing posts folder means no posts', () => {
  assert.deepEqual(loadPosts(join(tmpdir(), 'definitely-not-here')), []);
});
