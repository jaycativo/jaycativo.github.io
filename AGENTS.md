# AGENTS.md

Instructions for any coding agent, or any person, working on this repo. Users
read `README.md`; this file is for builders.

## What this is

Jay's personal site at jaycativo.github.io: a blog, an about page, a projects
page, and a small pixel bird. It should feel like Jay: playful, colourful, a bit
terminal, a bit e-ink, and low stakes to write in.

## Ground rules

- Zero dependencies and no framework. Plain Node 18+, vanilla JS and CSS.
- Markdown files in `posts/` and `about.md` are the source of truth. `dist/` is
  built output: never commit it, never edit it.
- Posts are the owner's words. Never rewrite, reorder, or delete a post or the
  about page unless asked. Placeholder text marked "(edit me)" is for the owner.
- Raw HTML in markdown stays escaped. Links allow only http, https, mailto, and
  local paths. Do not loosen `lib/markdown.mjs` without tests.
- Projects come from GitHub repos with the topic `showcase`, plus
  `data/projects.json` for anything else. In CI a failed fetch fails the build
  on purpose, so the last good site stays up.
- Never push, create a repo, change repo settings, or publish anything the owner
  has not asked for. Ask before anything outward-facing that is new.
- Accessibility is part of "done": text contrast on both papers, a visible focus
  ring, and no motion for people who prefer reduced motion.

## Commands

```sh
node build.mjs --serve         # build, then preview at http://127.0.0.1:4000
node build.mjs                 # build only
node --test markdown.test.mjs  # tests
```

## Layout

- `build.mjs`: reads content, fetches projects, writes pages into `dist/`.
  Page templates are functions in this file.
- `lib/markdown.mjs`: the markdown renderer. `lib/pixels.mjs`: the avatar and
  favicon pixel grid.
- `site/`: files copied as they are: `style.css` (colour tokens at the top),
  `bird.js` (the pet), `site.js` (light or dark paper), `ascii.txt` (about face).
- `posts/`, `about.md`, `data/projects.json`: content.
- `.github/workflows/pages.yml`: tests, builds, and deploys on push, and daily.

## Design

- Paper and ink: warm grey paper, soft charcoal ink, so contrast stays gentle.
- Three colours, used boldly but only as fills, underlines, and accents:
  sage `#A6D8A0` (main), blue `#7C9CFF`, orange `#FF8A3D`. Text on a colour fill
  is always the dark ink `--on`, in both modes.
- Mono for chrome and code, a serif for long reading. Dashed rules, 1.5px
  outlines, no shadows, no gradients.
- Voice: lowercase and casual for the site's own words, sentence case for
  headings in the docs. No "please" or "successfully".
- The bird: stays calm (no random hops) on post pages, and never hops for people
  who prefer reduced motion.

## Working agreements

- Small steps. Tests stay green, and `node build.mjs` runs clean before a commit.
- Commit each working step with a message that says what changed and why.
- Commit with the owner's GitHub noreply address
  (`138532952+jaycativo@users.noreply.github.com`). This repo's local git config
  sets it; do not change it, and never use the owner's real email.
- Push only once a remote exists and the owner has asked for pushes (they have,
  for this repo). Do not force-push.
- Update `README.md` in the same change as any behaviour users can see.
- Say what you did not check. Do not report something as working until you have
  run it.

## Ideas, not promised

Tags on posts, an RSS feed, a posts-per-year archive, syntax highlighting,
a bird that comments on new posts.
