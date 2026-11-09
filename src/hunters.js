// Jägare i jakttorn. De står stilla, siktar när älgen kommer inom synhåll och skjuter.
// Tornet är bara kuliss: älgen kan gå under det och det går inte att hoppa på jägaren.
import { TILE } from './levelParser.js';
import { lineOfSight } from './physics.js';

const TOWER_H = 34; // tornets höjd i pixlar
const AIM_TICKS = 45; // så länge jägaren siktar innan han skjuter (man hinner reagera)
const COOLDOWN_TICKS = 110; // paus efter ett skott
const BULLET_SPEED = 170; // pixlar per sekund
const BULLET_LIFE = 150; // ticks

export class Hunter {
  constructor(col, row) {
    this.col = col;
    this.cx = col * TILE + TILE / 2; // tornets mitt
    this.groundY = (row + 1) * TILE;
    this.topY = this.groundY - TOWER_H; // plattformens överkant
    this.reset();
  }

  reset() {
    this.state = 'idle'; // 'idle' | 'aim' | 'cooldown'
    this.timer = 0;
    this.dir = -1; // blickriktning
    this.angle = Math.PI; // gevärets riktning
    this.flash = 0;
  }

  get muzzle() {
    return {
      x: this.cx + Math.cos(this.angle) * 11,
      y: this.topY - 9 + Math.sin(this.angle) * 11,
    };
  }

  /** Ser jägaren älgen? Kräver att älgen är nära nog och att inget skymmer. */
  canSee(player, level) {
    const tx = player.x + player.w / 2;
    const ty = player.y + player.h / 2;
    const sx = this.cx;
    const sy = this.topY - 9;
    const sight = level.sightAt(Math.floor(tx / TILE));
    if (Math.hypot(tx - sx, ty - sy) > sight) return false;
    return lineOfSight(level, sx, sy, tx, ty);
  }

  update(player, level, bullets) {
    if (this.flash > 0) this.flash--;
    const tx = player.x + player.w / 2;
    const ty = player.y + player.h / 2;

    if (this.state === 'cooldown') {
      if (--this.timer <= 0) this.state = 'idle';
      return;
    }

    const sees = this.canSee(player, level);
    if (this.state === 'idle') {
      if (sees) {
        this.state = 'aim';
        this.timer = AIM_TICKS;
      }
      return;
    }

    // state === 'aim'
    if (!sees) {
      this.state = 'idle';
      return;
    }
    this.dir = tx < this.cx ? -1 : 1;
    this.angle = Math.atan2(ty - (this.topY - 9), tx - this.cx);
    if (--this.timer <= 0) {
      const m = this.muzzle;
      bullets.push({
        x: m.x,
        y: m.y,
        vx: Math.cos(this.angle) * BULLET_SPEED,
        vy: Math.sin(this.angle) * BULLET_SPEED,
        life: BULLET_LIFE,
      });
      this.flash = 5;
      this.state = 'cooldown';
      this.timer = COOLDOWN_TICKS;
    }
  }

  draw(ctx, camX, ticks) {
    const x = Math.round(this.cx - camX);
    const top = Math.round(this.topY);
    const ground = Math.round(this.groundY);
    const wood = '#6b4a2f';
    const woodDark = '#4a3320';

    // Torn: fyra stolpar med kryss, plattform, räcke
    ctx.fillStyle = woodDark;
    ctx.fillRect(x - 10, top, 2, ground - top);
    ctx.fillRect(x + 8, top, 2, ground - top);
    ctx.fillStyle = wood;
    for (let i = 0; i < 2; i++) {
      const y0 = top + 4 + i * 14;
      for (let k = 0; k < 14; k++) {
        const px = x - 8 + Math.round((k / 14) * 16);
        const py = y0 + (i % 2 === 0 ? k : 13 - k);
        ctx.fillRect(px, py, 1, 1);
      }
    }
    ctx.fillStyle = wood;
    ctx.fillRect(x - 12, top - 2, 24, 3); // golv
    ctx.fillStyle = woodDark;
    ctx.fillRect(x - 12, top + 1, 24, 1);
    ctx.fillStyle = wood;
    ctx.fillRect(x - 12, top - 8, 2, 6); // räcke
    ctx.fillRect(x + 10, top - 8, 2, 6);
    ctx.fillRect(x - 12, top - 8, 24, 1);

    // Jägaren: orange keps/väst, grön jacka
    const hx = x;
    const hy = top - 2; // fötterna
    ctx.fillStyle = '#4a5a32';
    ctx.fillRect(hx - 3, hy - 9, 6, 9); // kropp
    ctx.fillStyle = '#e07a1f';
    ctx.fillRect(hx - 3, hy - 8, 6, 3); // varselväst
    ctx.fillStyle = '#e0b890';
    ctx.fillRect(hx - 2, hy - 13, 4, 4); // ansikte
    ctx.fillStyle = '#e07a1f';
    ctx.fillRect(hx - 3, hy - 15, 6, 3); // keps
    ctx.fillRect(hx + this.dir * 2 - (this.dir < 0 ? 1 : 0), hy - 13, 3, 1); // skärm
    ctx.fillStyle = '#14100c';
    ctx.fillRect(hx + this.dir, hy - 11, 1, 1); // öga

    // Gevär (pekar mot älgen när han siktar)
    const aiming = this.state === 'aim';
    const ang = aiming || this.state === 'cooldown' ? this.angle : this.dir < 0 ? Math.PI * 0.8 : Math.PI * 0.2;
    ctx.save();
    ctx.translate(hx, hy - 7);
    ctx.rotate(ang);
    ctx.fillStyle = '#2b1a10';
    ctx.fillRect(0, -1, 13, 2);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(0, -1, 4, 2);
    ctx.restore();

    // Varning: utropstecken medan han siktar, och siktlinje den sista stunden
    if (aiming) {
      if (Math.floor(ticks / 4) % 2 === 0) {
        ctx.fillStyle = '#e0c050';
        ctx.fillRect(hx - 1, top - 26, 2, 5);
        ctx.fillRect(hx - 1, top - 19, 2, 2);
      }
      if (this.timer < 20 && Math.floor(ticks / 2) % 2 === 0) {
        const m = this.muzzle;
        ctx.fillStyle = '#c0452b';
        for (let d = 0; d < 60; d += 4) {
          ctx.fillRect(Math.round(m.x + Math.cos(this.angle) * d - camX), Math.round(m.y + Math.sin(this.angle) * d), 1, 1);
        }
      }
    }
    if (this.flash > 0) {
      const m = this.muzzle;
      ctx.fillStyle = '#fff4c0';
      ctx.fillRect(Math.round(m.x - camX) - 2, Math.round(m.y) - 2, 5, 5);
    }
  }
}

/** Flyttar skotten. Returnerar nya listan och anropar onHit vid träff på älgen. */
export function updateBullets(bullets, dt, level, player, onHit) {
  const alive = [];
  for (const b of bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life--;
    if (b.life <= 0 || level.isSolid(Math.floor(b.x / TILE), Math.floor(b.y / TILE))) continue;
    const hit = b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h;
    if (hit && player.invuln === 0) {
      onHit(b);
      continue;
    }
    alive.push(b);
  }
  return alive;
}

export function drawBullets(ctx, bullets, camX) {
  for (const b of bullets) {
    const x = Math.round(b.x - camX);
    const y = Math.round(b.y);
    ctx.fillStyle = '#14100c';
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.fillStyle = '#ffe070';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}
