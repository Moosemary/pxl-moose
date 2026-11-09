// Ljud: små retro-pip som skapas med Web Audio. Inga ljudfiler.
//
// Webbläsare tillåter ljud först efter att man tryckt på en tangent eller klickat,
// så ljudet startas första gången man trycker på något. M slår av och på ljudet.

// ---------------------------------------------------------------------
// Syntes (fungerar med både riktigt och offline-ljudkontext, så det går att testa)
// ---------------------------------------------------------------------
export function createSynth(ctx, dest) {
  // En sekund vitt brus, delas av alla ljud som behöver brus
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    data[i] = (seed / 4294967296) * 2 - 1;
  }

  /** En ton: f0 → f1 (glid), längd dur sekunder, startar efter 'at' sekunder. */
  function tone(t0, { f0, f1 = f0, dur = 0.1, type = 'square', vol = 0.12, at = 0 }) {
    const t = t0 + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Ett brusstöt, filtrerat. */
  function noise(t0, { dur = 0.12, vol = 0.12, filter = 'lowpass', freq = 2000, at = 0 }) {
    const t = t0 + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(gain).connect(dest);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  const notes = (t0, list, type = 'square', vol = 0.1, step = 0.08, dur = 0.1) =>
    list.forEach((f, i) => tone(t0, { f0: f, dur, type, vol, at: i * step }));

  const SOUNDS = {
    jump: (t) => tone(t, { f0: 280, f1: 600, dur: 0.13, vol: 0.08 }),
    splash: (t) => {
      noise(t, { dur: 0.18, vol: 0.1, filter: 'bandpass', freq: 900 });
      tone(t, { f0: 320, f1: 140, dur: 0.14, type: 'sine', vol: 0.07 });
    },
    eatK: (t) => notes(t, [660, 880], 'triangle', 0.12, 0.06, 0.08),
    eatG: (t) => notes(t, [740, 990], 'triangle', 0.12, 0.06, 0.08),
    eatB: (t) => notes(t, [880, 1175, 1568], 'triangle', 0.12, 0.05, 0.08),
    stomp: (t) => {
      tone(t, { f0: 240, f1: 90, dur: 0.12, vol: 0.12 });
      noise(t, { dur: 0.05, vol: 0.1, filter: 'lowpass', freq: 1500 });
    },
    hurt: (t) => {
      noise(t, { dur: 0.22, vol: 0.16, filter: 'lowpass', freq: 1800 });
      tone(t, { f0: 320, f1: 80, dur: 0.35, type: 'sawtooth', vol: 0.1 });
    },
    shot: (t) => {
      noise(t, { dur: 0.14, vol: 0.14, filter: 'highpass', freq: 1200 });
      tone(t, { f0: 900, f1: 180, dur: 0.1, vol: 0.08 });
    },
    aim: (t) => tone(t, { f0: 1100, dur: 0.05, vol: 0.05 }),
    bark: (t) => {
      for (let i = 0; i < 3; i++) {
        tone(t, { f0: 260, f1: 150, dur: 0.07, vol: 0.12, at: i * 0.14 });
        noise(t, { dur: 0.05, vol: 0.05, filter: 'bandpass', freq: 1200, at: i * 0.14 });
      }
    },
    checkpoint: (t) => notes(t, [523, 659, 784], 'triangle', 0.12, 0.09, 0.14),
    oneUp: (t) => notes(t, [523, 659, 784, 1047, 1319], 'square', 0.08, 0.07, 0.1),
    fall: (t) => tone(t, { f0: 420, f1: 50, dur: 0.7, type: 'sawtooth', vol: 0.09 }),
    gameOver: (t) => notes(t, [392, 330, 262, 196], 'triangle', 0.14, 0.22, 0.3),
    win: (t) => {
      notes(t, [523, 523, 523, 698], 'square', 0.09, 0.12, 0.1);
      notes(t + 0.55, [698, 659, 784, 1047], 'square', 0.09, 0.14, 0.2);
    },
    start: (t) => notes(t, [392, 523, 659], 'square', 0.08, 0.08, 0.1),
    bell: (t) => tone(t, { f0: 1318, dur: 0.09, type: 'sine', vol: 0.09 }),
    horn: (t) => {
      tone(t, { f0: 131, dur: 0.6, type: 'sawtooth', vol: 0.07 });
      tone(t, { f0: 165, dur: 0.6, type: 'sawtooth', vol: 0.06 });
    },
    on: (t) => tone(t, { f0: 660, dur: 0.08, vol: 0.08 }),
  };

  return {
    names: Object.keys(SOUNDS),
    play(name, when = ctx.currentTime) {
      const fn = SOUNDS[name];
      if (fn) fn(when);
    },
  };
}

// ---------------------------------------------------------------------
// Själva ljudet i spelet
// ---------------------------------------------------------------------
const STORAGE_KEY = 'pxlmoose.muted';
const MIN_GAP_MS = 35; // samma ljud spelas inte tätare än så

function loadMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveMuted(v) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    /* ingen lagring tillgänglig – inget problem */
  }
}

class GameAudio {
  constructor() {
    this.muted = loadMuted();
    this.ctx = null;
    this.synth = null;
    this.last = new Map();
    this.played = 0; // räknare, bra vid felsökning
    this.play = this.play.bind(this);
  }

  /** Startar ljudet (måste ske efter ett tangenttryck eller klick). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    if (!AC) return;
    try {
      this.ctx = new AC();
      const master = this.ctx.createGain();
      master.gain.value = 0.6;
      master.connect(this.ctx.destination);
      this.synth = createSynth(this.ctx, master);
    } catch {
      this.ctx = null;
    }
  }

  play(name) {
    if (this.muted || !this.synth) return;
    const now = performance.now();
    if (now - (this.last.get(name) ?? -1e9) < MIN_GAP_MS) return;
    this.last.set(name, now);
    this.played++;
    this.synth.play(name);
  }

  toggleMute() {
    this.muted = !this.muted;
    saveMuted(this.muted);
    if (!this.muted) this.play('on');
  }
}

export const audio = new GameAudio();

if (typeof window !== 'undefined') {
  const unlock = () => audio.unlock();
  window.addEventListener('keydown', (e) => {
    unlock();
    if (e.code === 'KeyM' && !e.repeat) audio.toggleMute();
  });
  window.addEventListener('pointerdown', unlock);
}
