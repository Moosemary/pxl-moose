// Fiender som går fram och tillbaka: björn och varg. Allt ritas med kod.
import { TILE } from './levelParser.js';
import { moveBodyX, moveBodyY } from './physics.js';

const GRAVITY = 900;
const MAX_FALL = 400;
const SQUISH_TICKS = 24;

// w/h = träffyta, speed = pixlar per sekund, points = poäng när man hoppar på den
export const ENEMY_TYPES = {
  B: { name: 'björn', w: 24, h: 20, speed: 22, points: 150 },
  W: { name: 'varg', w: 20, h: 14, speed: 48, points: 100 },
  H: { name: 'jakthund', w: 18, h: 12, speed: 42, points: 100 }, // förlamar älgen, dödar inte
};

export class Enemy {
  constructor(ch, col, row) {
    this.ch = ch;
    this.type = ENEMY_TYPES[ch];
    this.w = this.type.w;
    this.h = this.type.h;
    this.spawnX = col * TILE + (TILE - this.w) / 2;
    this.spawnY = (row + 1) * TILE - this.h;
    this.dead = false; // nedhoppad – syns som platt en kort stund
    this.squish = 0;
    this.reset();
  }

  /** Tillbaka till startplatsen (när älgen börjar om). */
  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.dir = -1;
    this.onGround = false;
    this.active = false; // vaknar när kameran närmar sig
    this.phase = 0;
    this.bark = 0; // ticks kvar som hunden skäller (står stilla)
  }

  get alive() {
    return !this.dead;
  }

  get removed() {
    return this.dead && this.squish <= 0;
  }

  kill() {
    this.dead = true;
    this.squish = SQUISH_TICKS;
  }

  update(dt, level, cameraX, viewW) {
    if (this.dead) {
      if (this.squish > 0) this.squish--;
      return;
    }
    if (!this.active) {
      if (this.x < cameraX + viewW + 32) this.active = true;
      else return;
    }

    if (this.bark > 0) {
      this.bark--; // hunden skäller och står stilla
      return;
    }

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
    this.vx = this.dir * this.type.speed;
    const blocked = moveBodyX(this, level, this.vx * dt);
    moveBodyY(this, level, this.vy * dt);

    if (this.onGround) {
      this.phase += this.type.speed * dt * 0.12;
      // Vänd vid vägg eller om marken tar slut framför
      const frontX = this.dir > 0 ? this.x + this.w + 1 : this.x - 1;
      const col = Math.floor(frontX / TILE);
      const row = Math.floor((this.y + this.h + 1) / TILE);
      if (blocked || !level.isSolid(col, row)) this.dir = -this.dir;
    } else if (blocked) {
      this.dir = -this.dir;
    }
  }

  draw(ctx, camX) {
    const cx = Math.round(this.x + this.w / 2 - camX);
    const by = Math.round(this.y + this.h);
    ctx.save();
    ctx.translate(cx, by);
    if (this.dead) {
      const t = this.squish / SQUISH_TICKS;
      ctx.scale(this.dir, 0.3);
      ctx.globalAlpha = Math.max(0.2, t);
    } else {
      ctx.scale(this.dir, 1);
    }
    if (this.ch === 'B') drawBear(ctx, this.phase);
    else if (this.ch === 'H') drawDog(ctx, this.phase, this.bark > 0);
    else drawWolf(ctx, this.phase);
    ctx.restore();
  }
}

function r(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Ritas vända åt höger, med fötterna vid (0, 0).
function drawBear(ctx, phase) {
  const C = { body: '#4f3426', light: '#664432', dark: '#33221a', snout: '#8a6a4a', nose: '#14100c', eye: '#e8d8a8' };
  const legX = [-10, -5, 2, 7];
  legX.forEach((x, i) => {
    const s = Math.round(Math.sin(phase + (i % 2 ? Math.PI : 0)) * 2);
    r(ctx, C.dark, x + s, -7, 5, 7);
    r(ctx, '#d8d0b8', x + s + (x > 0 ? 3 : 0), -1, 2, 1); // klor
  });
  r(ctx, C.body, -11, -16, 19, 10); // kropp
  r(ctx, C.light, -9, -16, 13, 2);
  r(ctx, C.body, -4, -19, 10, 4); // puckel över bogen
  r(ctx, C.body, 6, -17, 8, 9); // huvud
  r(ctx, C.snout, 12, -13, 4, 5);
  r(ctx, C.nose, 15, -13, 2, 2);
  r(ctx, C.body, 7, -20, 3, 3); // öra
  r(ctx, C.eye, 11, -15, 2, 1);
  r(ctx, C.dark, -13, -13, 2, 3); // svans
}

function drawWolf(ctx, phase) {
  const C = { body: '#7d8083', light: '#a9abab', dark: '#55575a', nose: '#14100c', eye: '#e0c050' };
  const legX = [-8, -4, 2, 6];
  legX.forEach((x, i) => {
    const s = Math.round(Math.sin(phase + (i % 2 ? Math.PI : 0)) * 2);
    r(ctx, C.dark, x + s, -5, 2, 5);
  });
  r(ctx, C.body, -9, -10, 15, 6); // kropp
  r(ctx, C.light, -7, -10, 10, 1);
  r(ctx, C.body, 5, -13, 7, 6); // huvud
  r(ctx, C.light, 11, -10, 4, 3); // nos
  r(ctx, C.nose, 14, -10, 2, 1);
  r(ctx, C.dark, 6, -16, 2, 3); // öron
  r(ctx, C.dark, 9, -16, 2, 3);
  r(ctx, C.eye, 9, -12, 1, 1);
  r(ctx, C.body, -13, -13, 4, 3); // svans upp
  r(ctx, C.dark, -14, -15, 2, 3);
}

function drawDog(ctx, phase, barking) {
  const C = { body: '#b07a45', dark: '#3a2a20', light: '#e8dcc0', leg: '#8a5e34', nose: '#14100c' };
  [-7, -4, 3, 6].forEach((x, i) => {
    const s = barking ? 0 : Math.round(Math.sin(phase + (i % 2 ? Math.PI : 0)) * 2);
    r(ctx, C.leg, x + s, -4, 2, 4);
  });
  r(ctx, C.body, -8, -9, 14, 5); // kropp
  r(ctx, C.dark, -5, -9, 9, 2); // sadel
  r(ctx, C.light, 3, -5, 3, 1); // vitt bröst
  const up = barking ? 3 : 0; // huvudet höjs när hunden skäller
  r(ctx, C.body, 5, -11 - up, 6, 5);
  r(ctx, C.light, 10, -9 - up, 3, 3);
  r(ctx, C.nose, 12, -9 - up, 1, 1);
  r(ctx, C.dark, 5, -11 - up, 2, 4); // hängande öra
  r(ctx, '#14100c', 9, -10 - up, 1, 1); // öga
  if (barking) {
    r(ctx, '#c0452b', 11, -7 - up, 2, 1); // öppen mun
    r(ctx, C.body, -10, -12 + (Math.floor(phase * 4 + Date.now() / 60) % 2), 2, 4);
  } else {
    r(ctx, C.body, -10, -11, 2, 4); // svans
  }
}
