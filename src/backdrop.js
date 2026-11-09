// Landskapet bakom älgen: himmel, kullar och träd i flera lager (parallax),
// samt små detaljer på marken. Allt ritas med kod. Träden är bara bakgrund –
// älgen kan inte klättra i dem.
import { TILE } from './levelParser.js';
import { VIEW_W, VIEW_H } from './config.js';

// ---------------------------------------------------------------------
// Färger per miljö (enkla, jordnära färger)
// ---------------------------------------------------------------------
export const PALETTES = {
  granskog: {
    skyTop: '#7f988f', skyBot: '#aebfb0', hill: '#8aa08f', cloud: '#c4d2c4',
    spruceFar: '#6f8a78', spruceFarLight: '#7d9884',
    spruce: '#3f5d46', spruceLight: '#557a5c', trunk: '#4a3320',
    grass: '#4f7a3a', grassDark: '#3d6230',
  },
  lövskog: {
    skyTop: '#9db89c', skyBot: '#d0d9aa', hill: '#9bb27e', cloud: '#e2e6c8',
    crownFar: '#8aa86c', crownFarLight: '#9ab97b',
    crown: '#6f9a43', crownLight: '#8fb85a', crownAutumn: '#b8a13c', crownAutumnLight: '#d1bb55',
    birch: '#d8d4c4', birchMark: '#3a3228', trunk: '#5a4630',
    spruceFar: '#7f9a74', spruceFarLight: '#8eab82',
    grass: '#5c8a3a', grassDark: '#487030',
  },
  kalhygge: {
    skyTop: '#a9bcc0', skyBot: '#e3ddb4', hill: '#a3ad8c', cloud: '#f0ead0',
    spruceFar: '#8a9a82', spruceFarLight: '#98a88f',
    stump: '#7a5a38', stumpTop: '#c9a77a', snag: '#8a7a66', snagDark: '#6a5c4c',
    grass: '#8a8a40', grassDark: '#6f7432',
  },
  vattendrag: {
    skyTop: '#8fb0b8', skyBot: '#d2dec8', hill: '#8fa890', cloud: '#e6ecd8',
    crownFar: '#8aa07e', crownFarLight: '#9ab08e',
    crown: '#7f9a5a', crownLight: '#a0b87a', trunk: '#5a4630',
    spruceFar: '#7f9a86', spruceFarLight: '#8eaa94',
    grass: '#5f8a4a', grassDark: '#4a7038',
  },
  vägen: {
    skyTop: '#9fb3b8', skyBot: '#d8d4bc', hill: '#9aab8e', cloud: '#e8e6d4',
    spruceFar: '#7f9a86', spruceFarLight: '#8eaa94',
    spruce: '#4a6a50', spruceLight: '#5f8566', trunk: '#4a3320',
    pole: '#4a3a2a', wire: '#3a3a3a',
    grass: '#6a8a42', grassDark: '#587636',
  },
};

export function paletteFor(name) {
  return PALETTES[name] || PALETTES.granskog;
}

