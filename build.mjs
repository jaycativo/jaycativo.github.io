// Builds the site into dist/. No dependencies: plain Node 18+.
//   node build.mjs           build once
//   node build.mjs --serve   build, then preview at http://127.0.0.1:4000

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync, watch } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { render, parseFrontMatter, esc } from './lib/markdown.mjs';
import { avatarSvg } from './lib/pixels.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const GITHUB_USER = 'jaycativo';
const SITE_URL = 'https://jaycativo.github.io';
const TOPIC = 'showcase'; // tag a repo with this topic and it shows up on the projects page

const TAGLINE = 'a low stakes place for <span class="hl">half-finished thoughts</span>';
const SUBLINE = 'dev notes, small experiments, things I broke on purpose.';

// ---------- content ----------

function loadPosts() {
  const dir = join(ROOT, 'posts');
  if (!existsSync(dir)) return [];
  const posts = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { data, body } = parseFrontMatter(readFileSync(join(dir, file), 'utf8'));
    if (data.draft === 'true') continue;
    const name = file.replace(/\.md$/, '');
    const fromName = name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const date = data.date || (fromName && fromName[1]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
      throw new Error(`posts/${file} needs a date: add "date: YYYY-MM-DD" at the top, or name the file YYYY-MM-DD-title.md`);
    }
    const slug = (fromName ? fromName[2] : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      title: data.title || slug,
      date,
      slug,
      summary: data.summary || '',
      minutes: Math.max(1, Math.round(words / 200)),
      html: render(body),
    });
  }
  const slugs = new Set();
  for (const p of posts) {
    if (slugs.has(p.slug)) throw new Error(`two posts share the address "${p.slug}"`);
    slugs.add(p.slug);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

async function fetchRepos() {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'static-site-build' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const q = encodeURIComponent(`user:${GITHUB_USER} topic:${TOPIC} fork:false`);
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${q}&sort=updated&per_page=30`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const json = await res.json();
    return json.items.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description || '',
      link: r.homepage || '',
      tags: [r.language, ...r.topics.filter((t) => t !== TOPIC)].filter(Boolean).slice(0, 3),
    }));
  } catch (err) {
    // In CI, fail loudly so the last good site stays up instead of losing every project card.
    if (process.env.CI) throw err;
    console.warn(`! couldn't reach GitHub (${err.message}); projects page shows only data/projects.json`);
    return [];
  }
}

async function loadProjects() {
  const file = join(ROOT, 'data', 'projects.json');
  const manual = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const repos = await fetchRepos();
  const seen = new Set(manual.map((p) => p.url));
  return [...manual, ...repos.filter((r) => !seen.has(r.url))];
}

// ---------- templates ----------

function layout({ title, description, body, current = '', calm = false }) {
  const pageTitle = current === 'blog' && !title ? 'jaycativo' : `${title} · jaycativo`;
  const link = (href, label, key) =>
    `<a class="pill" href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<script>try{var d=document.documentElement,t=localStorage.getItem('theme');if(t)d.dataset.theme=t;if(localStorage.getItem('nest')==='1')d.dataset.nest='1'}catch(e){}</script>
</head>
<body${calm ? ' class="calm"' : ''}>
<div class="wrap">
<header class="nav">
  <a class="brand" href="/">jaycativo<span class="cursor" aria-hidden="true"></span></a>
  <nav class="links" aria-label="Main">
    ${link('/', 'blog', 'blog')}${link('/about/', 'about', 'about')}${link('/projects/', 'projects', 'projects')}
    <button class="pill theme" id="theme" type="button">dark paper</button>
  </nav>
</header>
<main>
${body}
</main>
<footer class="foot">written with care · hosted on github pages · <button class="linklike" id="nest" type="button" hidden>send the bird to the nest</button></footer>
</div>
<script src="/site.js" defer></script>
<script src="/bird.js" defer></script>
</body>
</html>
`;
}

function homePage(posts) {
  const list = posts.length
    ? `<ul class="posts">${posts
        .map((p) => `<li><time datetime="${p.date}">${p.date}</time><a href="/posts/${p.slug}/">${esc(p.title)}</a></li>`)
        .join('')}</ul>`
    : `<div class="empty">no posts yet. add a markdown file to <code>posts/</code> and push.</div>`;
  return layout({
    title: '',
    current: 'blog',
    description: 'A low stakes place for half-finished thoughts.',
    body: `<p class="lede">${TAGLINE}</p>\n<p class="soft">${SUBLINE}</p>\n${list}`,
  });
}

