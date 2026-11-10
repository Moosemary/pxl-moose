// Loggan: älghuvudet och ordmärket "PXL MOOSE", från konstverket pxl-moose-2-skuggad.svg,
// omräknat till ett pixelrutnät. Ritas med kod, så den är skarp i alla storlekar och ser likadan ut
// på startskärmen och i sidhuvudet.
//
//   .  tomt        a  logotypens färg        b  ögat

const GRID = [
  '............aa......................................................',
  '............aa..aaa.................................................',
  '.......aa...aa..aaa..aa.............................................',
  '.......aa...aa..aaa..aa.............................................',
  '.......aa...aa..aaa..aa.............................................',
  '.......aaaaaaaaaaaaaaaa.............................................',
  '.......aaaaaaaaaaaaaaaa......aaaaaa..aa...aa.aa.....................',
  '............aa...............aa...aa.aa...aa.aa.....................',
  '........aa..aa...............aa...aa..aa.aa..aa.....................',
  '........aa..aa...............aa...aa...aaa...aa.....................',
  '........aaaaaaa..............aaaaaa...aa.aa..aa.....................',
  '....aaaaaaaaaaaaaaaaaaa......aa......aa...aa.aa.....................',
  'aaaaaaaaaaaabbaaaaaaaaa......aa......aa...aa.aaaaaaa................',
  'aaaaaaaaaaaabbaaaaaaaaa.............................................',
  'aaaaaaaaaaaaaaaaaaaaaaa.............................................',
  'aaaaaaaaaaaaaaaaaaaaaaa......aa...aa..aaaaa...aaaaa...aaaaa..aaaaaaa',
  'aaaaaaaaaaaaaaa..aaaaaa......aaa.aaa.aa...aa.aa...aa.aa...aa.aa.....',
  'aaaaaaaaaa...aa..aaaaaa......aaaaaaa.aa...aa.aa...aa.aa......aa.....',
  'aaaaaaaaaa...aa..............aa.a.aa.aa...aa.aa...aa..aaaaa..aaaaaa.',
  'aaaaaaaaaa...aa..............aa.a.aa.aa...aa.aa...aa......aa.aa.....',
  'aaaaaaaaaa...................aa...aa.aa...aa.aa...aa.aa...aa.aa.....',
  'aaaaaaaaaa...................aa...aa..aaaaa...aaaaa...aaaaa..aaaaaaa',
];

export const LOGO_W = GRID[0].length; // bredd i rutor
export const LOGO_H = GRID.length; // höjd i rutor

