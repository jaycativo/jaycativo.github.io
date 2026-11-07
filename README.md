# jaycativo.github.io

A small personal site: a blog, an about page, and a projects page. A little blue bird lives at the bottom.

No dependencies and no framework. It is plain Node 18+ and a few files.

## Write a post

Add a markdown file to `posts/`, then commit and push. The site rebuilds itself.

```
posts/2026-11-08-my-next-thought.md
```

```
---
title: my next thought
date: 2026-11-08
summary: One line for search engines and link previews (optional).
draft: true   (optional: hides the post until you remove this line)
---

Write whatever you like here.
```

The date can also come from the file name (`YYYY-MM-DD-title.md`). The web address of a post is the file name without the date.

Supported markdown: headings, paragraphs, bold, italic, links, images, code blocks, inline code, lists (one level), quotes, and rules. Raw HTML is shown as text, not run.

## Show a project

Tag the repo on GitHub with the topic `showcase`. The projects page lists every public, non-fork repo of yours with that topic, using its description. It refreshes on every push and once a day.

`data/projects.json` is for anything that is not tagged (or not on GitHub). It already lists `task-board-app`, and if you tag that repo later too, it still shows up only once. An entry looks like this:

```json
[{ "name": "my thing", "url": "https://example.com", "description": "what it is", "tags": ["art"] }]
```

## Edit the pages

- About page: `about.md`
- Tagline on the home page: the top of `lib/templates.mjs`. Footer wording: the top of `lib/layout.mjs`
- Colours and type: the top of `site/style.css`
- The bird: `site/bird.js` (what it does) and `site/sprite.js` (how it looks). Visitors can send it to the nest with the link in the footer; the choice is remembered in their browser.
- The favicon: the pixel grid in `lib/pixels.mjs`

## Run it on your computer

```sh
node build.mjs --serve   # then open http://127.0.0.1:4000
node --test *.test.mjs
```

## Put it online (once)

1. Create a public GitHub repo named exactly `jaycativo.github.io`.
2. Push this folder to its `main` branch.
3. In the repo, open Settings, then Pages, and set Source to **GitHub Actions**.

After that, every push to `main` deploys.
