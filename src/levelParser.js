// Gör om banans textrader till ett rutnät och en lista med föremål.

export const TILE = 16;

// Tecken som är fasta (man kan stå på dem).
const SOLID = new Set(['#', 'S']);
const WATER = '~';

export function parseLevel(rows, biomes) {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const grid = [];
  const entities = [];
  let start = { col: 1, row: height - 3 };
  let goal = null;

  for (let row = 0; row < height; row++) {
    const line = [];
    for (let col = 0; col < width; col++) {
      let ch = rows[row][col] ?? ' ';
      if (ch === '.') ch = ' ';
      if (ch === 'P') {
        start = { col, row };
        ch = ' ';
      } else if (ch === 'G') {
        goal = { col, row };
        ch = ' ';
      } else if (ch !== ' ' && ch !== WATER && !SOLID.has(ch)) {
        entities.push({ ch, col, row }); // används i senare steg
        ch = ' ';
      }
      line.push(ch);
    }
    grid.push(line);
  }

  return {
    width,
    height,
    grid,
    entities,
    start,
    goal,
    biomes,
    isSolid(col, row) {
      if (col < 0 || col >= width || row < 0) return col < 0 || col >= width;
      if (row >= height) return false;
      return SOLID.has(grid[row][col]);
    },
    isWater(col, row) {
      return col >= 0 && col < width && row >= 0 && row < height && grid[row][col] === WATER;
    },
    // Y-koordinaten (pixlar) för vattenytan i den här kolumnen, sett från en vattenruta.
    waterTopY(col, row) {
      let r = row;
      while (r > 0 && grid[r - 1][col] === WATER) r--;
      return r * TILE;
    },
    tileAt(col, row) {
      if (col < 0 || col >= width || row < 0 || row >= height) return ' ';
      return grid[row][col];
    },
    biomeAt(col) {
      return biomes.find((b) => col >= b.from && col <= b.to)?.name ?? '';
    },
    // Hur långt en jägare ser älgen när den står i den här kolumnen (pixlar).
    sightAt(col) {
      return biomes.find((b) => col >= b.from && col <= b.to)?.sight ?? 100;
    },
  };
}
