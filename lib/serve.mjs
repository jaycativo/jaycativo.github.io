// A tiny local preview server for the built site. It rebuilds when files change.

import http from 'node:http';
import { readFileSync, existsSync, statSync, watch } from 'node:fs';
import { join, extname, sep } from 'node:path';
import { PREVIEW_HOST, PREVIEW_PORT } from './config.mjs';

const REBUILD_DELAY_MS = 150; // wait for a burst of saves to settle
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
};

function contentType(file) {
  return CONTENT_TYPES[extname(file)] || 'application/octet-stream';
}

// Maps a URL path to a file inside `out`, or null. Never leaves `out`.
export function fileFor(out, urlPath) {
  let path;
  try {
    path = decodeURIComponent(urlPath);
  } catch {
    return null; // a malformed address is just "not found"
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = join(out, path);
  const inside = file.startsWith(out + sep);
  return inside && existsSync(file) && statSync(file).isFile() ? file : null;
}

function send(res, status, type, body, headers = {}) {
  res.writeHead(status, { 'content-type': type, ...headers });
  res.end(body);
}

function handler(out) {
  return (req, res) => {
    try {
      const file = fileFor(out, new URL(req.url, 'http://x').pathname);
      if (file) return send(res, 200, contentType(file), readFileSync(file));
      send(res, 404, CONTENT_TYPES['.html'], readFileSync(join(out, '404.html')));
    } catch {
      // The output folder is being rebuilt. Ask for a refresh instead of crashing.
      send(res, 503, CONTENT_TYPES['.html'], 'rebuilding, refresh in a second', { 'retry-after': '1' });
    }
  };
}

function rebuildOnChange(paths, rebuild) {
  let timer;
  const soon = () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, REBUILD_DELAY_MS);
  };
  for (const path of paths.filter(existsSync)) {
    watch(path, { recursive: statSync(path).isDirectory() }, soon);
  }
}

export function servePreview({ out, watchPaths, rebuild }) {
  http.createServer(handler(out)).listen(PREVIEW_PORT, PREVIEW_HOST, () => {
    console.log(`preview at http://${PREVIEW_HOST}:${PREVIEW_PORT}`);
  });
  rebuildOnChange(watchPaths, rebuild);
}