// Den liggande loggan (älghuvud + "PXL MOOSE" på en rad), mindre och lugnare – för sidhuvudet.
// Samma tecken som ovan, men med dubbelt så fin rutstorlek (en "ruta" är en halv logotyprutan).
const WIDE = [
  '...............aaaa......................................................................................................................................................',
  '...............aaaa...aaa................................................................................................................................................',
  '..........aa...aaaa...aaa................................................................................................................................................',
  '.........aaaa..aaaa...aaa...aaa..........................................................................................................................................',
  '.........aaaa..aaaa...aaa...aaa..........................................................................................................................................',
  '.........aaaa..aaaa...aaa...aaa..........................................................................................................................................',
  '.........aaaaaaaaaaaaaaaaaaaaaa..........................................................................................................................................',
  '.........aaaaaaaaaaaaaaaaaaaaaa..........................................................................................................................................',
  '.........aaaaaaaaaaaaaaaaaaaaaa..........................................................................................................................................',
  '.........aaaaaaaaaaaaaaaaaaaaaa..........................................................................................................................................',
  '...............aaaa......................................................................................................................................................',
  '...............aaaa......................................................................................................................................................',
  '.........aaaa..aaaa......................................................................................................................................................',
  '.........aaaa..aaaa......................................................................................................................................................',
  '.........aaaaaaaaaaaa....................................................................................................................................................',
  '......aaaaaaaaaaaaaaaaaaaaaaaaa..........aaaaaaaaaaaa...aaaa......aaaa..aaaaa...............aaaa......aaaa....aaaaaaaaaa......aaaaaaaaaa......aaaaaaaaaa...aaaaaaaaaaaaaa',
  '.....aaaaaaaaaaabbaaaaaaaaaaaaa..........aaaaaaaaaaaa...aaaa......aaaa..aaaaa...............aaaa......aaaa....aaaaaaaaaa......aaaaaaaaaa......aaaaaaaaaa...aaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaabbaaaaaaaaaaaaa..........aaaa......aaaa.aaaa......aaaa..aaaaa...............aaaaaa..aaaaaa..aaaa......aaaa..aaaa......aaaa..aaaa......aaaa.aaaa..........',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..........aaaa......aaaa.aaaa......aaaa..aaaaa...............aaaaaa..aaaaaa..aaaa......aaaa..aaaa......aaaa..aaaa......aaaa.aaaa..........',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..........aaaa......aaaa...aaaa..aaaa....aaaaa...............aaaaaaaaaaaaaa..aaaa......aaaa..aaaa......aaaa..aaaa...........aaaa..........',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..........aaaa......aaaa...aaaa..aaaa....aaaaa...............aaaaaaaaaaaaaa..aaaa......aaaa..aaaa......aaaa..aaaa...........aaaa..........',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..........aaaa......aaaa.....aaaaaa......aaaaa...............aaaa..aa..aaaa..aaaa......aaaa..aaaa......aaaa....aaaaaaaaaa...aaaaaaaaaaaa..',
  'aaaaaaaaaaaaaaaaaaaaa..aaaaaaaa..........aaaa......aaaa.....aaaaaa......aaaaa...............aaaa..aa..aaaa..aaaa......aaaa..aaaa......aaaa....aaaaaaaaaa...aaaaaaaaaaaa..',
  'aaaaaaaaaaaaaaaaaaaaa..aaaaaaaa..........aaaaaaaaaaaa.....aaaa..aaaa....aaaaa...............aaaa..aa..aaaa..aaaa......aaaa..aaaa......aaaa............aaaa.aaaa..........',
  'aaaaaaaaaaaaa....aaaa....................aaaaaaaaaaaa.....aaaa..aaaa....aaaaa...............aaaa..aa..aaaa..aaaa......aaaa..aaaa......aaaa............aaaa.aaaa..........',
  'aaaaaaaaaaaaa....aaaa....................aaaa...........aaaa......aaaa..aaaaa...............aaaa......aaaa..aaaa......aaaa..aaaa......aaaa..aaaa......aaaa.aaaa..........',
  'aaaaaaaaaaaaa....aaaa....................aaaa...........aaaa......aaaa..aaaaa...............aaaa......aaaa..aaaa......aaaa..aaaa......aaaa..aaaa......aaaa.aaaa..........',
  'aaaaaaaaaaaaa....aaaa....................aaaa...........aaaa......aaaa..aaaaaaaaaaaaaa......aaaa......aaaa....aaaaaaaaaa......aaaaaaaaaa......aaaaaaaaaa...aaaaaaaaaaaaaa',
  'aaaaaaaaaaaaa............................aaaa...........aaaa......aaaa..aaaaaaaaaaaaaa......aaaa......aaaa....aaaaaaaaaa......aaaaaaaaaa......aaaaaaaaaa...aaaaaaaaaaaaaa',
];

export const LOGO_WIDE_W = WIDE[0].length;
export const LOGO_WIDE_H = WIDE.length;

export const LOGO_DARK = { color: '#3a2b21', eye: '#f1e5c7' }; // original, för ljus bakgrund
export const LOGO_LIGHT = { color: '#f1e5c7', eye: '#3a2b21' }; // ljus version, för mörk bakgrund

/**
 * Ritar loggan med övre vänstra hörnet vid (x, y).
 * k = antal pixlar per ruta (hela tal ger skarpast resultat). colors = LOGO_DARK eller LOGO_LIGHT.
 */
export function drawLogo(ctx, x, y, k = 1, colors = LOGO_LIGHT) {
  drawGrid(ctx, GRID, x, y, k, colors);
}

/** Den liggande loggan. k = pixlar per ruta. */
export function drawLogoWide(ctx, x, y, k = 1, colors = LOGO_LIGHT) {
  drawGrid(ctx, WIDE, x, y, k, colors);
}

function drawGrid(ctx, grid, x, y, k, colors) {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.') {
        c++;
        continue;
      }
      let e = c;
      while (e < row.length && row[e] === ch) e++; // en sammanhängande rad av samma sort ritas som en rektangel
      ctx.fillStyle = ch === 'b' ? colors.eye : colors.color;
      ctx.fillRect(x + c * k, y + r * k, (e - c) * k, k);
      c = e;
    }
  }
}
