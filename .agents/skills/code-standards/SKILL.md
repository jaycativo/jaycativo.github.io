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
   scripts in `site/` are ES modules (`<script type="module">`), so nothing leaks into the page, and
   each one imports what it needs.
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
- `node --test *.test.mjs` and `node build.mjs` both run clean?
- Did I look at the page in a browser, if I changed anything it shows or does?
- Did I read my own diff once, as if someone else wrote it?

## Tidying old code

When you change a file, leave it a little tidier than you found it. Keep tidying and behaviour in
separate commits: a "tidy" commit changes no behaviour, and the tests pass before and after it.

## Known debt (fix it when you touch the file)

The first big tidy (splitting `build.mjs` and the bird into small modules) is done. What is left:

- The scripts in `site/` have no automated tests. They are checked by hand in a browser: the bird,
  the nest button, and the paper toggle. A small browser test would close this.
- `lib/pixels.mjs` repeats the sage, blue, and orange from the tokens in `site/style.css`, and
  `site/sprite.js` has two colours (the wing and the belly) that are not tokens. Both are artwork, and
  both have a comment saying so. If the palette changes, change all three places.
- The storage keys `'theme'` and `'nest'` appear in the inline head script and in the module that
  owns each one. That cannot be shared between a build script and a page, so each place has a comment
  pointing at the others.
- The markdown renderer handles lists one level deep, with no syntax colouring in code blocks.

Add to this list when you spot something you cannot fix in the same change.