// ---------------------------------------------------------------------
// Hjälpfunktioner
// ---------------------------------------------------------------------
function hash(a, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

function lerpColor(a, b, t) {
  const A = hex(a);
  const B = hex(b);
  const m = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + m.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Mjuk övergång mellan miljöernas himmel och kullar runt kameran.
function blendedSky(level, worldX) {
  const col = worldX / TILE;
  const biomes = level.biomes;
  let i = biomes.findIndex((b) => col >= b.from && col <= b.to);
  if (i < 0) i = 0;
  const cur = paletteFor(biomes[i].name);
  const FADE = 8; // rutor
  let other = cur;
  let t = 0;
  if (biomes[i + 1] && col > biomes[i].to - FADE) {
    other = paletteFor(biomes[i + 1].name);
    t = (col - (biomes[i].to - FADE)) / FADE / 2 + 0;
  } else if (biomes[i - 1] && col < biomes[i].from + FADE) {
    other = paletteFor(biomes[i - 1].name);
    t = (biomes[i].from + FADE - col) / FADE / 2;
  }
  t = Math.max(0, Math.min(0.5, t));
  return {
    skyTop: lerpColor(cur.skyTop, other.skyTop, t),
    skyBot: lerpColor(cur.skyBot, other.skyBot, t),
    hill: lerpColor(cur.hill, other.hill, t),
    cloud: lerpColor(cur.cloud, other.cloud, t),
  };
}

// ---------------------------------------------------------------------
// Träd och andra bakgrundsföremål (ritas med fötterna vid y = base)
// ---------------------------------------------------------------------
function spruce(ctx, x, base, h, w, dark, light, trunkColor) {
  const trunkH = Math.max(3, Math.round(h * 0.1));
  rect(ctx, trunkColor || '#4a3320', x - 1, base - trunkH, 2, trunkH);
  const bodyH = h - trunkH;
  const tiers = Math.max(3, Math.round(h / 13));
  for (let t = 0; t < tiers; t++) {
    const y0 = base - h + Math.round((t * bodyH) / tiers);
    const tierH = Math.ceil(bodyH / tiers) + 3;
    const tw = Math.round(w * (0.4 + (0.6 * (t + 1)) / tiers));
    for (let r = 0; r < tierH; r += 2) {
      const rw = Math.max(2, Math.round((tw * (r + 2)) / tierH));
      const half = Math.floor(rw / 2);
      rect(ctx, dark, x - half, y0 + r, half, 2);
      rect(ctx, light, x, y0 + r, rw - half, 2);
    }
  }
}

function disc(ctx, color, cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    rect(ctx, color, cx - half, cy + dy, half * 2 + 1, 1);
  }
}

function roundTree(ctx, x, base, trunkH, r, trunkColor, c1, c2, birch, pal) {
  rect(ctx, trunkColor, x - 1, base - trunkH, birch ? 3 : 2, trunkH);
  if (birch) {
    for (let y = 3; y < trunkH - 2; y += 5) rect(ctx, pal.birchMark, x - 1, base - y, 2, 1);
  }
  const cy = base - trunkH - Math.round(r * 0.5);
  disc(ctx, c1, x, cy, r);
  disc(ctx, c2, x + Math.round(r * 0.25), cy - Math.round(r * 0.25), Math.round(r * 0.62));
}

function snag(ctx, x, base, h, pal) {
  // Torrakta/stubbe efter avverkning
  rect(ctx, pal.snag, x - 1, base - h, 3, h);
  rect(ctx, pal.snagDark, x + 1, base - h, 1, h);
  if (h > 12) {
    rect(ctx, pal.snag, x - 4, base - h + 4, 3, 1);
    rect(ctx, pal.snag, x + 2, base - h + 8, 3, 1);
  }
}

function pole(ctx, x, base, h, pal) {
  rect(ctx, pal.pole, x - 1, base - h, 2, h);
  rect(ctx, pal.pole, x - 6, base - h + 2, 12, 2);
  rect(ctx, pal.pole, x - 4, base - h + 7, 8, 1);
}

function wire(ctx, x0, x1, y, sag, color) {
  ctx.fillStyle = color;
  for (let x = x0; x <= x1; x += 2) {
    const t = (x - x0) / (x1 - x0);
    ctx.fillRect(Math.round(x), Math.round(y + Math.sin(Math.PI * t) * sag), 1, 1);
  }
}

// ---------------------------------------------------------------------
// Lager med parallax. Ett lager flyttar sig p gånger kamerans rörelse.
// biomeAtLayer() översätter lagrets koordinat tillbaka till banans miljö, så att
// miljöbytet syns ungefär samtidigt som man passerar det.
// ---------------------------------------------------------------------
function biomeAtLayer(level, tx, p) {
  const worldX = (tx - (VIEW_W / 2) * (1 - p)) / p;
  return level.biomeAt(Math.floor(worldX / TILE)) || 'granskog';
}

function forEachSlot(camX, p, spacing, fn) {
  const left = camX * p - 40;
  const right = camX * p + VIEW_W + 40;
  for (let i = Math.floor(left / spacing); i <= Math.ceil(right / spacing); i++) fn(i, i * spacing, i * spacing - camX * p);
}

function farLayer(ctx, camX, level) {
  const p = 0.25;
  const S = 20;
  const base = 160;
  forEachSlot(camX, p, S, (i, tx, sx) => {
    const biome = biomeAtLayer(level, tx, p);
    const pal = paletteFor(biome);
    const rnd = hash(i, 1);
    const x = Math.round(sx + rnd * S * 0.8);
    if (biome === 'lövskog' || biome === 'vattendrag') {
      if (rnd < 0.15) return;
      const r = 6 + Math.floor(hash(i, 2) * 5);
      roundTree(ctx, x, base, 8, r, pal.spruceFar, pal.crownFar, pal.crownFarLight, false, pal);
    } else if (biome === 'kalhygge' || biome === 'vägen') {
      if (hash(i, 3) < 0.6) return; // glesare
      const h = 20 + Math.floor(hash(i, 4) * 16);
      spruce(ctx, x, base, h, 10, pal.spruceFar, pal.spruceFarLight);
    } else {
      const h = 28 + Math.floor(hash(i, 4) * 26);
      spruce(ctx, x, base, h, 12, pal.spruceFar, pal.spruceFarLight);
    }
  });
}

function midLayer(ctx, camX, level) {
  const p = 0.55;
  const S = 36;
  const base = 174;
  const poleSpacing = 3; // var 3:e plats får en stolpe längs vägen
  forEachSlot(camX, p, S, (i, tx, sx) => {
    const biome = biomeAtLayer(level, tx, p);
    const pal = paletteFor(biome);
    const rnd = hash(i, 11);
    const x = Math.round(sx + rnd * S * 0.7);

    if (biome === 'granskog') {
      if (rnd < 0.1) return;
      const h = 62 + Math.floor(hash(i, 12) * 38);
      spruce(ctx, x, base, h, 22 + Math.floor(hash(i, 13) * 8), pal.spruce, pal.spruceLight, pal.trunk);
    } else if (biome === 'lövskog') {
      if (rnd < 0.12) return;
      const birch = hash(i, 14) < 0.55;
      const autumn = hash(i, 15) < 0.25;
      const trunkH = 30 + Math.floor(hash(i, 16) * 22);
      const r = 12 + Math.floor(hash(i, 17) * 7);
      roundTree(
        ctx, x, base, trunkH, r,
        birch ? pal.birch : pal.trunk,
        autumn ? pal.crownAutumn : pal.crown,
        autumn ? pal.crownAutumnLight : pal.crownLight,
        birch, pal,
      );
    } else if (biome === 'vattendrag') {
      // Sälg och vide längs vattnet: breda, låga, gråaktiga kronor
      if (rnd < 0.1) return;
      const trunkH = 18 + Math.floor(hash(i, 16) * 14);
      const r = 14 + Math.floor(hash(i, 17) * 7);
      roundTree(ctx, x, base, trunkH, r, pal.trunk, pal.crown, pal.crownLight, false, pal);
    } else if (biome === 'kalhygge') {
      // Nästan öppet: någon enstaka torraka
      if (hash(i, 18) < 0.78) return;
      snag(ctx, x, base, 20 + Math.floor(hash(i, 19) * 24), pal);
    } else {
      // Vägen: kraftledningsstolpar och enstaka granar
      if (i % poleSpacing === 0) {
        pole(ctx, Math.round(sx), base, 52, pal);
        const nextBiome = biomeAtLayer(level, tx + S * poleSpacing, p);
        if (nextBiome === 'vägen') {
          const nx = Math.round(sx + S * poleSpacing);
          wire(ctx, Math.round(sx) - 5, nx - 5, base - 50, 6, pal.wire);
          wire(ctx, Math.round(sx) + 5, nx + 5, base - 50, 6, pal.wire);
          wire(ctx, Math.round(sx) - 3, nx - 3, base - 45, 5, pal.wire);
        }
      } else if (hash(i, 20) < 0.3) {
        spruce(ctx, x, base, 46 + Math.floor(hash(i, 21) * 20), 18, pal.spruce, pal.spruceLight, pal.trunk);
      }
    }
  });
}

function hills(ctx, camX, sky) {
  const p = 0.1;
  ctx.fillStyle = sky.hill;
  for (let sx = 0; sx < VIEW_W; sx += 2) {
    const wx = sx + camX * p;
    const hgt = 22 + Math.sin(wx * 0.012 + 1) * 10 + Math.sin(wx * 0.031 + 2) * 6 + Math.sin(wx * 0.007) * 8;
    ctx.fillRect(sx, 170 - Math.round(hgt), 2, Math.round(hgt));
  }
}

function clouds(ctx, camX, ticks, sky) {
  ctx.fillStyle = sky.cloud;
  for (let i = 0; i < 5; i++) {
    const w = 30 + Math.floor(hash(i, 40) * 30);
    const x = Math.round(((hash(i, 41) * 600 + ticks * 0.04 - camX * 0.05) % (VIEW_W + 120)) - 60);
    const y = 18 + Math.floor(hash(i, 42) * 50);
    ctx.fillRect(x, y, w, 4);
    ctx.fillRect(x + 6, y - 3, w - 14, 3);
    ctx.fillRect(x + 12, y + 4, w - 22, 2);
  }
}

/** Ritar hela bakgrunden. */
export function drawBackdrop(ctx, camX, ticks, level) {
  const sky = blendedSky(level, camX + VIEW_W / 2);

  // Himmel i band
  const bands = 8;
  for (let b = 0; b < bands; b++) {
    ctx.fillStyle = lerpColor(sky.skyTop, sky.skyBot, b / (bands - 1));
    ctx.fillRect(0, Math.floor((b * VIEW_H) / bands), VIEW_W, Math.ceil(VIEW_H / bands) + 1);
  }
  clouds(ctx, camX, ticks, sky);
  hills(ctx, camX, sky);
  farLayer(ctx, camX, level);
  midLayer(ctx, camX, level);
}

// ---------------------------------------------------------------------
// Detaljer på marken (framför bakgrunden, bakom älgen och fienderna)
// ---------------------------------------------------------------------
function decorFern(ctx, x, y) {
  ctx.fillStyle = '#3f6a35';
  ctx.fillRect(x + 3, y - 5, 1, 5);
  ctx.fillRect(x + 1, y - 4, 2, 1);
  ctx.fillRect(x + 4, y - 4, 2, 1);
  ctx.fillRect(x, y - 3, 2, 1);
  ctx.fillRect(x + 5, y - 3, 2, 1);
  ctx.fillRect(x + 2, y - 2, 1, 1);
  ctx.fillRect(x + 4, y - 2, 1, 1);
}

function decorMushroom(ctx, x, y) {
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(x + 1, y - 3, 1, 3);
  ctx.fillStyle = '#c0452b';
  ctx.fillRect(x, y - 5, 3, 2);
  ctx.fillStyle = '#f1e6c8';
  ctx.fillRect(x + 1, y - 5, 1, 1);
}

function decorLingon(ctx, x, y) {
  ctx.fillStyle = '#3f6a35';
  ctx.fillRect(x, y - 3, 6, 3);
  ctx.fillStyle = '#b03030';
  ctx.fillRect(x + 1, y - 3, 1, 1);
  ctx.fillRect(x + 4, y - 2, 1, 1);
}

function decorFlower(ctx, x, y, h) {
  ctx.fillStyle = '#4a7a30';
  ctx.fillRect(x + 1, y - 4, 1, 4);
  ctx.fillStyle = h < 0.5 ? '#f1e6c8' : '#e0c050';
  ctx.fillRect(x, y - 6, 3, 2);
}

function decorBush(ctx, x, y) {
  ctx.fillStyle = '#4f7a30';
  ctx.fillRect(x, y - 4, 10, 4);
  ctx.fillRect(x + 2, y - 6, 6, 2);
  ctx.fillStyle = '#6f9a43';
  ctx.fillRect(x + 4, y - 6, 3, 2);
}

function decorStump(ctx, x, y) {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x, y - 6, 7, 6);
  ctx.fillStyle = '#c9a77a';
  ctx.fillRect(x, y - 7, 7, 2);
  ctx.fillStyle = '#9a7a52';
  ctx.fillRect(x + 2, y - 7, 3, 1);
}

