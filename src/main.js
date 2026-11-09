import { LEVEL_ROWS, BIOMES } from './level.js';
import { parseLevel, TILE } from './levelParser.js';
import { input } from './input.js';
import { startLoop, STEP } from './loop.js';
import { VIEW_W, VIEW_H } from './config.js';
import { Game } from './game.js';
import { drawGround, drawStone, drawGoal, drawStartMarker, drawWater, drawRoad, drawRail } from './tiles.js';
import { drawBackdrop, drawGroundDecor, drawRoadSigns, paletteFor } from './backdrop.js';
import { drawBullets } from './hunters.js';
import { drawFood } from './foodSprites.js';
import { drawPopups, drawHud, drawTitle, drawDying, drawGameOver, drawWon, drawDebug } from './ui.js';

const screen = document.getElementById('game');
const sctx = screen.getContext('2d');

const buffer = document.createElement('canvas');
buffer.width = VIEW_W;
buffer.height = VIEW_H;
const ctx = buffer.getContext('2d');

const level = parseLevel(LEVEL_ROWS, BIOMES);
const game = new Game(level);
// Kolumner där det står föremål eller fiender (där ritas ingen markdekor)
const occupiedCols = new Set(level.entities.map((e) => e.col));

// Mätare för att kunna kontrollera att takten är lika på alla skärmar (tryck F3).
let tickRate = 0;
let rateTicks = 0;
let rateStart = performance.now();

function update(dt) {
  rateTicks++;
  game.update(dt, input);
}

function resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
}

function drawLevel(camX) {
  const firstCol = Math.floor(camX / TILE);
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_W) / TILE));

  for (let row = 0; row < level.height; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const ch = level.tileAt(col, row);
      const x = col * TILE - camX;
      const y = row * TILE;
      if (ch === '#') drawGround(ctx, x, y, col, row, !'#=-'.includes(level.tileAt(col, row - 1)), paletteFor(level.biomeAt(col)));
      else if (ch === '=') drawRoad(ctx, x, y, col, row);
      else if (ch === '-') drawRail(ctx, x, y, col, row);
      else if (ch === 'S') drawStone(ctx, x, y, col, row);
      else if (ch === '~') drawWater(ctx, x, y, col, row, false, game.ticks, 'base');
    }
  }

  drawGroundDecor(ctx, level, camX, firstCol, lastCol, occupiedCols);
  drawRoadSigns(ctx, game.roads, camX);

  for (const road of game.roads) road.draw(ctx, camX, VIEW_H);
  for (const train of game.trains) train.draw(ctx, camX, VIEW_H, game.ticks);

  for (const h of game.hunters) {
    if (h.cx + 20 < camX || h.cx - 20 > camX + VIEW_W) continue;
    h.draw(ctx, camX, game.ticks);
  }

  for (const h of game.footHunters) {
    if (h.x + 20 < camX || h.x - 20 > camX + VIEW_W) continue;
    h.draw(ctx, camX, game.ticks);
  }

  for (const e of game.enemies) {
    if (e.removed || e.x + e.w < camX || e.x > camX + VIEW_W) continue;
    e.draw(ctx, camX);
  }

  for (const it of game.items) {
    if (it.taken || it.col < firstCol || it.col > lastCol) continue;
    const bob = Math.round(Math.sin(game.ticks / 15 + it.col));
    drawFood(ctx, it.ch, it.col * TILE - camX, it.row * TILE + bob);
  }

  if (level.goal) drawGoal(ctx, level.goal.col * TILE - camX, level.goal.row * TILE);
  if (game.state === 'title') drawStartMarker(ctx, level.start.col * TILE - camX, level.start.row * TILE);
}

function drawWaterOverlay(camX) {
  const firstCol = Math.floor(camX / TILE);
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_W) / TILE));
  for (let row = 0; row < level.height; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      if (!level.isWater(col, row)) continue;
      drawWater(ctx, col * TILE - camX, row * TILE, col, row, !level.isWater(col, row - 1), game.ticks, 'overlay');
    }
  }
}

function render() {
  const camX = Math.round(game.camera.x);
  drawBackdrop(ctx, camX, game.ticks, level);
  drawLevel(camX);
  if (game.state !== 'dying' || game.player.y < level.height * TILE) game.player.draw(ctx, camX);
  drawWaterOverlay(camX);
  drawBullets(ctx, game.bullets, camX);
  drawPopups(ctx, game, camX);

  switch (game.state) {
    case 'title':
      drawTitle(ctx, game);
      break;
    case 'dying':
      drawHud(ctx, game);
      drawDying(ctx, game);
      break;
    case 'gameover':
      drawHud(ctx, game);
      drawGameOver(ctx, game);
      break;
    case 'won':
      drawHud(ctx, game);
      drawWon(ctx, game);
      break;
    default:
      drawHud(ctx, game);
  }

  if (input.debug) {
    const now = performance.now();
    if (now - rateStart >= 1000) {
      tickRate = Math.round((rateTicks * 1000) / (now - rateStart));
      rateTicks = 0;
      rateStart = now;
    }
    drawDebug(ctx, game, tickRate, Math.round(1 / STEP));
  }

  // Skala upp bufferten med heltalsfaktor, centrerad.
  const scale = Math.max(1, Math.floor(Math.min(screen.width / VIEW_W, screen.height / VIEW_H)));
  const w = VIEW_W * scale;
  const h = VIEW_H * scale;
  sctx.fillStyle = '#1b1a17';
  sctx.fillRect(0, 0, screen.width, screen.height);
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(buffer, Math.floor((screen.width - w) / 2), Math.floor((screen.height - h) / 2), w, h);
}

// Bara i dev-läge (npm run dev): gör det lätt att testa från webbläsarens konsol.
if (import.meta.env.DEV) window.__game = game;

window.addEventListener('resize', resize);
resize();
startLoop(update, render);
