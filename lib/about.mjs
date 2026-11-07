// Reads about.md into the pieces the about page needs.

import { readFileSync } from 'node:fs';
import { render, parseFrontMatter } from './markdown.mjs';

export function parseAbout(source) {
  const { data, body } = parseFrontMatter(source);
  return {
    title: data.title || '',
    subtitle: data.subtitle || '',
    summary: data.summary || '',
    likes: (data.likes || '').split(',').map((like) => like.trim()).filter(Boolean),
    html: render(body),
  };
}

export function loadAbout(file) {
  return parseAbout(readFileSync(file, 'utf8'));
}
