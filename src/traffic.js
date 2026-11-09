// Trafik: bilar och bussar på vägen (=) och tåg på rälsen (-). Allt ritas med kod.
//
// Fordon syns bara inom sin väg/räls. De kör in från ena änden och ut genom den
// andra, så de "kommer från sidan". Alla fordon är farliga vid minsta kontakt.
import { TILE } from './levelParser.js';

const ROAD_SPEED = 66; // alla fordon på en väg kör lika fort så att de inte kör ihop
const ENTRY_GAP = 70; // minsta avstånd till fordonet framför när ett nytt kommer in
export const VEHICLE_TYPES = {
  C: { name: 'bil', w: 32, h: 14 },
  U: { name: 'buss', w: 50, h: 20 },
};

const TRAIN_SPEED = 170;
const TRAIN_LEN = 186;
const TRAIN_H = 26;
const TRAIN_WAIT = 330; // ticks mellan tåg
const TRAIN_WARN = 120; // varningstid med blinkande ljus innan tåget kommer

/** Hittar hur långt en väg/räls sträcker sig åt sidorna under en fordonsruta. */
export function findLane(level, col, row, ch) {
  const r = row + 1; // underlaget
  let l = col;
  let rr = col;
  while (level.tileAt(l - 1, r) === ch) l--;
  while (level.tileAt(rr + 1, r) === ch) rr++;
  return { left: l * TILE, right: (rr + 1) * TILE, topY: r * TILE };
}

function px(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function overlap(player, x0, y0, x1, y1) {
  return player.x + 2 < x1 && player.x + player.w - 2 > x0 && player.y + 2 < y1 && player.y + player.h > y0;
}

// ---------------------------------------------------------------------
// Väg med bilar och bussar
// ---------------------------------------------------------------------
export class Road {
  constructor(lane, defs) {
    this.lane = lane;
    this.cycles = 0;
    this.vehicles = defs.map((d, i) => ({
      ch: d.ch,
      w: VEHICLE_TYPES[d.ch].w,
      h: VEHICLE_TYPES[d.ch].h,
      startX: d.col * TILE,
      color: i % 3,
      x: 0,
      y: lane.topY - VEHICLE_TYPES[d.ch].h,
      state: 'drive',
      timer: 0,
    }));
    this.reset();
  }

  reset() {
    this.active = false;
    this.cycles = 0;
    for (const v of this.vehicles) {
      v.x = v.startX;
      v.state = 'drive';
      v.timer = 0;
    }
  }

  update(dt, cameraX, viewW) {
    if (!this.active) {
      if (this.lane.left < cameraX + viewW + 32) this.active = true;
      else return;
    }
    const { left, right } = this.lane;
    for (const v of this.vehicles) {
      if (v.state === 'drive') {
        v.x -= ROAD_SPEED * dt;
        if (v.x + v.w < left) {
          v.state = 'wait';
          this.cycles++;
          v.timer = 70 + ((v.startX + this.cycles * 53) % 150); // oregelbunden trafik
        }
      } else if (v.timer > 0) {
        v.timer--;
      }
    }
    for (const v of this.vehicles) {
      if (v.state !== 'wait' || v.timer > 0) continue;
      const clear = this.vehicles.every((o) => o === v || o.state !== 'drive' || o.x + o.w <= right - ENTRY_GAP);
      if (clear) {
        v.x = right;
        v.state = 'drive';
      }
    }
  }

  /** Returnerar fordonet som träffar älgen (eller null). */
  hit(player) {
    if (!this.active) return null;
    const { left, right } = this.lane;
    for (const v of this.vehicles) {
      if (v.state !== 'drive') continue;
      const x0 = Math.max(v.x, left);
      const x1 = Math.min(v.x + v.w, right);
      if (x1 > x0 && overlap(player, x0, v.y, x1, v.y + v.h)) return v;
    }
    return null;
  }

  draw(ctx, camX, viewH) {
    const { left, right } = this.lane;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - camX, 0, right - left, viewH);
    ctx.clip();
    for (const v of this.vehicles) {
      if (v.state !== 'drive') continue;
      const x = Math.round(v.x - camX);
      const y = Math.round(v.y);
      if (v.ch === 'C') drawCar(ctx, x, y, v.color);
      else drawBus(ctx, x, y);
    }
    ctx.restore();
  }
}

const CAR_COLORS = ['#8a3b2a', '#3d5a6b', '#6b6f45'];

// Fordonen kör åt vänster, så framsidan ritas till vänster.
function drawCar(ctx, x, y, colorIdx) {
  const body = CAR_COLORS[colorIdx % CAR_COLORS.length];
  px(ctx, '#ffe07044', x - 10, y + 6, 10, 4); // strålkastarljus
  px(ctx, body, x, y + 5, 32, 6); // kaross
  px(ctx, body, x + 7, y, 17, 6); // hytt
  px(ctx, '#a9c4cf', x + 9, y + 1, 6, 4); // rutor
  px(ctx, '#a9c4cf', x + 17, y + 1, 5, 4);
  px(ctx, '#00000033', x, y + 10, 32, 1);
  px(ctx, '#ffe070', x, y + 6, 2, 2); // strålkastare
  px(ctx, '#c0452b', x + 30, y + 6, 2, 2); // baklykta
  for (const wx of [4, 22]) {
    px(ctx, '#1b1a17', x + wx, y + 9, 6, 5);
    px(ctx, '#7a7a7a', x + wx + 2, y + 11, 2, 2);
  }
}