function decorSlash(ctx, x, y) {
  ctx.fillStyle = '#7a5a38';
  ctx.fillRect(x, y - 2, 11, 2);
  ctx.fillRect(x + 2, y - 4, 8, 2);
  ctx.fillStyle = '#5a3f28';
  ctx.fillRect(x + 1, y - 5, 2, 1);
  ctx.fillRect(x + 7, y - 6, 3, 2);
  ctx.fillStyle = '#4f7a30';
  ctx.fillRect(x + 4, y - 4, 3, 1); // lite granris
}

function decorSapling(ctx, x, y) {
  ctx.fillStyle = '#4f7a30';
  ctx.fillRect(x + 1, y - 2, 1, 2);
  ctx.fillRect(x, y - 4, 3, 2);
  ctx.fillRect(x + 1, y - 6, 1, 2);
}

function decorReed(ctx, x, y) {
  ctx.fillStyle = '#6f8a4a';
  ctx.fillRect(x + 1, y - 9, 1, 9);
  ctx.fillRect(x + 4, y - 7, 1, 7);
  ctx.fillStyle = '#5a3f28';
  ctx.fillRect(x, y - 11, 3, 4);
  ctx.fillRect(x + 3, y - 9, 3, 3);
}

function decorTuft(ctx, x, y, pal) {
  ctx.fillStyle = pal.grassDark;
  ctx.fillRect(x, y - 2, 1, 2);
  ctx.fillRect(x + 2, y - 3, 1, 3);
  ctx.fillRect(x + 4, y - 2, 1, 2);
}

