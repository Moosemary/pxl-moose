// Älgens fysik: tyngdkraft, gå, hoppa och kollision mot mark och stenar.
import { TILE } from './levelParser.js';
import { drawMoose } from './mooseSprite.js';

// Alla värden är i pixlar och sekunder.
const GRAVITY = 1100;
const FALL_GRAVITY_EXTRA = 1.0; // fallet kan göras snabbare än stigandet
const SHORT_HOP_GRAVITY = 2.4; // släpper man hoppknappen tidigt blir hoppet lägre
const JUMP_SPEED = 365;
const MAX_FALL = 480;
const MAX_RUN = 105;
const ACCEL = 650;
const FRICTION = 800;
const AIR_CONTROL = 0.75;
const COYOTE_TICKS = 6; // man kan hoppa en kort stund efter att ha lämnat en kant
const BUFFER_TICKS = 6; // ett hopp strax före landning räknas ändå

export class Player {
  constructor(level) {
    this.w = 24;
    this.h = 22;
    this.level = level;
    this.respawn();
  }

  respawn() {
    const { start } = this.level;
    this.x = start.col * TILE + (TILE - this.w) / 2;
    this.y = (start.row + 1) * TILE - this.h;
    this.vx = 0;
    this.vy = 0;
    this.dir = 1;
    this.onGround = false;
    this.phase = 0;
    this.coyote = 0;
    this.buffer = 0;
    this.prevJump = false;
  }

  update(dt, input) {
    // --- Vågrät rörelse ---
    const dirInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const control = this.onGround ? 1 : AIR_CONTROL;
    if (dirInput !== 0) {
      this.dir = dirInput;
      this.vx += dirInput * ACCEL * control * dt;
      this.vx = Math.max(-MAX_RUN, Math.min(MAX_RUN, this.vx));
    } else {
      const slow = FRICTION * control * dt;
      if (Math.abs(this.vx) <= slow) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * slow;
    }

    // --- Hopp (med "coyote time" och hoppbuffert) ---
    const jumpPressed = input.jump && !this.prevJump;
    this.prevJump = input.jump;
    if (jumpPressed) this.buffer = BUFFER_TICKS;
    else if (this.buffer > 0) this.buffer--;
    if (this.onGround) this.coyote = COYOTE_TICKS;
    else if (this.coyote > 0) this.coyote--;

    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = -JUMP_SPEED;
      this.buffer = 0;
      this.coyote = 0;
      this.onGround = false;
    }

    // --- Tyngdkraft ---
    let g = GRAVITY;
    if (this.vy < 0 && !input.jump) g *= SHORT_HOP_GRAVITY;
    else if (this.vy > 0) g *= FALL_GRAVITY_EXTRA;
    this.vy = Math.min(this.vy + g * dt, MAX_FALL);

    // --- Flytta och kolla kollision, en axel i taget ---
    this.moveX(this.vx * dt);
    this.moveY(this.vy * dt);

    // Gå-animation
    if (this.onGround) this.phase += Math.abs(this.vx) * dt * 0.1;
  }

  moveX(dx) {
    this.x += dx;
    const top = Math.floor(this.y / TILE);
    const bottom = Math.floor((this.y + this.h - 0.001) / TILE);
    if (dx > 0) {
      const col = Math.floor((this.x + this.w - 0.001) / TILE);
      for (let row = top; row <= bottom; row++) {
        if (this.level.isSolid(col, row)) {
          this.x = col * TILE - this.w;
          this.vx = 0;
          break;
        }
      }
    } else if (dx < 0) {
      const col = Math.floor(this.x / TILE);
      for (let row = top; row <= bottom; row++) {
        if (this.level.isSolid(col, row)) {
          this.x = (col + 1) * TILE;
          this.vx = 0;
          break;
        }
      }
    }
  }

  moveY(dy) {
    this.y += dy;
    this.onGround = false;
    const left = Math.floor(this.x / TILE);
    const right = Math.floor((this.x + this.w - 0.001) / TILE);
    if (dy > 0) {
      const row = Math.floor((this.y + this.h - 0.001) / TILE);
      for (let col = left; col <= right; col++) {
        if (this.level.isSolid(col, row)) {
          this.y = row * TILE - this.h;
          this.vy = 0;
          this.onGround = true;
          break;
        }
      }
    } else if (dy < 0) {
      const row = Math.floor(this.y / TILE);
      for (let col = left; col <= right; col++) {
        if (this.level.isSolid(col, row)) {
          this.y = (row + 1) * TILE;
          this.vy = 0;
          break;
        }
      }
    }
  }

  // Nedanför banan = ramlat i ett hål.
  get fellOut() {
    return this.y > this.level.height * TILE + 48;
  }

  draw(ctx, camX) {
    drawMoose(
      ctx,
      this.x + this.w / 2 - camX,
      this.y + this.h,
      this.dir,
      this.phase,
      this.onGround,
      this.vy,
    );
  }
}
