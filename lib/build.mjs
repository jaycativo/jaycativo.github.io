// Writes the whole site into an output folder. The only place that writes site files.

import { writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { loadPosts } from './posts.mjs';
import { loadAbout } from './about.mjs';
import { avatarSvg } from './pixels.mjs';
import { homePage, postPage, aboutPage, projectsPage, notFoundPage } from './templates.mjs';

function writeFile(out, path, content) {
  const file = join(out, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

// Rebuilds `out` from scratch, so a deleted post never lingers. Returns how many posts it wrote.
export function buildSite({ root, out, projects }) {
  const posts = loadPosts(join(root, 'posts'));
  const about = loadAbout(join(root, 'about.md'));

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(join(root, 'site'), out, { recursive: true });

  writeFile(out, 'favicon.svg', avatarSvg());
  writeFile(out, 'avatar.svg', avatarSvg());
  writeFile(out, 'index.html', homePage(posts));
  for (const post of posts) writeFile(out, `posts/${post.slug}/index.html`, postPage(post));
  writeFile(out, 'about/index.html', aboutPage(about));
  writeFile(out, 'projects/index.html', projectsPage(projects));
  writeFile(out, '404.html', notFoundPage());
  return { posts: posts.length };
}
