import { LEVEL_ROWS, BIOMES } from './level.js';
import { parseLevel, TILE } from './levelParser.js';
import { input } from './input.js';
import { startLoop, STEP } from './loop.js';
import { COLORS, drawGround, drawStone, drawGoal, drawStartMarker } from './tiles.js';

// Spelets egen låga upplösning – skalas upp i heltal så pixlarna blir tydliga.
const VIEW_W = 320;
const VIEW_H = 208; // 13 rutor höga

const screen = document.getElementById('game');
const sctx = screen.getContext('2d');

const buffer = document.createElement('canvas');
buffer.width = VIEW_W;
buffer.height = VIEW_H;
const ctx = buffer.getContext('2d');

const level = parseLevel(LEVEL_ROWS, BIOMES);
const levelPxW = level.width * TILE;

// Kameran (i steg 4 följer den älgen i stället).
const camera = { x: 0 };
const CAMERA_SPEED = 180; // pixlar per sekund

// Mätare för att kunna kontrollera att takten är lika på alla skärmar.
let ticks = 0;
let tickRate = 0;
let rateTicks = 0;
let rateStart = performance.now();

function update(dt) {
  ticks++;
  rateTicks++;
  if (input.left) camera.x -= CAMERA_SPEED * dt;
  if (input.right) camera.x += CAMERA_SPEED * dt;
  camera.x = Math.max(0, Math.min(camera.x, levelPxW - VIEW_W));
}

function resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
}

function drawBackground() {
  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.skyFar;
  ctx.fillRect(0, VIEW_H * 0.55, VIEW_W, VIEW_H);
}

function drawLevel() {
  const camX = Math.round(camera.x);
  const firstCol = Math.floor(camX / TILE);
  const lastCol = Math.min(level.width - 1, Math.floor((camX + VIEW_W) / TILE));

  for (let row = 0; row < level.height; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const ch = level.tileAt(col, row);
      const x = col * TILE - camX;
      const y = row * TILE;
      if (ch === '#') drawGround(ctx, x, y, col, row, level.tileAt(col, row - 1) !== '#');
      else if (ch === 'S') drawStone(ctx, x, y, col, row);
    }
  }

  if (level.goal) drawGoal(ctx, level.goal.col * TILE - camX, level.goal.row * TILE);
  drawStartMarker(ctx, level.start.col * TILE - camX, level.start.row * TILE);
}

function drawDebug() {
  const now = performance.now();
  if (now - rateStart >= 1000) {
    tickRate = Math.round((rateTicks * 1000) / (now - rateStart));
    rateTicks = 0;
    rateStart = now;
  }
  const col = Math.floor((camera.x + VIEW_W / 2) / TILE);
  ctx.font = '8px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00000088';
  ctx.fillRect(2, 2, 150, 34);
  ctx.fillStyle = COLORS.text;
  ctx.fillText('pxl moose – steg 3 (test)', 5, 5);
  ctx.fillText(`kamera ${Math.round(camera.x)}px  miljö: ${level.biomeAt(col)}`, 5, 15);
  ctx.fillText(`uppdateringar/s: ${tickRate} (ska vara ${Math.round(1 / STEP)})`, 5, 25);
  ctx.textAlign = 'center';
  ctx.fillText('← → eller A D scrollar kameran', VIEW_W / 2, VIEW_H - 12);
}

function render() {
  drawBackground();
  drawLevel();
  drawDebug();

  // Skala upp bufferten med heltalsfaktor, centrerad.
  const scale = Math.max(1, Math.floor(Math.min(screen.width / VIEW_W, screen.height / VIEW_H)));
  const w = VIEW_W * scale;
  const h = VIEW_H * scale;
  sctx.fillStyle = '#1b1a17';
  sctx.fillRect(0, 0, screen.width, screen.height);
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(buffer, Math.floor((screen.width - w) / 2), Math.floor((screen.height - h) / 2), w, h);
}

window.addEventListener('resize', resize);
resize();
startLoop(update, render);
