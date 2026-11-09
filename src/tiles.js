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

export function drawGround(ctx, x, y, col, row, grassOnTop, pal = COLORS) {
  px(ctx, COLORS.dirt, x, y, TILE, TILE);
  for (let i = 0; i < 14; i++) {
    const dx = Math.floor(hash(col, row, i) * TILE);
    const dy = Math.floor(hash(col, row, i + 50) * TILE);
    const c = hash(col, row, i + 100) < 0.5 ? COLORS.dirtDark : COLORS.dirtLight;
    px(ctx, c, x + dx, y + dy, 2, 1);
  }
  if (grassOnTop) {
    px(ctx, pal.grass, x, y, TILE, 4);
    for (let dx = 0; dx < TILE; dx += 2) {
      const len = 1 + Math.floor(hash(col, row, dx) * 3);
      px(ctx, pal.grass, x + dx, y + 4, 2, len);
      if (hash(col, row, dx + 7) < 0.4) px(ctx, pal.grassDark, x + dx, y + 1, 2, 1);
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

// Vatten: 'base' ritas bakom älgen, 'overlay' ritas framför (halvt genomskinligt)
// så att en simmande älg syns genom vattnet.
export function drawWater(ctx, x, y, col, row, isSurface, ticks, mode) {
  if (mode === 'base') {
    px(ctx, '#2f5f7f', x, y, TILE, TILE);
    for (let i = 0; i < 3; i++) {
      const dx = Math.floor(hash(col, row, i) * TILE);
      const dy = Math.floor(hash(col, row, i + 20) * TILE);
      px(ctx, '#3d7194', x + dx, y + dy, 3, 1);
    }
    return;
  }
  ctx.fillStyle = 'rgba(110, 170, 205, 0.38)';
  ctx.fillRect(x, y, TILE, TILE);
  if (isSurface) {
    for (let dx = 0; dx < TILE; dx++) {
      const wave = Math.round(Math.sin((col * TILE + dx) / 3 + ticks / 12));
      px(ctx, '#9fd0e6', x + dx, y + 1 + wave, 1, 1);
      px(ctx, '#d6eef7', x + dx, y + 1 + wave - 1, hash(col, dx, Math.floor(ticks / 20)) < 0.15 ? 1 : 0, 1);
    }
  }
  // Glitter
  const gx = Math.floor(hash(col, row, Math.floor(ticks / 30)) * TILE);
  const gy = Math.floor(hash(row, col, Math.floor(ticks / 30)) * TILE);
  px(ctx, '#d6eef7', x + gx, y + gy, 1, 1);
}

export function drawRoad(ctx, x, y, col, row) {
  px(ctx, '#4a4a48', x, y, TILE, TILE);
  px(ctx, '#8a8780', x, y, TILE, 2); // kantsten
  px(ctx, '#5a5a57', x, y + 2, TILE, 1);
  if (col % 2 === 0) px(ctx, '#d8d0b8', x + 2, y + 7, 10, 1); // mittlinje
  for (let i = 0; i < 4; i++) {
    const dx = Math.floor(hash(col, row, i) * TILE);
    const dy = 3 + Math.floor(hash(col, row, i + 9) * 12);
    px(ctx, '#3a3a38', x + dx, y + dy, 2, 1);
  }
}

export function drawRail(ctx, x, y, col, row) {
  px(ctx, '#6a655c', x, y, TILE, TILE); // makadam
  for (let i = 0; i < 6; i++) {
    const dx = Math.floor(hash(col, row, i) * TILE);
    const dy = 4 + Math.floor(hash(col, row, i + 9) * 11);
    px(ctx, i % 2 ? '#8a857a' : '#4f4b44', x + dx, y + dy, 2, 1);
  }
  px(ctx, '#5a3f28', x + 2, y + 1, 4, 5); // syllar
  px(ctx, '#5a3f28', x + 10, y + 1, 4, 5);
  px(ctx, '#a9a69d', x, y, TILE, 2); // räls
  px(ctx, '#d0cdc4', x, y, TILE, 1);
}

// Röse (stenhög) med en liten flagga. Flaggan hissas när älgen nått den.
export function drawCheckpoint(ctx, x, y, active, ticks) {
  const base = y + TILE; // marken
  px(ctx, '#6a6862', x + 1, base - 5, 14, 5);
  px(ctx, '#8a8780', x + 2, base - 5, 12, 2);
  px(ctx, '#7a7771', x + 3, base - 9, 10, 4);
  px(ctx, '#a9a69d', x + 4, base - 9, 6, 2);
  px(ctx, '#8a8780', x + 5, base - 12, 6, 3);
  px(ctx, COLORS.pole, x + 7, base - 26, 1, 15); // stång
  if (active) {
    const wave = Math.round(Math.sin(ticks / 10));
    px(ctx, '#e0c050', x + 8, base - 26, 7, 5);
    px(ctx, '#c9a23a', x + 8, base - 22 + wave, 5, 2);
  } else {
    px(ctx, '#6a6862', x + 8, base - 26, 5, 3);
  }
}
