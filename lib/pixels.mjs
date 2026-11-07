// The pixel avatar. One grid, used for the favicon.

const ROWS = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '...dddddddddd...',
  '..RRRRRRRRRRRR..',
  '..RRSSSSSSSSRR..',
  '..RSEPSSSSEPSR..',
  '..RSEPSSSSEPSR..',
  '..SSSSSNNSSSSS..',
  '..SCCSSSSSSCCS..',
  '...SSSMSSMSSS...',
  '....SSSMMSSS....',
  '....SSSSSSSS....',
  '...ZZZZZZZZZZ...',
  '...ZZZZZZZZZZ...',
];

// Artwork colours. The beanie, sweater, and background match the sage, orange, and blue tokens in
// site/style.css; change them together.
const COLORS = {
  h: '#A6D8A0', // beanie
  d: '#82B87C', // beanie brim
  R: '#3B2F2A', // hair
  S: '#F3CDB6', // skin
  E: '#F4F1E8', // eye white
  P: '#26241F', // pupil
  N: '#F08A5D', // nose
  M: '#26241F', // mouth
  C: '#FFB48A', // cheeks
  Z: '#FF8A3D', // sweater
};

export function avatarSvg(background = '#7C9CFF') {
  let rects = `<rect width="16" height="16" fill="${background}"/>`;
  ROWS.forEach((row, y) => {
    for (let x = 0; x < 16; x++) {
      const color = COLORS[row[x]];
      if (color) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
    }
  });
  const attributes = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"';
  return `<svg ${attributes}>${rects}</svg>\n`;
}
