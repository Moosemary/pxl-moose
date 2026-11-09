// Gemensam kollision mot banans rutor, för älgen och för fienderna.
// En "kropp" är ett objekt med x, y (övre vänstra hörnet), w, h, vx, vy.
import { TILE } from './levelParser.js';

/** Flyttar kroppen i sidled. Returnerar true om den stötte emot något. */
export function moveBodyX(b, level, dx) {
  b.x += dx;
  const top = Math.floor(b.y / TILE);
  const bottom = Math.floor((b.y + b.h - 0.001) / TILE);
  if (dx > 0) {
    const col = Math.floor((b.x + b.w - 0.001) / TILE);
    for (let row = top; row <= bottom; row++) {
      if (level.isSolid(col, row)) {
        b.x = col * TILE - b.w;
        b.vx = 0;
        return true;
      }
    }
  } else if (dx < 0) {
    const col = Math.floor(b.x / TILE);
    for (let row = top; row <= bottom; row++) {
      if (level.isSolid(col, row)) {
        b.x = (col + 1) * TILE;
        b.vx = 0;
        return true;
      }
    }
  }
  return false;
}

/** Flyttar kroppen lodrätt och sätter b.onGround. */
export function moveBodyY(b, level, dy) {
  b.y += dy;
  b.onGround = false;
  const left = Math.floor(b.x / TILE);
  const right = Math.floor((b.x + b.w - 0.001) / TILE);
  if (dy > 0) {
    const row = Math.floor((b.y + b.h - 0.001) / TILE);
    for (let col = left; col <= right; col++) {
      if (level.isSolid(col, row)) {
        b.y = row * TILE - b.h;
        b.vy = 0;
        b.onGround = true;
        return;
      }
    }
  } else if (dy < 0) {
    const row = Math.floor(b.y / TILE);
    for (let col = left; col <= right; col++) {
      if (level.isSolid(col, row)) {
        b.y = (row + 1) * TILE;
        b.vy = 0;
        return;
      }
    }
  }
}

/** Fri sikt mellan två punkter (inga fasta rutor i vägen)? */
export function lineOfSight(level, x0, y0, x1, y1) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.ceil(dist / 3);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (level.isSolid(Math.floor(x / TILE), Math.floor(y / TILE))) return false;
  }
  return true;
}
