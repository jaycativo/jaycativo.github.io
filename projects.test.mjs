import test from 'node:test';
import assert from 'node:assert/strict';
import { repoToProject, mergeProjects } from './lib/projects.mjs';

const repo = {
  name: 'thing',
  html_url: 'https://github.com/jaycativo/thing',
  description: null,
  homepage: '',
  language: 'JavaScript',
  topics: ['showcase', 'local-first', 'notes', 'extra'],
};

test('a repo becomes a card, without the showcase topic', () => {
  const project = repoToProject(repo);
  assert.equal(project.name, 'thing');
  assert.equal(project.url, 'https://github.com/jaycativo/thing');
  assert.ok(!project.tags.includes('showcase'));
});

test('a card has at most three tags, language first', () => {
  assert.deepEqual(repoToProject(repo).tags, ['JavaScript', 'local-first', 'notes']);
});

test('a missing description and link become empty text', () => {
  const project = repoToProject(repo);
  assert.equal(project.description, '');
  assert.equal(project.link, '');
});

test('a repo with no language still gets its topics', () => {
  assert.deepEqual(repoToProject({ ...repo, language: null }).tags, ['local-first', 'notes', 'extra']);
});

test('a hand-written project wins over the same repo', () => {
  const manual = [{ name: 'mine', url: 'https://github.com/jaycativo/thing' }];
  const merged = mergeProjects(manual, [repoToProject(repo)]);
  assert.deepEqual(merged.map((project) => project.name), ['mine']);
});

test('hand-written projects come first, then repos', () => {
  const manual = [{ name: 'mine', url: 'https://example.com' }];
  const merged = mergeProjects(manual, [repoToProject(repo)]);
  assert.deepEqual(merged.map((project) => project.name), ['mine', 'thing']);
});
