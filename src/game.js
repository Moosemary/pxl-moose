// Spelets tillstånd: startskärm → spel → (förlorat liv) → Moose over eller vinst.
import { TILE } from './levelParser.js';
import { Player } from './player.js';
import { VIEW_W, START_LIVES, EXTRA_LIFE_EVERY, MAX_LIVES } from './config.js';
import { FOOD } from './foodSprites.js';
import { Enemy, ENEMY_TYPES } from './enemies.js';
import { Hunter, PatrolHunter, updateBullets } from './hunters.js';
import { Road, Train, VEHICLE_TYPES, findLane } from './traffic.js';

const DEATH_PAUSE = 60; // ticks (1 s) efter att ett liv gått förlorat
const END_LOCKOUT = 45; // så att man inte råkar hoppa förbi slutskärmen
const SPAWN_INVULN = 60; // kort skydd när man börjar om, så att man hinner se sig omkring
const INVULN_TICKS = 100; // oskadlig en stund efter en träff
const PARALYZE_TICKS = 130; // så länge älgen är förlamad av hundens skall
const STOMP_BOUNCE = 230; // studs när man hoppar på en fiende
const STOMP_BOUNCE_HELD = 330; // högre studs om man håller hoppknappen

export class Game {
  constructor(level) {
    this.level = level;
    this.player = new Player(level);
    this.sfx = () => {}; // main.js kopplar in riktiga ljud
    this.player.sfx = (name) => this.sfx(name);
    this.levelPxW = level.width * TILE;
    this.state = 'title'; // 'title' | 'playing' | 'dying' | 'gameover' | 'won'
    this.paused = false;
    this.lives = START_LIVES;
    this.score = 0;
    this.nextLifeAt = EXTRA_LIFE_EVERY;
    this.timer = 0;
    this.ticks = 0;
    this.camera = { x: 0 };
    this.items = [];
    this.enemies = [];
    this.hunters = [];
    this.footHunters = []; // jägare till fots (följer sin hund)
    this.roads = [];
    this.trains = [];
    this.bullets = [];
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
    this.hunters = this.level.entities.filter((e) => e.ch === 'J').map((e) => new Hunter(e.col, e.row));
    this.footHunters = this.enemies.filter((e) => e.ch === 'H').map((dog) => new PatrolHunter(dog, this.level));
    this.bullets = [];
    this.buildTraffic();
    this.checkpoints = this.level.entities
      .filter((e) => e.ch === 'F')
      .map((e) => ({ col: e.col, row: e.row, active: false }));
    this.checkpoint = null;
    this.popups = [];
  }

