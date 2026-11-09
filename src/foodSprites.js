// Maten ritas med kod: små pixelmönster där varje tecken är en färg.

export const FOOD = {
  k: { name: 'sälgkvist', points: 10 },
  g: { name: 'granskott', points: 15 },
  b: { name: 'blåbärsris', points: 25 },
};

const SPRITES = {
  // Sälg/vide: bruna kvistar med gröna blad och ljusa gullkart
  k: {
    pal: { s: '#6b4a2f', l: '#7f9d45', L: '#a9c765', c: '#e6dfa8' },
    map: [
      '................',
      '..........lL....',
      '.........lLLl.c.',
      '.....lL..LLl.cc.',
      '....lLLl..s.c...',
      '....lLl..s......',
      '.....l..s..lL...',
      '........s..LLl..',
      '....lL.s....l...',
      '...lLLls........',
      '....ll.s........',
      '......s.........',
      '.....s..........',
      '.....s..........',
      '................',
      '................',
    ],
  },
  // Blåbärsris: gröna blad och blå bär
  b: {
    pal: { g: '#4f7a3a', G: '#7aa04c', b: '#3b4a94', B: '#7f8fe0' },
    map: [
      '................',
      '................',
      '......g..g......',
      '.....gGg.gG.....',
      '....gGgg.g.g....',
      '.....g.bbg......',
      '......gbBbg.....',
      '.....g.bbb.g....',
      '....gGg.g.gG....',
      '.....g..g.g.....',
      '......g.g.g.....',
      '.......ggg......',
      '........g.......',
      '................',
      '................',
      '................',
    ],
  },
  // Granskott: ljusgröna, nyutslagna skott
  g: {
    pal: { G: '#a5d860', g: '#6aa83c', s: '#6b4a2f' },
    map: [
      '................',
      '................',
      '................',
      '.......G........',
      '......GgG.......',
      '.....GGgGG......',
      '....GgGgGgG.....',
      '.....GgGgG......',
      '......GgG.......',
      '.......s........',
      '.......s........',
      '.......s........',
      '................',
      '................',
      '................',
      '................',
    ],
  },
};

export function drawFood(ctx, ch, x, y) {
  const sprite = SPRITES[ch];
  if (!sprite) return;
  sprite.map.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = sprite.pal[row[rx]];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x + rx, y + ry, 1, 1);
      }
    }
  });
}
