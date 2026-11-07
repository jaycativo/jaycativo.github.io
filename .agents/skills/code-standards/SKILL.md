---
name: code-standards
description: How code is written in this repo: file size, names, constants, templates, errors, comments, tests, and CSS. Read before writing or changing any JavaScript, CSS, or page template, and again before you commit.
---

# Code standards

This is a small site with one owner and many helpers over time. The code should read like a short
letter: one idea per file, one job per function, nothing clever. These rules are about being easy to
read in a year. They sit on top of the ground rules in `AGENTS.md`.

## The rules

### Shape

1. **One job per file.** Start each file with a one-line comment saying its job. If you need "and"
   to describe it, split it. Aim for under 150 lines; at 200, split it now.
2. **Keep the entry point thin.** `build.mjs` calls other modules in order. It holds no HTML, no
   parsing, no network code, and no server.
3. **One job per function,** about 30 lines at most. Use early returns instead of deep nesting. Never
   put a ternary or a loop inside a template string: give it a small named function.
4. **Pure in the middle, effects at the edges.** Functions that turn data into HTML or text take
   values and return values. Reading files, network calls, and writing to `dist/` happen in a few
   clearly named places.
5. **Lines stay under about 110 characters.**

### Names and values

6. **Modern JavaScript everywhere.** `const` and `let`, never `var`. Template strings for HTML. Browser
   scripts are plain JS in one wrapper function so nothing leaks into the page.
7. **Names say what a thing is.** Verbs for functions (`loadPosts`, `renderPostPage`), nouns for data.
   No one-letter names except `i`, `e`, and short loop variables.
8. **No magic values.** A number or string that carries meaning (a time, a size, a storage key, a
   topic name) gets a named constant at the top of the file, with the unit in the name:
   `HOP_MS = 520`.
9. **One home per fact.** A storage key, a colour, or a piece of text appears once per language. Where
   CSS and JS must agree, leave a comment in both places. Colours in CSS live only in the tokens at
   the top of `site/style.css`.
10. **Delete dead code.** Unused imports, constants, and old branches go. No commented-out code; git
    remembers.

### Safety and errors

11. **Escape every value that goes into HTML** with `esc()`, even your own data. Post text only
    becomes HTML through `lib/markdown.mjs`.
12. **Do not loosen** the markdown renderer's escaping or link rules without a test that proves it.
13. **Fail loudly, and say what to do next.** An empty `catch` is allowed only around browser
    storage that may be blocked, with a comment saying so.

### Comments

14. **Say why, not what.** A comment explains a choice that is not obvious ("in CI a failed fetch fails
    the build on purpose"). If code needs a comment to say what it does, rename or split it instead.

### Tests

15. **Every pure function in `lib/` has a test,** and a behaviour change gets a test in the same
    commit. Name tests for what should happen: "raw HTML in a post is escaped".

### CSS

16. **Tokens, not raw values.** Colours, fonts, and widths are custom properties in `:root`. No raw hex
    outside `:root`.
17. **Class names are lowercase with hyphens and say what the thing is** (`post-list`, not
    `blue-box`). One short comment per component section.
18. **Every animation has a `prefers-reduced-motion` rule.** No blinking, flashing, or looping motion
    on the page's text or header.

## Before you commit

- Does each file I touched start with its purpose, and is it still under 200 lines?
- No `var`, no unused code, no new magic numbers, no raw hex in CSS?
- Is every value in HTML escaped?
- Is there a test for the behaviour I changed?
- `node --test markdown.test.mjs` and `node build.mjs` both run clean?
- Did I read my own diff once, as if someone else wrote it?

## Tidying old code

When you change a file, leave it a little tidier than you found it. Keep tidying and behaviour in
separate commits: a "tidy" commit changes no behaviour, and the tests pass before and after it.

## Known debt (fix it when you touch the file)

- `build.mjs` is about 260 lines and does five jobs: loading posts, fetching projects, HTML
  templates, the build, and the preview server. Split into `lib/posts.mjs`, `lib/projects.mjs`,
  `lib/templates.mjs`, and `lib/serve.mjs`.
- `SITE_URL` in `build.mjs` is unused.
- `aboutPage` and `projectsPage` build lists inside template strings, one of them a nested template
  on a 150-character line.
- `site/bird.js` is ES5 with `var`. Sprite data, the nest, and the bird's behaviour share one
  110-line function. The timings (520, 150, 1100, 1600, 2400) and distances (160, 200, 100) are magic
  numbers, and its hex colours repeat the ones in the CSS and `lib/pixels.mjs`.
- The storage keys `'theme'` and `'nest'` are written out in the layout's head script, `site.js`, and
  `bird.js`.
- Nothing tests the page templates. A small test that builds into a temp folder would.