/** Ritar små detaljer ovanpå markens översidor. */
export function drawGroundDecor(ctx, level, camX, firstCol, lastCol, occupied) {
  for (let col = firstCol; col <= lastCol; col++) {
    // Hitta översta fasta markrutan (bara vanlig mark, inte väg eller räls)
    let row = -1;
    for (let r = 0; r < level.height; r++) {
      if (level.tileAt(col, r) === '#') {
        row = r;
        break;
      }
      if (level.tileAt(col, r) !== ' ') break;
    }
    if (row < 0 || level.tileAt(col, row - 1) !== ' ') continue;
    if (occupied.has(col)) continue; // föremål/fiender står här
    const rnd = hash(col, 77);
    if (rnd > 0.42) continue;
    const biome = level.biomeAt(col);
    const pal = paletteFor(biome);
    const x = col * TILE - camX + 2 + Math.floor(hash(col, 78) * 6);
    const y = row * TILE + 1;
    const k = hash(col, 79);
    if (biome === 'granskog') {
      if (k < 0.4) decorFern(ctx, x, y);
      else if (k < 0.6) decorMushroom(ctx, x, y);
      else if (k < 0.8) decorLingon(ctx, x, y);
      else decorTuft(ctx, x, y, pal);
    } else if (biome === 'lövskog') {
      if (k < 0.35) decorFlower(ctx, x, y, hash(col, 80));
      else if (k < 0.55) decorBush(ctx, x - 1, y);
      else if (k < 0.8) decorFern(ctx, x, y);
      else decorTuft(ctx, x, y, pal);
    } else if (biome === 'kalhygge') {
      if (k < 0.4) decorStump(ctx, x, y);
      else if (k < 0.65) decorSlash(ctx, x - 2, y);
      else if (k < 0.85) decorSapling(ctx, x, y);
      else decorTuft(ctx, x, y, pal);
    } else if (biome === 'vattendrag') {
      if (k < 0.5) decorReed(ctx, x, y);
      else if (k < 0.75) decorFlower(ctx, x, y, hash(col, 80));
      else decorTuft(ctx, x, y, pal);
    } else {
      decorTuft(ctx, x, y, pal);
    }
  }
}