function drawBus(ctx, x, y) {
  px(ctx, '#ffe07044', x - 10, y + 10, 10, 4);
  px(ctx, '#5e7a4a', x, y + 2, 50, 14); // kaross
  px(ctx, '#47603a', x, y + 12, 50, 3);
  px(ctx, '#d8d0b8', x, y + 2, 50, 2); // vit kant upptill
  for (let i = 0; i < 5; i++) px(ctx, '#a9c4cf', x + 4 + i * 8, y + 5, 6, 5); // fönster
  px(ctx, '#a9c4cf', x + 1, y + 5, 3, 6); // vindruta
  px(ctx, '#3a2a20', x + 44, y + 5, 4, 10); // dörr bak
  px(ctx, '#ffe070', x, y + 12, 2, 2);
  px(ctx, '#c0452b', x + 48, y + 11, 2, 2);
  for (const wx of [7, 36]) {
    px(ctx, '#1b1a17', x + wx, y + 14, 7, 6);
    px(ctx, '#7a7a7a', x + wx + 2, y + 16, 3, 2);
  }
}

// ---------------------------------------------------------------------
// Tåg på räls, med varningsljus
// ---------------------------------------------------------------------
export class Train {
  constructor(lane, col) {
    this.lane = lane;
    this.firstWait = TRAIN_WAIT - 80 + (col % 7) * 10;
    this.reset();
  }

  reset() {
    this.active = false;
    this.state = 'wait'; // 'wait' | 'warn' | 'run'
    this.timer = this.firstWait;
    this.x = this.lane.right;
  }

  get signalOn() {
    return this.state !== 'wait';
  }

  update(dt, cameraX, viewW) {
    if (!this.active) {
      if (this.lane.left < cameraX + viewW + 32) this.active = true;
      else return;
    }
    if (this.state === 'wait') {
      if (--this.timer <= 0) {
        this.state = 'warn';
        this.timer = TRAIN_WARN;
      }
    } else if (this.state === 'warn') {
      if (--this.timer <= 0) {
        this.state = 'run';
        this.x = this.lane.right;
      }
    } else {
      this.x -= TRAIN_SPEED * dt;
      if (this.x + TRAIN_LEN < this.lane.left) {
        this.state = 'wait';
        this.timer = TRAIN_WAIT;
      }
    }
  }

  hit(player) {
    if (this.state !== 'run') return null;
    const { left, right, topY } = this.lane;
    const x0 = Math.max(this.x, left);
    const x1 = Math.min(this.x + TRAIN_LEN, right);
    if (x1 > x0 && overlap(player, x0, topY - TRAIN_H, x1, topY)) return this;
    return null;
  }

  draw(ctx, camX, viewH, ticks) {
    const { left, right, topY } = this.lane;

    // Varningssignaler vid båda ändar av rälsen
    for (const sx of [left - 5, right + 4]) {
      const x = Math.round(sx - camX);
      px(ctx, '#3a3a3a', x, topY - 30, 2, 30);
      px(ctx, '#2a2a2a', x - 4, topY - 32, 10, 8);
      const flip = Math.floor(ticks / 14) % 2 === 0;
      px(ctx, this.signalOn && flip ? '#ff5a3c' : '#5a2a22', x - 3, topY - 31, 3, 6);
      px(ctx, this.signalOn && !flip ? '#ff5a3c' : '#5a2a22', x + 1, topY - 31, 3, 6);
    }

    if (this.state !== 'run') return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - camX, 0, right - left, viewH);
    ctx.clip();
    drawTrain(ctx, Math.round(this.x - camX), Math.round(topY - TRAIN_H));
    ctx.restore();
  }
}

function drawTrain(ctx, x, y) {
  // Lok längst fram (vänster), sedan vagnar
  px(ctx, '#fff4c044', x - 14, y + 16, 14, 4);
  px(ctx, '#3d5a6b', x, y + 4, 34, 18); // lok
  px(ctx, '#3d5a6b', x + 4, y, 26, 6);
  px(ctx, '#a9c4cf', x + 3, y + 6, 6, 6); // framruta
  px(ctx, '#a9c4cf', x + 14, y + 7, 14, 5);
  px(ctx, '#e0c050', x, y + 14, 34, 2);
  px(ctx, '#fffbe0', x, y + 16, 3, 3); // lyse
  for (let i = 0; i < 4; i++) {
    const wx = x + 34 + i * 38 + 1;
    px(ctx, '#5e6b73', wx, y + 4, 36, 18);
    px(ctx, '#e8e4d4', wx, y + 4, 36, 2);
    for (let k = 0; k < 4; k++) px(ctx, '#a9c4cf', wx + 3 + k * 8, y + 8, 6, 6);
    px(ctx, '#3a3f45', wx + 34, y + 12, 3, 3); // koppling
  }
  // Hjul
  const total = 34 + 4 * 38;
  for (let wx = 4; wx < total; wx += 11) {
    px(ctx, '#1b1a17', x + wx, y + 21, 6, 5);
    px(ctx, '#8a8780', x + wx + 2, y + 23, 2, 2);
  }
}
