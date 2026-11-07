// The bird's pixels: a small grid of letters, drawn as an SVG.

const PIXEL_PX = 6; // how big one bird pixel is on screen
const COLUMNS = 12;
const ROWS = 10;
const WING_BLUE = '#4F6FD8'; // a darker shade of --b, for the wing
const BELLY_CREAM = '#F4F1E8';

// The eye letter is a colour in the grid: ink when open, body blue when closed.
export const EYE_OPEN = 'K';
export const EYE_CLOSED = 'B';

function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Blue, orange, and eye ink come from the tokens in style.css, so those colours have one home.
function colours() {
  return { B: token('--b'), O: token('--c'), K: token('--on'), D: WING_BLUE, W: BELLY_CREAM };
}

function frame(eye, legs) {
  return [
    '.....BB.....',
    '....BBBB....',
    '...BBBBBB...',
    `...BBB${eye}BBOO.`,
    '..BBBBBBBO..',
    '..DDBBBWWW..',
    '..DDDBWWWW..',
    '...DDWWWW...',
    legs ? '....O..O....' : '............',
    '............',
  ];
}

function pixel(colour, x, y) {
  return `<rect x="${x}" y="${y}" width="1" height="1" fill="${colour}"/>`;
}

function pixelsOf(rows, palette) {
  return rows
    .flatMap((row, y) => [...row].map((letter, x) => (palette[letter] ? pixel(palette[letter], x, y) : '')))
    .join('');
}

export function spriteSvg(eye, legs) {
  const size = `width="${COLUMNS * PIXEL_PX}" height="${ROWS * PIXEL_PX}" viewBox="0 0 ${COLUMNS} ${ROWS}"`;
  const label = 'role="img" aria-label="A little blue bird. Click it."';
  return `<svg ${size} shape-rendering="crispEdges" ${label}>${pixelsOf(frame(eye, legs), colours())}</svg>`;
}
