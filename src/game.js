// Spelets tillstånd: startskärm → spel → (förlorat liv) → Moose over eller vinst.
import { TILE } from './levelParser.js';
import { Player } from './player.js';
import { VIEW_W, START_LIVES } from './config.js';
import { FOOD } from './foodSprites.js';
import { Enemy, ENEMY_TYPES } from './enemies.js';

const DEATH_PAUSE = 60; // ticks (1 s) efter att ett liv gått förlorat
const END_LOCKOUT = 45; // så att man inte råkar hoppa förbi slutskärmen
const INVULN_TICKS = 100; // oskadlig en stund efter en träff
const STOMP_BOUNCE = 230; // studs när man hoppar på en fiende
const STOMP_BOUNCE_HELD = 330; // högre studs om man håller hoppknappen

export class Game {
  constructor(level) {
    this.level = level;
    this.player = new Player(level);
    this.levelPxW = level.width * TILE;
    this.state = 'title'; // 'title' | 'playing' | 'dying' | 'gameover' | 'won'
    this.lives = START_LIVES;
    this.score = 0;
    this.timer = 0;
    this.ticks = 0;
    this.camera = { x: 0 };
    this.items = [];
    this.enemies = [];
    this.deathText = '';
    this.popups = []; // flytande "+10" när man tar mat
    this.resetItems();
    this.snapCamera();
  }

  // Alla matföremål i banan (tecken k, g, b) görs till föremål som kan plockas.
  resetItems() {
    this.items = this.level.entities
      .filter((e) => FOOD[e.ch])
      .map((e) => ({ ch: e.ch, col: e.col, row: e.row, taken: false }));
    this.enemies = this.level.entities
      .filter((e) => ENEMY_TYPES[e.ch])
      .map((e) => new Enemy(e.ch, e.col, e.row));
    this.popups = [];
  }

  // Möter älgen en fiende: hoppa på den (uppifrån) eller bli skadad.
  handleEnemies(dt, input) {
    const p = this.player;
    if (p.invuln > 0) p.invuln--;

    for (const e of this.enemies) {
      e.update(dt, this.level, this.camera.x, VIEW_W);
      if (e.dead || !e.active) continue;

      // Lite mindre träffyta än bilden, så att det känns rättvist.
      const overlap =
        p.x + 3 < e.x + e.w - 2 && p.x + p.w - 3 > e.x + 2 && p.y < e.y + e.h && p.y + p.h > e.y + 2;
      if (!overlap) continue;

      const stomp = p.vy > 0 && p.y + p.h - e.y < e.h * 0.6 + 4;
      if (stomp) {
        e.kill();
        p.vy = -(input.jump ? STOMP_BOUNCE_HELD : STOMP_BOUNCE);
        p.onGround = false;
        const pts = e.type.points;
        this.score += pts;
        this.popups.push({ x: e.x + e.w / 2, y: e.y - 6, text: '+' + pts, life: 40 });
      } else if (p.invuln === 0) {
        this.hurtPlayer(e);
      }
    }
  }

  hurtPlayer(e) {
    const p = this.player;
    this.lives--;
    this.deathText = e.ch === 'B' ? 'Björnen tog dig!' : 'Vargen tog dig!';
    if (this.lives <= 0) {
      this.state = 'dying';
      this.timer = DEATH_PAUSE;
      return;
    }
    p.invuln = INVULN_TICKS;
    p.vy = -200;
    p.vx = Math.sign(p.x + p.w / 2 - (e.x + e.w / 2) || 1) * 120;
    p.onGround = false;
  }

  collectFood() {
    const p = this.player;
    for (const it of this.items) {
      if (it.taken) continue;
      const ix = it.col * TILE + 2;
      const iy = it.row * TILE + 2;
      const hit = p.x < ix + 12 && p.x + p.w > ix && p.y < iy + 12 && p.y + p.h > iy;
      if (hit) {
        it.taken = true;
        const pts = FOOD[it.ch].points;
        this.score += pts;
        this.popups.push({ x: it.col * TILE + TILE / 2, y: it.row * TILE, text: '+' + pts, life: 40 });
      }
    }
  }

  cameraTarget() {
    const p = this.player;
    const t = p.x + p.w / 2 - VIEW_W * 0.4;
    return Math.max(0, Math.min(t, this.levelPxW - VIEW_W));
  }

  snapCamera() {
    this.camera.x = this.cameraTarget();
  }

  startRun(input) {
    this.lives = START_LIVES;
    this.score = 0;
    this.resetItems();
    this.spawn(input);
    this.state = 'playing';
  }

  spawn(input) {
    this.player.respawn();
    for (const e of this.enemies) if (!e.dead) e.reset(); // levande fiender tillbaka till sina platser
    this.player.prevJump = input.jump; // en hållen hoppknapp ska inte hoppa direkt
    this.snapCamera();
  }

  update(dt, input) {
    this.ticks++;
    const start = input.consumeStart();
    if (this.timer > 0) this.timer--;
    for (const pop of this.popups) {
      pop.y -= 0.5;
      pop.life--;
    }
    this.popups = this.popups.filter((pop) => pop.life > 0);

    switch (this.state) {
      case 'title':
        if (start) this.startRun(input);
        break;

      case 'playing': {
        const p = this.player;
        p.update(dt, input);
        this.camera.x += (this.cameraTarget() - this.camera.x) * 0.15;
        this.collectFood();
        this.handleEnemies(dt, input);

        const goal = this.level.goal;
        if (this.state !== 'playing') break; // en fiende tog sista livet
        if (p.fellOut) {
          this.lives--;
          this.deathText = 'Du ramlade!';
          this.state = 'dying';
          this.timer = DEATH_PAUSE;
        } else if (goal && p.x + p.w > goal.col * TILE + 6) {
          this.state = 'won';
          this.timer = END_LOCKOUT;
        }
        break;
      }

      case 'dying':
        if (this.timer === 0) {
          if (this.lives > 0) {
            this.spawn(input);
            this.state = 'playing';
          } else {
            this.state = 'gameover';
            this.timer = END_LOCKOUT;
          }
        }
        break;

      case 'gameover':
      case 'won':
        if (start && this.timer === 0) this.startRun(input);
        break;
    }
  }
}
