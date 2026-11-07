import test from 'node:test';
import assert from 'node:assert/strict';
import { layout } from './lib/layout.mjs';
import { postItem, projectCard, homePage, aboutPage, projectsPage } from './lib/templates.mjs';
import { parseAbout } from './lib/about.mjs';

const page = (overrides = {}) => layout({ title: 't', description: 'd', body: 'b', ...overrides });

test('the page title is escaped', () => {
  assert.match(page({ title: '<b>hi</b>' }), /<title>&lt;b&gt;hi&lt;\/b&gt; · jaycativo<\/title>/);
});

test('the home page title is just the site name', () => {
  assert.match(homePage([]), /<title>jaycativo<\/title>/);
});

test('only the current page is marked in the nav', () => {
  const html = page({ current: 'about' });
  assert.equal(html.match(/aria-current="page"/g).length, 1);
  assert.match(html, /href="\/about\/" aria-current="page"/);
});

test('a calm page tells the bird to stay still', () => {
  assert.match(page({ calm: true }), /<body class="calm">/);
  assert.match(page(), /<body>/);
});

test('post titles in the list are escaped', () => {
  const html = postItem({ slug: 's', date: '2026-01-01', title: '<script>x</script>' });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('project cards escape names, descriptions, and links', () => {
  const html = projectCard(
    { name: '<n>', url: 'https://x.test/?a="1"', description: '<d>', link: '"><l>', tags: ['<t>'] },
    0,
  );
  assert.ok(!/<(n|d|l|t)>/.test(html));
  assert.ok(!html.includes('"1"'));
});

test('project cards cycle through three colours', () => {
  const colours = [0, 1, 2, 3].map((i) => projectCard({ name: 'x', url: 'u' }, i).match(/class="card (c\d)"/)[1]);
  assert.deepEqual(colours, ['c0', 'c1', 'c2', 'c0']);
});

test('an empty projects page says how to fill it', () => {
  assert.match(projectsPage([]), /add the <code>showcase<\/code> topic/);
});

test('an empty blog says how to write a post', () => {
  assert.match(homePage([]), /no posts yet/);
});

test('the about page leaves out the likes label when there are no likes', () => {
  const about = parseAbout('---\ntitle: hi\n---\nbody');
  assert.ok(!aboutPage(about).includes('things i like'));
});

test('the about page lists likes as tags', () => {
  const about = parseAbout('---\nlikes: colors, e-ink\n---\nbody');
  const html = aboutPage(about);
  assert.match(html, /things i like/);
  assert.match(html, /<span class="tag t0">colors<\/span><span class="tag t1">e-ink<\/span>/);
});

test('about.md is read into title, likes, and body html', () => {
  const about = parseAbout('---\ntitle: hello\nsubtitle: dev\nlikes: a, b, \n---\n**bold**');
  assert.equal(about.title, 'hello');
  assert.deepEqual(about.likes, ['a', 'b']);
  assert.match(about.html, /<strong>bold<\/strong>/);
});