function postPage(p) {
  return layout({
    title: p.title,
    current: 'blog',
    calm: true,
    description: p.summary || `${p.title}, a post by Jay.`,
    body: `<article class="prose">
<div class="meta"><a href="/">← all posts</a> · <time datetime="${p.date}">${p.date}</time> · ${p.minutes} min</div>
<h1>${esc(p.title)}</h1>
${p.html}
</article>`,
  });
}

function aboutPage() {
  const { data, body } = parseFrontMatter(readFileSync(join(ROOT, 'about.md'), 'utf8'));
  const likes = (data.likes || '').split(',').map((s) => s.trim()).filter(Boolean);
  return layout({
    title: 'about',
    current: 'about',
    description: data.summary || 'About Jay.',
    body: `<div class="about-top">
<img class="avatar" src="/avatar.svg" width="128" height="128" alt="Pixel art of Jay in a sage beanie and an orange sweater">
<div><h1>${esc(data.title || 'hi, I’m Jay')}</h1><div class="soft">${esc(data.subtitle || '')}</div>
${likes.length ? `<div class="likes-label">things i like</div>\n<div class="tags">${likes.map((t, i) => `<span class="tag t${i % 3}">${esc(t)}</span>`).join('')}</div>` : ''}</div>
</div>
<div class="prose">
${render(body)}
</div>`,
  });
}

function projectsPage(projects) {
  const cards = projects.length
    ? `<div class="cards">${projects
        .map((p, i) => {
          const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join(' ');
          const extra = p.link ? ` · <a href="${esc(p.link)}">visit</a>` : '';
          return `<article class="card c${i % 3}"><h2><a href="${esc(p.url)}">${esc(p.name)}</a></h2><p>${esc(p.description)}</p><div>${tags}${extra}</div></article>`;
        })
        .join('')}</div>`
    : `<div class="empty">nothing here yet. add the <code>${TOPIC}</code> topic to a repo on GitHub and it shows up after the next build.</div>`;
  return layout({
    title: 'projects',
    current: 'projects',
    description: 'Things Jay has made.',
    body: `<h1>projects</h1>\n<p class="soft">pulled from github repos tagged <span class="hl">${TOPIC}</span>, so this page updates itself.</p>\n${cards}`,
  });
}

function notFoundPage() {
  return layout({
    title: 'not found',
    current: '',
    description: 'That page is not here.',
    body: `<h1>404</h1>\n<p>nothing lives at this address. try the <a href="/">post list</a>.</p>`,
  });
}

// ---------- build ----------

function write(path, content) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

let projectsCache; // GitHub is asked once per run, not on every rebuild in preview

async function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  cpSync(join(ROOT, 'site'), OUT, { recursive: true });
  write('favicon.svg', avatarSvg());
  write('avatar.svg', avatarSvg());

  const posts = loadPosts();
  const projects = (projectsCache ??= await loadProjects());
  write('index.html', homePage(posts));
  for (const p of posts) write(`posts/${p.slug}/index.html`, postPage(p));
  write('about/index.html', aboutPage());
  write('projects/index.html', projectsPage(projects));
  write('404.html', notFoundPage());
  console.log(`built ${posts.length} post(s) and ${projects.length} project(s) into dist/`);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function serve() {
  http
    .createServer((req, res) => {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = join(OUT, path);
      try {
        if (!file.startsWith(OUT) || !existsSync(file)) {
          res.writeHead(404, { 'content-type': TYPES['.html'] });
          res.end(readFileSync(join(OUT, '404.html')));
          return;
        }
        res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
        res.end(readFileSync(file));
      } catch {
        // dist/ is being rebuilt; ask for a refresh instead of crashing
        res.writeHead(503, { 'content-type': TYPES['.html'], 'retry-after': '1' });
        res.end('rebuilding, refresh in a second');
      }
    })
    .listen(4000, '127.0.0.1', () => console.log('preview at http://127.0.0.1:4000'));

  // Rebuild when content or site files change. (Edits to build.mjs or lib/ need a restart.)
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((err) => console.warn(`! ${err.message}`)), 150);
  };
  for (const dir of ['posts', 'site', 'data']) {
    if (existsSync(join(ROOT, dir))) watch(join(ROOT, dir), { recursive: true }, rebuild);
  }
  watch(join(ROOT, 'about.md'), rebuild);
}

await build();
if (process.argv.includes('--serve')) serve();
