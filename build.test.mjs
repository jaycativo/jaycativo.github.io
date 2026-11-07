import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from './lib/build.mjs';
import { fileFor } from './lib/serve.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const projects = [{ name: 'test-project', url: 'https://example.com/p', description: 'a test card', tags: [] }];

function withBuiltSite(check) {
  const out = mkdtempSync(join(tmpdir(), 'site-'));
  try {
    const result = buildSite({ root: ROOT, out, projects });
    check(out, result);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

test('a build writes every page and the site files', () => {
  withBuiltSite((out) => {
    for (const file of ['index.html', 'about/index.html', 'projects/index.html', '404.html']) {
      assert.ok(existsSync(join(out, file)), `${file} is missing`);
    }
    for (const file of ['style.css', 'site.js', 'bird.js', 'nest.js', 'sprite.js', 'favicon.svg', 'avatar.svg']) {
      assert.ok(existsSync(join(out, file)), `${file} is missing`);
    }
  });
});

test('every post gets its own page', () => {
  withBuiltSite((out, result) => {
    assert.ok(result.posts >= 1);
    const home = readFileSync(join(out, 'index.html'), 'utf8');
    const links = [...home.matchAll(/href="\/posts\/([^/]+)\/"/g)].map((m) => m[1]);
    assert.equal(links.length, result.posts);
    for (const slug of links) assert.ok(existsSync(join(out, 'posts', slug, 'index.html')));
  });
});

test('the projects page shows the projects it was given', () => {
  withBuiltSite((out) => {
    assert.match(readFileSync(join(out, 'projects/index.html'), 'utf8'), /test-project/);
  });
});

test('the favicon is an svg', () => {
  withBuiltSite((out) => {
    assert.match(readFileSync(join(out, 'favicon.svg'), 'utf8'), /^<svg /);
  });
});

test('the preview server maps addresses to files inside the output folder only', () => {
  withBuiltSite((out) => {
    assert.equal(fileFor(out, '/'), join(out, 'index.html'));
    assert.equal(fileFor(out, '/about/'), join(out, 'about', 'index.html'));
    assert.equal(fileFor(out, '/style.css'), join(out, 'style.css'));
    assert.equal(fileFor(out, '/nope/'), null);
    assert.equal(fileFor(out, '/../package.json'), null);
    assert.equal(fileFor(out, '/%2e%2e/%2e%2e/etc/passwd'), null);
    assert.equal(fileFor(out, '/%zz'), null);
    assert.equal(fileFor(out, '/about'), null); // a folder without its trailing slash is not a file
  });
});
