// Älgens fysik: tyngdkraft, gå, hoppa och kollision mot mark och stenar.
import { TILE } from './levelParser.js';
import { drawMoose } from './mooseSprite.js';
import { moveBodyX, moveBodyY } from './physics.js';

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
const PARA_IMMUNE_TICKS = 90; // 1,5 s utan ny förlamning efter att man blivit fri
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
    this.invuln = 0; // ticks kvar av oskadlighet efter en träff
    this.paralyzed = 0; // ticks kvar som älgen är förlamad (hundens skall)
    this.paraImmune = 0; // kort skydd mot ny förlamning så att man hinner fly
  }

  update(dt, realInput) {
    // Förlamad: älgen kan inte röra sig eller hoppa, men tyngdkraften verkar.
    let input = realInput;
    if (this.paralyzed > 0) {
      input = { left: false, right: false, jump: false };
      this.vx = 0;
      if (--this.paralyzed === 0) this.paraImmune = PARA_IMMUNE_TICKS;
    } else if (this.paraImmune > 0) {
      this.paraImmune--;
    }
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
    moveBodyX(this, this.level, dx);
  }

  moveY(dy) {
    moveBodyY(this, this.level, dy);
  }

  // Nedanför banan = ramlat i ett hål.
  get fellOut() {
    return this.y > this.level.height * TILE + 48;
  }

  draw(ctx, camX) {
    if (this.invuln > 0 && Math.floor(this.invuln / 4) % 2 === 0) return; // blinkar
    if (this.paralyzed > 0) {
      // Kryssande stjärnor ovanför huvudet
      const cx = this.x + this.w / 2 - camX;
      for (let i = 0; i < 3; i++) {
        const a = this.paralyzed * 0.25 + i * 2.1;
        ctx.fillStyle = '#ffe070';
        ctx.fillRect(Math.round(cx + Math.cos(a) * 9), Math.round(this.y - 12 + Math.sin(a) * 3), 2, 2);
      }
    }
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