/** Älgvarningsskylt vid vägens början (kommer först i färdriktningen). */
export function drawRoadSigns(ctx, roads, camX) {
  for (const road of roads) {
    const x = Math.round(road.lane.left - 26 - camX);
    const base = road.lane.topY;
    if (x < -20 || x > VIEW_W + 20) continue;
    rect(ctx, '#3a3a3a', x + 6, base - 22, 2, 22); // stolpe
    // Triangelskylt
    for (let r = 0; r < 12; r++) {
      const half = Math.floor(r * 0.6) + 1;
      rect(ctx, '#c0452b', x + 7 - half - 1, base - 36 + r, half * 2 + 2, 1);
      rect(ctx, '#f1e6c8', x + 7 - half + 1, base - 36 + r, Math.max(0, half * 2 - 2), 1);
    }
    rect(ctx, '#c0452b', x - 4, base - 24, 22, 2);
    // Älg-silhuett
    ctx.fillStyle = '#14100c';
    ctx.fillRect(x + 4, base - 29, 6, 3);
    ctx.fillRect(x + 9, base - 31, 2, 3);
    ctx.fillRect(x + 4, base - 26, 1, 2);
    ctx.fillRect(x + 8, base - 26, 1, 2);
    ctx.fillRect(x + 9, base - 33, 3, 1);
  }
}
