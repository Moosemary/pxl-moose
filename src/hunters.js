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

    const hx = x;
    const hy = top - 2; // fötterna
    const aiming = this.state === 'aim';
    const ang = aiming || this.state === 'cooldown' ? this.angle : this.dir < 0 ? Math.PI * 0.8 : Math.PI * 0.2;
    drawHunterFigure(ctx, hx, hy, this.dir, ang, 0);
    drawAimCues(ctx, this, camX, ticks, hx, top - 26);
  }
}

// ---------------------------------------------------------------------
// Gemensamt för jägarna: figuren, siktlinjen och utropstecknet.
// ---------------------------------------------------------------------

/** Ritar jägaren med fötterna vid (hx, hy). legPhase > 0 ger gångben. */
function drawHunterFigure(ctx, hx, hy, dir, ang, legPhase) {
  const swing = legPhase ? Math.round(Math.sin(legPhase) * 2) : 0;
  if (legPhase) {
    ctx.fillStyle = '#3a3f2a';
    ctx.fillRect(hx - 3 + swing, hy - 2, 2, 2);
    ctx.fillRect(hx + 1 - swing, hy - 2, 2, 2);
  }
  ctx.fillStyle = '#4a5a32';
  ctx.fillRect(hx - 3, hy - 9, 6, legPhase ? 7 : 9); // kropp
  ctx.fillStyle = '#e07a1f';
  ctx.fillRect(hx - 3, hy - 8, 6, 3); // varselväst
  ctx.fillStyle = '#e0b890';
  ctx.fillRect(hx - 2, hy - 13, 4, 4); // ansikte
  ctx.fillStyle = '#e07a1f';
  ctx.fillRect(hx - 3, hy - 15, 6, 3); // keps
  ctx.fillRect(hx + dir * 2 - (dir < 0 ? 1 : 0), hy - 13, 3, 1); // skärm
  ctx.fillStyle = '#14100c';
  ctx.fillRect(hx + dir, hy - 11, 1, 1); // öga

  // Gevär
  ctx.save();
  ctx.translate(hx, hy - 7);
  ctx.rotate(ang);
  ctx.fillStyle = '#2b1a10';
  ctx.fillRect(0, -1, 13, 2);
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, -1, 4, 2);
  ctx.restore();
}

/** Utropstecken medan jägaren siktar och en siktlinje den sista stunden. */
function drawAimCues(ctx, h, camX, ticks, hx, markY) {
  if (h.state === 'aim') {
    if (Math.floor(ticks / 4) % 2 === 0) {
      ctx.fillStyle = '#e0c050';
      ctx.fillRect(hx - 1, markY, 2, 5);
      ctx.fillRect(hx - 1, markY + 7, 2, 2);
    }
    if (h.timer < 20 && Math.floor(ticks / 2) % 2 === 0) {
      const m = h.muzzle;
      ctx.fillStyle = '#c0452b';
      for (let d = 0; d < 60; d += 4) {
        ctx.fillRect(Math.round(m.x + Math.cos(h.angle) * d - camX), Math.round(m.y + Math.sin(h.angle) * d), 1, 1);
      }
    }
  }
  if (h.flash > 0) {
    const m = h.muzzle;
    ctx.fillStyle = '#fff4c0';
    ctx.fillRect(Math.round(m.x - camX) - 2, Math.round(m.y) - 2, 5, 5);
  }
}

// ---------------------------------------------------------------------
// Jägare till fots, med hund. Hunden går först och jägaren följer efter.
// Går älgen in i hunden skäller den och älgen blir förlamad – då kan
// jägaren skjuta. Är hunden borta blir jägaren en vanlig skytt med kort räckvidd.
// ---------------------------------------------------------------------

const WALK_SPEED = 46;
const FOLLOW_DIST = 40; // pixlar bakom hunden
const PARA_AIM_TICKS = 40;
const FREE_SIGHT = 120; // räckvidd om hunden är borta
const PARA_SIGHT = 260;

export class PatrolHunter {
  constructor(dog, level) {
    this.dog = dog;
    this.level = level;
    this.spawnX = dog.spawnX + dog.w / 2 + 3 * TILE;
    this.feetY = dog.spawnY + dog.h;
    this.reset();
  }

  reset() {
    this.x = this.spawnX; // mitt på jägaren
    this.dir = -1;
    this.phase = 0;
    this.state = 'idle';
    this.timer = 0;
    this.angle = Math.PI;
    this.flash = 0;
    this.active = false;
  }

  get muzzle() {
    return { x: this.x + Math.cos(this.angle) * 11, y: this.feetY - 7 + Math.sin(this.angle) * 11 };
  }

  groundAhead(x, dir) {
    const col = Math.floor((x + dir * 6) / TILE);
    const rowFoot = Math.floor((this.feetY + 1) / TILE);
    const rowBody = Math.floor((this.feetY - 8) / TILE);
    return this.level.isSolid(col, rowFoot) && !this.level.isSolid(col, rowBody);
  }

  walk(dt, dir, speed) {
    const nx = this.x + dir * speed * dt;
    if (this.groundAhead(nx, dir)) {
      this.x = nx;
      this.phase += speed * dt * 0.12;
      return true;
    }
    return false;
  }

  update(player, level, bullets, cameraX, viewW, dt) {
    if (this.flash > 0) this.flash--;
    if (!this.active) {
      if (this.x < cameraX + viewW + 32) this.active = true;
      else return;
    }
    const dog = this.dog;
    const dogAlive = !dog.dead;
    const busy = this.state !== 'idle';

    // --- Gå ---
    if (!busy && !(dogAlive && dog.bark > 0)) {
      if (dogAlive) {
        const target = dog.x + dog.w / 2 - dog.dir * FOLLOW_DIST;
        const d = target - this.x;
        if (Math.abs(d) > 2) {
          this.dir = Math.sign(d);
          this.walk(dt, this.dir, WALK_SPEED);
        } else {
          this.dir = dog.dir;
        }
      } else if (!this.walk(dt, this.dir, 36)) {
        this.dir = -this.dir;
      }
    }

    // --- Sikta och skjuta ---
    const para = player.paralyzed > 0;
    const armed = para || !dogAlive;
    const tx = player.x + player.w / 2;
    const ty = player.y + player.h / 2;
    const sx = this.x;
    const sy = this.feetY - 7;
    const range = para ? PARA_SIGHT : FREE_SIGHT;
    const sees = armed && Math.hypot(tx - sx, ty - sy) <= range && lineOfSight(level, sx, sy, tx, ty);

    if (this.state === 'cooldown') {
      if (--this.timer <= 0) this.state = 'idle';
      return;
    }
    if (this.state === 'idle') {
      if (sees) {
        this.state = 'aim';
        this.timer = para ? PARA_AIM_TICKS : AIM_TICKS;
      }
      return;
    }
    if (!sees) {
      this.state = 'idle';
      return;
    }
    this.dir = tx < this.x ? -1 : 1;
    this.angle = Math.atan2(ty - sy, tx - sx);
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
    const hx = Math.round(this.x - camX);
    const hy = Math.round(this.feetY);
    const aiming = this.state === 'aim' || this.state === 'cooldown';
    const ang = aiming ? this.angle : this.dir < 0 ? Math.PI * 0.8 : Math.PI * 0.2;
    const walking = this.state === 'idle';
    drawHunterFigure(ctx, hx, hy, this.dir, ang, walking ? this.phase + 0.001 : 0);
    drawAimCues(ctx, this, camX, ticks, hx, hy - 30);
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
