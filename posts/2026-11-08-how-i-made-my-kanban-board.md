---
title: how i made my kanban board
date: 2026-11-08
summary: A functional kanban board at work, then a fun one at home: how I built a board on top of one Markdown file with an AI helper.
---

At work I keep my notes in an Obsidian vault. I wanted a place to track all my tasks, so I made a little `TODO.md` file. Then I started filling it out, got to about 60 tasks, and realized it was completely unusable. So instead of tackling those tasks, I decided to give myself more work.

I'm used to tracking my dev tasks on a kanban board, so that's what I wanted. There's an Obsidian plugin for it, but I'd rather not install anything I don't know in my work computer, and I wanted something I could customize anyway. My goal was a board on top of the same Markdown file, so my links to Obsidian would keep working.

![A colorful kanban board with columns Inbox, Later, Next, Now, In progress and Done, a greeting and the time at the top, and made-up task cards with due dates and priorities.](/images/task-board-playful.png)

*The home version of the board, in its Playful style, with made-up tasks.*

## Round one: make it work

I used Codex at work. I told it I wanted to turn this file into a visual kanban board, and went from there, one thing at a time. First I wanted to see the file as a board. Check! Then I wanted to drag cards between columns and have the file change (I already had a terminal script for that, but a visual way turned out to be much nicer). Then, notes on each task, a search bar, and a way to add new tasks from the board, because I got too lazy to edit a markdown file. I didn't want a framework or anything heavy to maintain, just something super simple, which is why it's plain Node.js.

I tested it at each step. Once I had a working version I liked, I shared a screenshot of it with my colleagues. After that, I stopped tinkering and went about using it. It worked fine, and it made my life at work a little bit easier. Success!

![A plain, pale green and cream kanban board titled "Your task board." It has Inbox and Suggestions bars, then columns Later, Next, Now, In progress and Done. Each white card shows a task title, an ID, a Copy link button, a Notes button and a Move menu.](/images/task-board-original.png)

