// Loggan: spelets älg och ordmärket "PXL MOOSE" på en liten skylt. Ritas med kod,
// så att den ser likadan ut i spelet och i sidhuvudet på webbsidan.
import { drawMoose } from './mooseSprite.js';
import { text } from './text.js';

export const LOGO_W = 140;
export const LOGO_H = 44;

/**
 * Ritar loggan med övre vänstra hörnet vid (x, y).
 * k = storlek (1 = 140×44 pixlar, 2 = dubbelt så stor).
 */
export function drawLogo(ctx, x, y, k = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(k, k);

  // Skylt med kant
  ctx.fillStyle = '#2b1a10';
  ctx.fillRect(0, 0, LOGO_W, LOGO_H);
  ctx.fillStyle = '#b4c7b3';
  ctx.fillRect(2, 2, LOGO_W - 4, LOGO_H - 4);
  ctx.fillStyle = '#c7d6c1';
  ctx.fillRect(2, 2, LOGO_W - 4, 3);
  // Hörnpixlar för en lite rundad skylt
  ctx.fillStyle = '#1b1a17';
  for (const [cx, cy] of [[0, 0], [LOGO_W - 2, 0], [0, LOGO_H - 2], [LOGO_W - 2, LOGO_H - 2]]) {
    ctx.fillRect(cx, cy, 2, 2);
  }

  // Mark under älgen
  ctx.fillStyle = '#4f7a3a';
  ctx.fillRect(2, 38, LOGO_W - 4, 4);
  ctx.fillStyle = '#3d6230';
  ctx.fillRect(2, 41, LOGO_W - 4, 1);

  // Älgen (samma som i spelet), vänd mot ordmärket
  drawMoose(ctx, 24, 38, 1, 0, true, 0);

  // Ordmärke
  text(ctx, 'PXL', 52, 8, { size: 8, color: '#8a3b2a', shadow: false });
  text(ctx, 'MOOSE', 52, 18, { size: 16, color: '#3a2414', shadow: '#d8e2d0' });

  ctx.restore();
}
