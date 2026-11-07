import test from 'node:test';
import assert from 'node:assert/strict';
import { render, parseFrontMatter, inline } from './lib/markdown.mjs';

test('front matter is split from the body', () => {
  const { data, body } = parseFrontMatter('---\ntitle: "Hi there"\ndate: 2026-11-07\n---\nhello');
  assert.equal(data.title, 'Hi there');
  assert.equal(data.date, '2026-11-07');
  assert.equal(body, 'hello');
});

test('a file with no front matter is all body', () => {
  const { data, body } = parseFrontMatter('just text');
  assert.deepEqual(data, {});
  assert.equal(body, 'just text');
});

test('headings, paragraphs, and rules', () => {
  const html = render('# One\n\nsome *words* and **more**\n\n---');
  assert.match(html, /<h1 id="one">One<\/h1>/);
  assert.match(html, /<p>some <em>words<\/em> and <strong>more<\/strong><\/p>/);
  assert.match(html, /<hr>/);
});

test('fenced code is escaped and kept verbatim', () => {
  const html = render('```js\nif (a < b) { **no** }\n```');
  assert.match(html, /<pre><code class="lang-js">if \(a &lt; b\) \{ \*\*no\*\* \}<\/code><\/pre>/);
});

test('inline code is not formatted further', () => {
  assert.equal(inline('use `*stars*` here'), 'use <code>*stars*</code> here');
});

test('raw HTML in a post is escaped', () => {
  const html = render('<script>alert(1)</script>');
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('javascript: links are neutralised, web links kept', () => {
  assert.match(inline('[x](javascript:alert(1))'), /href="#"/);
  assert.match(inline('[x](https://example.com)'), /href="https:\/\/example.com"/);
  assert.match(inline('[x](/about/)'), /href="\/about\/"/);
});

test('lists and quotes', () => {
  const html = render('- a\n- b\n\n1. one\n2. two\n\n> quoted');
  assert.match(html, /<ul><li>a<\/li><li>b<\/li><\/ul>/);
  assert.match(html, /<ol><li>one<\/li><li>two<\/li><\/ol>/);
  assert.match(html, /<blockquote><p>quoted<\/p><\/blockquote>/);
});

test('a list right after a paragraph line still starts a list', () => {
  const html = render('intro\n- a\n- b');
  assert.match(html, /<p>intro<\/p>/);
  assert.match(html, /<ul>/);
});
