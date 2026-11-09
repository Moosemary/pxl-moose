// Spelets tillstånd: startskärm → spel → (förlorat liv) → Moose over eller vinst.
import { TILE } from './levelParser.js';
import { Player } from './player.js';
import { VIEW_W, START_LIVES } from './config.js';

const DEATH_PAUSE = 60; // ticks (1 s) efter att ett liv gått förlorat
const END_LOCKOUT = 45; // så att man inte råkar hoppa förbi slutskärmen

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
    this.snapCamera();
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
    this.spawn(input);
    this.state = 'playing';
  }

  spawn(input) {
    this.player.respawn();
    this.player.prevJump = input.jump; // en hållen hoppknapp ska inte hoppa direkt
    this.snapCamera();
  }

  update(dt, input) {
    this.ticks++;
    const start = input.consumeStart();
    if (this.timer > 0) this.timer--;

    switch (this.state) {
      case 'title':
        if (start) this.startRun(input);
        break;

      case 'playing': {
        const p = this.player;
        p.update(dt, input);
        this.camera.x += (this.cameraTarget() - this.camera.x) * 0.15;

        const goal = this.level.goal;
        if (p.fellOut) {
          this.lives--;
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