  // Bilar/bussar (C, U) grupperas per väg; tåg (R) får sin räls.
  buildTraffic() {
    const lvl = this.level;
    const byLane = new Map();
    for (const e of lvl.entities.filter((e) => VEHICLE_TYPES[e.ch])) {
      const lane = findLane(lvl, e.col, e.row, '=');
      const key = lane.left + ':' + lane.right;
      if (!byLane.has(key)) byLane.set(key, { lane, defs: [] });
      byLane.get(key).defs.push(e);
    }
    this.roads = [...byLane.values()].map(({ lane, defs }) => new Road(lane, defs));
    this.trains = lvl.entities
      .filter((e) => e.ch === 'R')
      .map((e) => new Train(findLane(lvl, e.col, e.row, '-'), e.col));
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
        this.sfx('stomp');
        p.vy = -(input.jump ? STOMP_BOUNCE_HELD : STOMP_BOUNCE);
        p.onGround = false;
        const pts = e.type.points;
        this.addScore(pts);
        this.popups.push({ x: e.x + e.w / 2, y: e.y - 6, text: '+' + pts, life: 40 });
      } else if (e.ch === 'H') {
        // Hunden skadar inte, men skäller och förlamar älgen.
        if (p.paralyzed === 0 && p.paraImmune === 0) this.paralyze(e);
      } else if (p.invuln === 0) {
        this.hurtPlayer(e.x + e.w / 2, e.ch === 'B' ? 'Björnen tog dig!' : 'Vargen tog dig!');
      }
    }
  }

  paralyze(dog) {
    const p = this.player;
    p.paralyzed = PARALYZE_TICKS;
    p.vx = 0;
    this.sfx('bark');
    dog.bark = PARALYZE_TICKS;
    this.popups.push({ x: dog.x + dog.w / 2, y: dog.y - 14, text: 'VOFF!', life: 70, rise: 0.05 });
  }

  // Jägare siktar och skjuter; skotten flyger rakt fram tills de träffar något.
  handleHunters(dt) {
    const before = this.bullets.length;
    for (const h of this.hunters) h.update(this.player, this.level, this.bullets);
    for (const h of this.footHunters) {
      h.update(this.player, this.level, this.bullets, this.camera.x, VIEW_W, dt);
    }
    for (const h of [...this.hunters, ...this.footHunters]) {
      if (h.state === 'aim' && h.prevState !== 'aim') this.sfx('aim');
      h.prevState = h.state;
    }
    if (this.bullets.length > before) this.sfx('shot');
    this.bullets = updateBullets(this.bullets, dt, this.level, this.player, (b) =>
      this.hurtPlayer(b.x - Math.sign(b.vx || 1) * 8, 'Jägaren sköt dig!'),
    );
  }

  // Trafik: bilar, bussar och tåg skadar alltid vid kontakt.
  handleTraffic(dt) {
    const p = this.player;
    for (const road of this.roads) {
      road.update(dt, this.camera.x, VIEW_W);
      const v = road.hit(p);
      if (v && p.invuln === 0) {
        this.hurtPlayer(v.x + v.w / 2, v.ch === 'C' ? 'Du blev påkörd av en bil!' : 'Du blev påkörd av en buss!');
        if (this.state !== 'playing') return;
      }
    }
    for (const train of this.trains) {
      const prev = train.state;
      train.update(dt, this.camera.x, VIEW_W);
      const inView = train.lane.left < this.camera.x + VIEW_W + 80 && train.lane.right > this.camera.x - 80;
      if (inView && train.state === 'warn' && this.ticks % 28 === 0) this.sfx('bell');
      if (inView && prev !== 'run' && train.state === 'run') this.sfx('horn');
      if (train.hit(p) && p.invuln === 0) {
        this.hurtPlayer(train.x + 90, 'Tåget körde på dig!');
        if (this.state !== 'playing') return;
      }
    }
  }

  // sourceX = var skadan kom ifrån (älgen slungas bort därifrån)
  hurtPlayer(sourceX, text) {
    const p = this.player;
    this.lives--;
    this.sfx('hurt');
    this.deathText = text;
    p.paralyzed = 0; // en träff gör slut på förlamningen
    p.paraImmune = 90;
    if (this.lives <= 0) {
      this.state = 'dying';
      this.timer = DEATH_PAUSE;
      return;
    }
    p.invuln = INVULN_TICKS;
    p.vy = -200;
    p.vx = Math.sign(p.x + p.w / 2 - sourceX || 1) * 120;
    p.onGround = false;
  }

  // Rör älgen ett röse blir det nästa startplats efter ett fall.
  touchCheckpoints() {
    const p = this.player;
    for (const c of this.checkpoints) {
      if (c.active) continue;
      const x = c.col * TILE;
      const y = (c.row + 1) * TILE;
      if (p.x < x + 14 && p.x + p.w > x + 2 && p.y < y && p.y + p.h > y - 26) {
        c.active = true;
        this.sfx('checkpoint');
        this.checkpoint = c;
        this.popups.push({ x: x + TILE / 2, y: y - 34, text: 'Kontrollpunkt!', life: 80, rise: 0.15 });
      }
    }
  }

  /** Lägger till poäng och ger ett extraliv för var EXTRA_LIFE_EVERY:e poäng. */
  addScore(pts) {
    this.score += pts;
    if (!EXTRA_LIFE_EVERY) return;
    while (this.score >= this.nextLifeAt) {
      this.nextLifeAt += EXTRA_LIFE_EVERY;
      if (this.lives < MAX_LIVES) {
        this.lives++;
        this.sfx('oneUp');
        const p = this.player;
        this.popups.push({ x: p.x + p.w / 2, y: p.y - 18, text: 'EXTRALIV!', life: 90, rise: 0.2 });
      }
    }
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
        this.addScore(pts);
        this.sfx({ k: 'eatK', g: 'eatG', b: 'eatB' }[it.ch]);
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
    this.nextLifeAt = EXTRA_LIFE_EVERY;
    this.resetItems();
    this.spawn(input);
    this.state = 'playing';
    this.sfx('start');
  }

  spawn(input) {
    this.player.respawn(this.checkpoint);
    for (const e of this.enemies) if (!e.dead) e.reset(); // levande fiender tillbaka till sina platser
    for (const h of this.hunters) h.reset();
    for (const h of this.footHunters) h.reset();
    for (const r of this.roads) r.reset();
    for (const t of this.trains) t.reset();
    this.bullets = [];
    this.player.prevJump = input.jump; // en hållen hoppknapp ska inte hoppa direkt
    this.player.invuln = SPAWN_INVULN;
    this.snapCamera();
  }

  update(dt, input) {
    this.ticks++;
    const start = input.consumeStart();
    const pausePressed = input.consumePause?.() ?? false;
    const blurred = input.consumeBlur?.() ?? false;

    // Paus: P/Esc växlar, och spelet pausas när fönstret tappar fokus.
    if (this.state === 'playing') {
      if (pausePressed) this.paused = !this.paused;
      else if (blurred) this.paused = true;
    } else {
      this.paused = false;
    }
    if (this.paused) {
      if (start) {
        this.paused = false;
        this.player.prevJump = input.jump; // mellanslag som återupptar ska inte hoppa
      }
      return;
    }
    if (this.timer > 0) this.timer--;
    for (const pop of this.popups) {
      pop.y -= pop.rise ?? 0.5;
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
        this.touchCheckpoints();
        this.handleEnemies(dt, input);
        if (this.state === 'playing') this.handleHunters(dt);
        if (this.state === 'playing') this.handleTraffic(dt);

        const goal = this.level.goal;
        if (this.state !== 'playing') break; // en fiende tog sista livet
        if (p.fellOut) {
          this.lives--;
          this.deathText = 'Du ramlade!';
          this.sfx('fall');
          this.state = 'dying';
          this.timer = DEATH_PAUSE;
        } else if (goal && p.x + p.w > goal.col * TILE + 6) {
          this.state = 'won';
          this.timer = END_LOCKOUT;
          this.sfx('win');
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
            this.sfx('gameOver');
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
