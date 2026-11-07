// Every page of the site as a function from data to an HTML string. No file or network access.

import { esc } from './markdown.mjs';
import { TOPIC } from './config.mjs';
import { layout } from './layout.mjs';

const TAGLINE = 'a low stakes place for <span class="hl">half-finished thoughts</span>';
const SUBLINE = 'dev notes, small experiments, things I broke on purpose.';
const AVATAR_ALT = 'Pixel art of Jay in a sage beanie and an orange sweater';
const COLOR_STEPS = 3; // tags and cards cycle through sage, blue, and orange (t0..t2, c0..c2)

// ---------- pieces ----------

function emptyNote(html) {
  return `<div class="empty">${html}</div>`;
}

export function postItem(post) {
  const link = `<a href="/posts/${post.slug}/">${esc(post.title)}</a>`;
  return `<li><time datetime="${post.date}">${post.date}</time>${link}</li>`;
}

function postList(posts) {
  if (!posts.length) return emptyNote('no posts yet. add a markdown file to <code>posts/</code> and push.');
  return `<ul class="posts">${posts.map(postItem).join('')}</ul>`;
}

function likeTag(like, index) {
  return `<span class="tag t${index % COLOR_STEPS}">${esc(like)}</span>`;
}

function likesBlock(likes) {
  if (!likes.length) return '';
  const tags = likes.map(likeTag).join('');
  return `<div class="likes-label">things i like</div>\n<div class="tags">${tags}</div>`;
}

export function projectCard(project, index) {
  const tags = (project.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join(' ');
  const visit = project.link ? ` · <a href="${esc(project.link)}">visit</a>` : '';
  const title = `<h2><a href="${esc(project.url)}">${esc(project.name)}</a></h2>`;
  return (
    `<article class="card c${index % COLOR_STEPS}">${title}` +
    `<p>${esc(project.description)}</p><div>${tags}${visit}</div></article>`
  );
}

function projectList(projects) {
  if (!projects.length) {
    return emptyNote(
      `nothing here yet. add the <code>${TOPIC}</code> topic to a repo on GitHub ` +
        'and it shows up after the next build.',
    );
  }
  return `<div class="cards">${projects.map(projectCard).join('')}</div>`;
}

// ---------- pages ----------

export function homePage(posts) {
  return layout({
    title: '',
    current: 'blog',
    description: 'A low stakes place for half-finished thoughts.',
    body: `<p class="lede">${TAGLINE}</p>\n<p class="soft">${SUBLINE}</p>\n${postList(posts)}`,
  });
}

export function postPage(post) {
  const when = `<time datetime="${post.date}">${post.date}</time>`;
  const meta = `<a href="/">← all posts</a> · ${when} · ${post.minutes} min`;
  return layout({
    title: post.title,
    current: 'blog',
    calm: true,
    description: post.summary || `${post.title}, a post by Jay.`,
    body: `<article class="prose">
<div class="meta">${meta}</div>
<h1>${esc(post.title)}</h1>
${post.html}
</article>`,
  });
}

export function aboutPage(about) {
  const avatar = `<img class="avatar" src="/avatar.svg" width="128" height="128" alt="${AVATAR_ALT}">`;
  const heading = `<h1>${esc(about.title || 'hi, I’m Jay')}</h1>`;
  return layout({
    title: 'about',
    current: 'about',
    description: about.summary || 'About Jay.',
    body: `<div class="about-top">
${avatar}
<div>${heading}<div class="soft">${esc(about.subtitle)}</div>
${likesBlock(about.likes)}</div>
</div>
<div class="prose">
${about.html}
</div>`,
  });
}

export function projectsPage(projects) {
  const tagged = `<span class="hl">${TOPIC}</span>`;
  const intro = `pulled from github repos tagged ${tagged}, so this page updates itself.`;
  return layout({
    title: 'projects',
    current: 'projects',
    description: 'Things Jay has made.',
    body: `<h1>projects</h1>\n<p class="soft">${intro}</p>\n${projectList(projects)}`,
  });
}

export function notFoundPage() {
  return layout({
    title: 'not found',
    description: 'That page is not here.',
    body: '<h1>404</h1>\n<p>nothing lives at this address. try the <a href="/">post list</a>.</p>',
  });
}
