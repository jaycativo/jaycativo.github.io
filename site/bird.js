// The pet: a little blue bird. It hops, blinks, watches the pointer, and chirps when clicked.

import { spriteSvg, EYE_OPEN, EYE_CLOSED } from './sprite.js';
import { isNested, setupNest } from './nest.js';

const SAYINGS = ['chirp.', 'chirp chirp.', 'tweet?', 'hi.', 'nice beanie.'];

const START_X_PX = 24;
const MIN_X_PX = 10;
const RIGHT_GAP_PX = 100; // the bird stops this far from the right edge
const NARROW_LIMIT_PX = 24; // on a very narrow window it may still hop this far
const HOP_RANGE_PX = 200; // a random hop is at most half of this to either side
const BIRD_CENTRE_PX = 36;
const WATCH_ZONE_PX = 160; // the bird only watches the pointer near the bottom of the window

const HOP_MS = 520;
const BLINK_MS = 150;
const SAY_MS = 1600;
const TICK_MS = 2400;
const HOP_BELOW = 0.5; // each tick rolls 0 to 1: under this it hops,
const BLINK_BELOW = 0.85; // under this it blinks, and otherwise it rests

const calm = document.body.classList.contains('calm'); // post pages: no wandering
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = { x: START_X_PX, busy: false, sayTimer: 0 };

function createPerch() {
  const perch = document.createElement('div');
  perch.id = 'perch';
  perch.innerHTML =
    '<div id="bird"><div id="bird-say" role="status"></div>' +
    '<div id="flip"><div id="sprite"></div></div></div>';
  document.body.appendChild(perch);
  return {
    bird: perch.querySelector('#bird'),
    say: perch.querySelector('#bird-say'),
    flip: perch.querySelector('#flip'),
    sprite: perch.querySelector('#sprite'),
  };
}

const { bird, say, flip, sprite } = createPerch();

function show(eye, legs) {
  sprite.innerHTML = spriteSvg(eye, legs);
}

function face(direction) {
  flip.style.transform = direction > 0 ? 'none' : 'scaleX(-1)';
}

function restartHopAnimation() {
  sprite.classList.remove('hop');
  void sprite.offsetWidth; // forces the browser to notice, so the animation can run again
  sprite.classList.add('hop');
}

function hopTo(nextX) {
  if (state.busy) return;
  state.busy = true;
  if (nextX !== state.x) face(nextX > state.x ? 1 : -1);
  show(EYE_OPEN, false);
  restartHopAnimation();
  state.x = nextX;
  bird.style.left = `${nextX}px`;
  setTimeout(() => {
    show(EYE_OPEN, true);
    state.busy = false;
  }, HOP_MS);
}

function blink() {
  show(EYE_CLOSED, true);
  setTimeout(() => show(EYE_OPEN, true), BLINK_MS);
}

function chirp(text) {
  say.textContent = text || SAYINGS[Math.floor(Math.random() * SAYINGS.length)];
  say.style.opacity = 1;
  clearTimeout(state.sayTimer);
  state.sayTimer = setTimeout(() => {
    say.style.opacity = 0;
  }, SAY_MS);
}

function randomX() {
  const rightLimit = Math.max(NARROW_LIMIT_PX, window.innerWidth - RIGHT_GAP_PX);
  const next = state.x + (Math.random() - 0.5) * HOP_RANGE_PX;
  return Math.max(MIN_X_PX, Math.min(rightLimit, next));
}

function tick() {
  if (isNested()) return;
  const roll = Math.random();
  if (!calm && !reducedMotion && roll < HOP_BELOW) hopTo(randomX());
  else if (roll < BLINK_BELOW) blink();
}

function watchPointer(event) {
  if (state.busy || event.clientY < window.innerHeight - WATCH_ZONE_PX) return;
  face(event.clientX > state.x + BIRD_CENTRE_PX ? 1 : -1);
}

show(EYE_OPEN, true);
setupNest({ onLeaving: () => chirp('off to the nest.'), onReturn: () => chirp('hi.') });
bird.addEventListener('click', () => {
  chirp();
  hopTo(state.x);
});
window.addEventListener('mousemove', watchPointer);
setInterval(tick, TICK_MS);