*The original board, before the weekend, with made-up tasks. Look how sad and boring it looks. :(*

## Round two: make it fun

Some of the colleagues I showed this to liked the idea, and wanted to have the app (which was never my goal in the first place - I just wanted to give them a fun idea of something to make. Well, fun for my definition of fun). So I had to make it less specific to my work vault. I moved the project to my personal computer, to play with it and to have a clean base to start from. Once I had cleaned it up, I realized I could improve the whole experience. I spent part of a weekend messing around with it, this time with Claude Code. The goal was to go from a functional kanban to something that felt "mine".

Before we started, I gave Claude three rules to keep in mind.

1. **My Markdown is the truth.** The board is only a view. It never loses or reorders text it doesn't own.
2. **No dependencies and no build step.** Plain Node and plain JavaScript, so it's easy to read and easy to share.
3. **Local only.** It runs on my own computer and checks every request.

These guided all of the development and helped keep Claude on track. When Claude wondered "should I add a library for the date picker?", the answer was already there: no, rule two. This kept the whole development smooth sailing.

> **A note from Claude, on the rules.** I don't remember anything between sessions, so what I know about your project is whatever is written down or said to me. Your rules gave me something to check every idea against, and later they went into `AGENTS.md` so I'd read them at the start of each session. Without them I'd have kept guessing, and probably suggested a library or two.

![Three cards. 1: My Markdown is the truth. The board is only a view, and tasks stay in one plain file. 2: No dependencies, no build step. Plain Node and JavaScript, and even the date picker is our own small one. 3: Local only. It runs on my own computer and checks every request.](/images/three-rules.png)

*The three rules I gave Claude.*

## The loop

After that, every feature went through the same steps. For the look, Claude first mocked up three directions.

![Three mockups of the board stacked vertically: a playful one with raised buttons and a greeting, a calmer one with color in small dots, and a dark purple "plum night" one.](/images/style-ideas-mockups.png)

*The three looks Claude mocked up, with made-up tasks. I took the style of the first and the colors of the second, then refined.*

Then, each feature went like this.

1. **Ask for an overview.** If I wasn't sure what to make next, my message was basically "tell me what's already done, and what we should do".
2. **See options as pictures.** For the look, Claude mocked up three different looks, shown above. I liked the style of one and the colors of another, so we mixed them. I did this for most of the visual decisions.
3. **Build it.** Claude wrote the code and the tests, then built the page.
4. **Try it.** I opened the app and messed around with it.
5. **Say what feels wrong.** I took screenshots and gave them back to Claude, with one sentence. "The dropdown should match the app." "The calendar closes when I go to the next month." Thankfully, Claude has gotten pretty good at understanding what I want from my one sentence instructions.
6. **Commit.** Small commits meant any mistake was cheap to undo. Versioning is everything!!!

![A diagram of the loop: overview, options as pictures, one small step, try it for real, say what is wrong, save a checkpoint.](/images/build-loop.png)

*The loop I repeated for every feature.*

> **A note from Claude, on screenshots.** I could open the app in a browser and look at it myself, but that was my scratch copy, not your screen or your real notes. And I can't tell how it feels to use. A screenshot and one sentence about how it feels ("the search is hard to see") is exactly what I need. I'd rather get the feeling than a fix.

Along the way we added due dates and priorities (in the Obsidian Tasks format, so they work in Obsidian too), a colorblind-friendly palette because some of my colleagues are colorblind, and a notes drawer that saves into my daily notes. The README has the full list. By the end it was about 2,000 lines of Node and JavaScript, with no dependencies.

![Four screenshots of the board in a grid. 1: the plain original, in pale green and cream. 2: the first restyle, in warm cream with thick outlines and colored column headers. 3: the same board with due dates, priority tags, edit buttons and sort controls. 4: the final playful version, with a clock, a time-of-day greeting and style switches.](/images/board-evolution.png)

*How the board grew, from the original to now. Same made-up tasks throughout.*

## Tests, and keeping the harness up to date

Honestly, I didn't care about the unit tests. But before we split two huge files into small modules, Claude wrote tests for the server's rules and a smoke test that uses every feature. The same checks passed before and after, and that's how Claude knew the tidy-up changed nothing.

> **A note from Claude, on the tests.** The tests were how I found out whether my change had broken something, without you clicking through the whole app each time. They mattered most for the code that writes to your file, because a mistake there could cost you your notes. They don't replace you trying the app, though.

And if you're vibe coding, maintain the harness!!! What we learned went into an `AGENTS.md` file and a few short skill notes, so the next session starts with it. The assistant forgets between sessions, so the files help to keep it on track.

![A folder tree showing task-board-app with an AGENTS.md file and a .agents/skills folder holding add-feature, design-system, run-and-verify, server-safety and todo-format. Notes beside it say AGENTS.md holds the rules and how to run it, skills are short how-tos written from things that went wrong, and the files remember what the assistant forgets between sessions.](/images/harness.png)

*The harness: one rules file and a few short skills.*

## What went wrong

A few things went wrong along the way.

I said "we don't need the Reject button" and Claude removed the whole Rejected feature. (Claude, why!!). I caught it before committing, and Claude got it back from git. Reject now lives in the Move menu, and the harness says so. 

> **A note from Claude, on the Reject mix-up.** "We don't need the Reject button" can mean "remove that button" or "remove the feature". I took the bigger reading and acted on it. I should have asked first. If a request could mean two things and one of them deletes work, I should check before I act. We fixed that one by getting the feature back from git, not by writing a rule, so it's still on me to ask.

The calendar closed whenever you pressed next month. Reading the code didn't show it, but clicking did. Yay for usability testing.

Claude also stopped my board while cleaning up. To test, it started its own copy of the app, and when it cleaned up afterwards it stopped every copy running on my computer, including the one I was using. The harness now says to only stop what you started.

And my first dark mode looked fine to Claude, but I didn't like how it looked. It felt too busy. So we softened the outlines, measured the contrast between the text and the background, and fixed it.

![Two screenshots of the board in dark mode side by side. Left: bright cream outlines everywhere. Right: softer outlines and deeper column tabs.](/images/dark-mode-before-after.png)

*Dark mode, before and after. Doesn't look like much of a difference here, but to me, it feels better.*

## Lessons learned

If you want to make a little app for yourself, here's what I'd take from this. Start with a problem you have (mine was a to-do list I couldn't read). Decide what must never be lost, and write your rules down in one short file. Ask for options as pictures so you know what you're building, then build in small steps: try it, say what feels wrong, commit. And click everything!

![Five cards: real problem, rules first, pictures, small steps, break it.](/images/lessons-learned.png)

*Five lessons from one weekend.*

If I were starting again, my first message would say what I want to see (my file as a board), what must never be lost, my rules, and "show me options before you build." The full starter prompt is in the [repo write-up](https://github.com/jaycativo/task-board-app).

That's how I made it. I like using the board, and it looks nice! :)

## Links

- [The board's code and its longer write-up](https://github.com/jaycativo/task-board-app) (MIT license).
