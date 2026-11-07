// Builds the site into dist/. No dependencies: plain Node 18+.
//   node build.mjs           build once
//   node build.mjs --serve   build, then preview at http://127.0.0.1:4000
// The work lives in lib/. This file only runs the steps in order.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from './lib/build.mjs';
import { loadProjects } from './lib/projects.mjs';
import { servePreview } from './lib/serve.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const WATCHED = ['posts', 'site', 'data', 'about.md']; // edits to build.mjs or lib/ need a restart

// GitHub is asked once per run, not on every rebuild in preview.
const projects = await loadProjects(join(ROOT, 'data', 'projects.json'));

function build() {
  const { posts } = buildSite({ root: ROOT, out: OUT, projects });
  console.log(`built ${posts} post(s) and ${projects.length} project(s) into dist/`);
}

build();

if (process.argv.includes('--serve')) {
  servePreview({
    out: OUT,
    watchPaths: WATCHED.map((name) => join(ROOT, name)),
    rebuild: () => {
      try {
        build();
      } catch (err) {
        console.warn(`! ${err.message}`);
      }
    },
  });
}
