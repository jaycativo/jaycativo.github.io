// The frame around every page: head, header with navigation, footer, and scripts.

import { esc } from './markdown.mjs';

const SITE_NAME = 'jaycativo';
const FOOTER = 'written with care · hosted on github pages';
const NEST_BUTTON =
  '<button class="linklike" id="nest" type="button" hidden>send the bird to the nest</button>';

const NAV = [
  { key: 'blog', href: '/', label: 'blog' },
  { key: 'about', href: '/about/', label: 'about' },
  { key: 'projects', href: '/projects/', label: 'projects' },
];

// Runs before the page paints, so the saved paper and a hidden bird never flash. These two keys are
// also written in site/site.js and site/nest.js. The empty catch is for browsers that block storage.
const HEAD_SCRIPT =
  "try{const d=document.documentElement,t=localStorage.getItem('theme');if(t)d.dataset.theme=t;" +
  "if(localStorage.getItem('nest')==='1')d.dataset.nest='1'}catch(e){}";

function navLink({ key, href, label }, current) {
  const state = current === key ? ' aria-current="page"' : '';
  return `<a class="pill" href="${href}"${state}>${label}</a>`;
}

// `current` is the nav key to mark, and `calm` tells the bird to stay still (post pages).
export function layout({ title, description, body, current = '', calm = false }) {
  const pageTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const bodyClass = calm ? ' class="calm"' : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<script>${HEAD_SCRIPT}</script>
</head>
<body${bodyClass}>
<div class="wrap">
<header class="nav">
  <a class="brand" href="/">${SITE_NAME}<span class="cursor" aria-hidden="true"></span></a>
  <nav class="links" aria-label="Main">
    ${NAV.map((item) => navLink(item, current)).join('')}
    <button class="pill theme" id="theme" type="button">dark paper</button>
  </nav>
</header>
<main>
${body}
</main>
<footer class="foot">${FOOTER} · ${NEST_BUTTON}</footer>
</div>
<script type="module" src="/site.js"></script>
<script type="module" src="/bird.js"></script>
</body>
</html>
`;
}
