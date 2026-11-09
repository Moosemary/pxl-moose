// Procedurellt ritade rutor – inga bildfiler.
import { TILE } from './levelParser.js';

export const COLORS = {
  sky: '#9db7a8',
  skyFar: '#b4c7b3',
  grass: '#5c7a3a',
  grassDark: '#486230',
  dirt: '#6b4a2f',
  dirtDark: '#553a24',
  dirtLight: '#7d5a3a',
  stone: '#8a8780',
  stoneDark: '#6a6862',
  stoneLight: '#a9a69d',
  text: '#f1e6c8',
  flag: '#c0452b',
  pole: '#4a3a2a',
};

// Enkel, förutsägbar "slump" utifrån position, så att rutorna ser likadana ut varje gång.
function hash(a, b, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function px(ctx, color, x, y, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawGround(ctx, x, y, col, row, grassOnTop) {
  px(ctx, COLORS.dirt, x, y, TILE, TILE);
  for (let i = 0; i < 14; i++) {
    const dx = Math.floor(hash(col, row, i) * TILE);
    const dy = Math.floor(hash(col, row, i + 50) * TILE);
    const c = hash(col, row, i + 100) < 0.5 ? COLORS.dirtDark : COLORS.dirtLight;
    px(ctx, c, x + dx, y + dy, 2, 1);
  }
  if (grassOnTop) {
    px(ctx, COLORS.grass, x, y, TILE, 4);
    for (let dx = 0; dx < TILE; dx += 2) {
      const len = 1 + Math.floor(hash(col, row, dx) * 3);
      px(ctx, COLORS.grass, x + dx, y + 4, 2, len);
      if (hash(col, row, dx + 7) < 0.4) px(ctx, COLORS.grassDark, x + dx, y + 1, 2, 1);
    }
  }
}

export function drawStone(ctx, x, y, col, row) {
  px(ctx, COLORS.stone, x, y, TILE, TILE);
  px(ctx, COLORS.stoneLight, x, y, TILE, 2); // ljus kant ovanpå
  px(ctx, COLORS.stoneLight, x, y, 2, TILE);
  px(ctx, COLORS.stoneDark, x, y + TILE - 2, TILE, 2); // mörk kant nedtill
  px(ctx, COLORS.stoneDark, x + TILE - 2, y, 2, TILE);
  for (let i = 0; i < 4; i++) {
    const dx = 3 + Math.floor(hash(col, row, i) * (TILE - 8));
    const dy = 3 + Math.floor(hash(col, row, i + 9) * (TILE - 8));
    px(ctx, COLORS.stoneDark, x + dx, y + dy, 3, 1);
  }
}

export function drawGoal(ctx, x, y) {
  // Flaggstång som tar upp ruta och ruta under (spelaren når den på marken).
  px(ctx, COLORS.pole, x + 7, y - TILE * 2, 2, TILE * 3);
  px(ctx, COLORS.flag, x + 9, y - TILE * 2, 9, 6);
  px(ctx, COLORS.flag, x + 9, y - TILE * 2 + 6, 6, 2);
}

export function drawStartMarker(ctx, x, y) {
  px(ctx, COLORS.pole, x + 7, y + 4, 2, 12);
  px(ctx, '#e0c050', x + 3, y + 2, 10, 4);
}
