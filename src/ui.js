// Text, poäng, liv och skärmar – allt ritas med kod.
import { VIEW_W, VIEW_H, START_LIVES } from './config.js';
import { COLORS } from './tiles.js';
import { drawMoose } from './mooseSprite.js';

const FONT = 'monospace';

function text(ctx, str, x, y, { size = 8, color = COLORS.text, align = 'left', bold = true } = {}) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#1b1a17';
  ctx.fillText(str, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

const HEART = [
  '.##.##.',
  '#######',
  '#######',
  '.#####.',
  '..###..',
  '...#...',
];

function drawHeart(ctx, x, y, color) {
  ctx.fillStyle = color;
  HEART.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      if (row[rx] === '#') ctx.fillRect(x + rx, y + ry, 1, 1);
    }
  });
}

export function drawHud(ctx, game) {
  // Liv uppe till vänster, poäng uppe till höger.
  text(ctx, 'LIV', 6, 6);
  for (let i = 0; i < START_LIVES; i++) {
    drawHeart(ctx, 30 + i * 10, 6, i < game.lives ? '#c0452b' : '#4a3a34');
  }
  text(ctx, 'POÄNG ' + String(game.score).padStart(6, '0'), VIEW_W - 6, 6, { align: 'right' });
}

export function drawPopups(ctx, game, camX) {
  for (const pop of game.popups) {
    text(ctx, pop.text, Math.round(pop.x - camX), Math.round(pop.y), { align: 'center', color: '#e0c050' });
  }
}

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(20, 18, 14, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function blink(game) {
  return Math.floor(game.ticks / 30) % 2 === 0;
}

export function drawTitle(ctx, game) {
  dim(ctx, 0.62);

  // Stor älg
  ctx.save();
  ctx.translate(VIEW_W - 45, 146);
  ctx.scale(3, 3);
  drawMoose(ctx, 0, 0, -1, 0, true, 0);
  ctx.restore();

  text(ctx, 'PXL MOOSE', VIEW_W / 2, 14, { size: 28, align: 'center' });
  text(ctx, 'Så spelar du', 40, 62, { color: '#e0c050' });
  text(ctx, '← → eller A D   gå', 40, 76);
  text(ctx, 'Mellanslag eller ↑   hoppa', 40, 88);
  text(ctx, 'Hoppa på björnar och vargar.', 40, 104);
  text(ctx, 'Ta dig till flaggan. Du har tre liv.', 40, 116);

  if (blink(game)) {
    text(ctx, 'Tryck mellanslag eller Enter', VIEW_W / 2, 170, { align: 'center', color: '#e0c050' });
  }
}

export function drawDying(ctx, game) {
  dim(ctx, 0.35);
  text(ctx, game.deathText || 'Du ramlade!', VIEW_W / 2, VIEW_H / 2 - 8, { size: 16, align: 'center' });
}

export function drawGameOver(ctx, game) {
  dim(ctx, 0.7);
  text(ctx, 'MOOSE OVER', VIEW_W / 2, 62, { size: 28, align: 'center', color: '#c0452b' });
  text(ctx, 'Poäng: ' + game.score, VIEW_W / 2, 108, { size: 12, align: 'center' });
  if (game.timer === 0 && blink(game)) {
    text(ctx, 'Tryck mellanslag för att börja om', VIEW_W / 2, 150, { align: 'center', color: '#e0c050' });
  }
}

export function drawWon(ctx, game) {
  dim(ctx, 0.6);
  text(ctx, 'DU VANN!', VIEW_W / 2, 62, { size: 28, align: 'center', color: '#e0c050' });
  text(ctx, 'Älgen nådde målet', VIEW_W / 2, 96, { size: 10, align: 'center' });
  text(ctx, 'Poäng: ' + game.score, VIEW_W / 2, 112, { size: 12, align: 'center' });
  if (game.timer === 0 && blink(game)) {
    text(ctx, 'Tryck mellanslag för att spela igen', VIEW_W / 2, 150, { align: 'center', color: '#e0c050' });
  }
}

export function drawDebug(ctx, game, tickRate, targetRate) {
  const p = game.player;
  ctx.fillStyle = '#00000088';
  ctx.fillRect(2, 18, 150, 24);
  text(ctx, `x ${Math.round(p.x)}  y ${Math.round(p.y)}  ${game.level.biomeAt(Math.floor(p.x / 16))}`, 5, 20, { bold: false });
  text(ctx, `uppdateringar/s: ${tickRate} (ska vara ${targetRate})`, 5, 31, { bold: false });
}
