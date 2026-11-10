// Poäng, liv och skärmar – allt ritas med kod.
import { VIEW_W, VIEW_H, START_LIVES } from './config.js';
import { COLORS } from './tiles.js';
import { audio } from './audio.js';
import { drawLogo } from './logo.js';
import { text } from './text.js';

const ACCENT = '#d05a37'; // varm orange (rubriker, uppmaningar, poäng-popups)
const SOFT = '#cfc8b0';
const MAX_W = VIEW_W - 16; // texten ska aldrig gå ut över kanten

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
  const slots = Math.max(START_LIVES, game.lives);
  for (let i = 0; i < slots; i++) {
    drawHeart(ctx, 36 + i * 10, 7, i < game.lives ? '#c0452b' : '#4a3a34');
  }
  text(ctx, 'POÄNG ' + String(game.score).padStart(6, '0'), VIEW_W - 6, 6, { align: 'right' });
  drawSpeaker(ctx, VIEW_W - 16, 19);
}

export function drawPopups(ctx, game, camX) {
  for (const pop of game.popups) {
    text(ctx, pop.text, Math.round(pop.x - camX), Math.round(pop.y), { align: 'center', color: ACCENT });
  }
}

// Liten högtalare (M slår av/på). Röd snedstreck när ljudet är av.
function drawSpeaker(ctx, x, y) {
  const on = !audio.muted;
  ctx.fillStyle = on ? COLORS.text : '#8a8780';
  ctx.fillRect(x, y + 2, 2, 3);
  ctx.fillRect(x + 2, y + 1, 1, 5);
  ctx.fillRect(x + 3, y, 1, 7);
  if (on) {
    ctx.fillRect(x + 5, y + 2, 1, 3);
    ctx.fillRect(x + 7, y + 1, 1, 5);
  } else {
    ctx.fillStyle = '#c0452b';
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 5 + i * 0.8, y + 1 + i, 1, 1);
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

  // Vänsterställd layout: loggan och texten börjar på samma kant
  const lx = 40;
  drawLogo(ctx, lx, 14, 3);

  text(ctx, 'HUR DU SPELAR', lx, 98, { color: ACCENT });
  text(ctx, 'A D eller pilar: gå', lx, 112);
  text(ctx, 'Mellanslag eller upp: hoppa', lx, 123);
  text(ctx, 'Hoppa på fiender, samla mat', lx, 134);
  text(ctx, 'Akta dig för jägare och trafik', lx, 145);
  text(ctx, 'Rösen sparar var du börjar om', lx, 156);

  if (blink(game)) text(ctx, 'Tryck mellanslag eller Enter', lx, 178, { color: ACCENT });
  text(ctx, 'P: paus', lx, 198, { color: SOFT });
  text(ctx, 'M: ljud av/på', lx, 210, { color: SOFT });
}

export function drawPaused(ctx) {
  dim(ctx, 0.6);
  text(ctx, 'PAUS', VIEW_W / 2, 70, { size: 32, align: 'center' });
  text(ctx, 'P, Esc eller mellanslag: fortsätt', VIEW_W / 2, 118, { align: 'center', color: ACCENT, maxWidth: MAX_W });
  text(ctx, 'M: ljud av/på', VIEW_W / 2, 134, { align: 'center', color: SOFT });
}

export function drawDying(ctx, game) {
  dim(ctx, 0.35);
  text(ctx, game.deathText || 'Du ramlade!', VIEW_W / 2, VIEW_H / 2 - 8, {
    size: 16,
    align: 'center',
    maxWidth: MAX_W,
  });
}

export function drawGameOver(ctx, game) {
  dim(ctx, 0.7);
  text(ctx, 'MOOSE OVER', VIEW_W / 2, 62, { size: 24, align: 'center', color: '#c0452b' });
  text(ctx, 'Poäng: ' + game.score, VIEW_W / 2, 108, { size: 16, align: 'center', maxWidth: MAX_W });
  if (game.timer === 0 && blink(game)) {
    text(ctx, 'Tryck mellanslag för att börja om', VIEW_W / 2, 150, { align: 'center', color: ACCENT, maxWidth: MAX_W });
  }
}

export function drawWon(ctx, game) {
  dim(ctx, 0.6);
  text(ctx, 'DU VANN!', VIEW_W / 2, 56, { size: 32, align: 'center', color: ACCENT });
  text(ctx, 'Älgen nådde målet', VIEW_W / 2, 100, { size: 16, align: 'center', maxWidth: MAX_W });
  text(ctx, 'Poäng: ' + game.score, VIEW_W / 2, 124, { size: 16, align: 'center', maxWidth: MAX_W });
  if (game.timer === 0 && blink(game)) {
    text(ctx, 'Tryck mellanslag för att spela igen', VIEW_W / 2, 160, { align: 'center', color: ACCENT, maxWidth: MAX_W });
  }
}

export function drawDebug(ctx, game, tickRate, targetRate) {
  const p = game.player;
  const mono = { font: 'monospace', size: 8 };
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(2, 30, 168, 24);
  text(ctx, `x ${Math.round(p.x)}  y ${Math.round(p.y)}  ${game.level.biomeAt(Math.floor(p.x / 16))}`, 5, 32, mono);
  text(ctx, `uppdateringar/s: ${tickRate} (ska vara ${targetRate})`, 5, 43, mono);
}
