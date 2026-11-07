// Builds the projects list: hand-written entries plus public GitHub repos tagged with TOPIC.

import { readFileSync, existsSync } from 'node:fs';
import { GITHUB_USER, TOPIC } from './config.mjs';

const SEARCH_TIMEOUT_MS = 10_000;
const MAX_REPOS = 30;
const MAX_CARD_TAGS = 3;

function searchUrl() {
  const query = encodeURIComponent(`user:${GITHUB_USER} topic:${TOPIC} fork:false`);
  return `https://api.github.com/search/repositories?q=${query}&sort=updated&per_page=${MAX_REPOS}`;
}

function requestHeaders() {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'static-site-build' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

// One GitHub repo becomes one project card.
export function repoToProject(repo) {
  const topics = repo.topics.filter((topic) => topic !== TOPIC);
  return {
    name: repo.name,
    url: repo.html_url,
    description: repo.description || '',
    link: repo.homepage || '',
    tags: [repo.language, ...topics].filter(Boolean).slice(0, MAX_CARD_TAGS),
  };
}

// Hand-written entries win over a repo with the same address.
export function mergeProjects(manual, repos) {
  const known = new Set(manual.map((project) => project.url));
  return [...manual, ...repos.filter((repo) => !known.has(repo.url))];
}

async function fetchRepos() {
  try {
    const res = await fetch(searchUrl(), {
      headers: requestHeaders(),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const json = await res.json();
    return json.items.map(repoToProject);
  } catch (err) {
    // In CI, fail loudly so the last good site stays up instead of losing every project card.
    if (process.env.CI) throw err;
    console.warn(`! couldn't reach GitHub (${err.message}); projects page shows only data/projects.json`);
    return [];
  }
}

export async function loadProjects(file) {
  const manual = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  return mergeProjects(manual, await fetchRepos());
}
