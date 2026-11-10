// Älgen. Formen och färgerna kommer från konstverket pxl-moose-2-skuggad.svg, omräknat till
// spelets pixelrutnät (1 ruta = 10 SVG-enheter). Allt ritas med kod – inga bildfiler.
//
// Koordinaterna är relativa till älgens fötter (x = mitten av kroppen, y = marknivå) och älgen är vänd åt höger.
// Vänd åt vänster speglas bilden. Benen (leg = 0–3) animeras när älgen går eller hoppar.
//
// Varje rad: [x, y, bredd, höjd, färg, ben, sort]
//   ben  = -1 för alla delar utom benen, annars 0–3 (0–1 bakben, 2–3 framben)
//   sort = 'leg' (benet), 'cap' (mörkt knä) eller 'hoof' (hov), 'body' för övrigt
// Delarna ritas i den här ordningen (de sist i listan hamnar överst).
const PARTS = [
  [5, -19, 8, 5, '#3a2b21', -1, 'body'],
  [-14, -18, 3, 3, '#432b1b', -1, 'body'],
  [-12, -19, 19, 9, '#5a3d27', -1, 'body'],
  [-12, -11, 3, 11, '#7f705b', 0, 'leg'],
  [-12, -11, 3, 3, '#4d3c2e', 0, 'cap'],
  [-12, -3, 3, 3, '#2b1c13', 0, 'hoof'],
  [-8, -11, 3, 11, '#a8957a', 1, 'leg'],
  [-8, -11, 3, 3, '#4d3c2e', 1, 'cap'],
  [-8, -3, 3, 3, '#2b1c13', 1, 'hoof'],
  [0, -11, 3, 11, '#7f705b', 2, 'leg'],
  [0, -11, 3, 3, '#4d3c2e', 2, 'cap'],
  [0, -3, 3, 3, '#2b1c13', 2, 'hoof'],
  [4, -11, 3, 11, '#a8957a', 3, 'leg'],
  [4, -11, 3, 3, '#4d3c2e', 3, 'cap'],
  [4, -3, 3, 3, '#2b1c13', 3, 'hoof'],
  [15, -19, 4, 5, '#5f4b3a', -1, 'body'],
  [13, -19, 3, 4, '#3a2b21', -1, 'body'],
  [10, -20, 4, 3, '#3a2b21', -1, 'body'],
  [12, -16, 2, 3, '#2b1c13', -1, 'body'],
  [7, -19, 7, 4, '#3a2b21', -1, 'body'],
  [1, -22, 4, 3, '#6a4a31', -1, 'body'],
  [3, -20, 4, 3, '#3a2b21', -1, 'body'],
  [-6, -21, 7, 3, '#6a4a31', -1, 'body'],
  [2, -16, 7, 6, '#5a3d27', -1, 'body'],
  [8, -22, 2, 3, '#3a2517', -1, 'body'],
  [11, -28, 2, 10, '#3a2517', -1, 'body'],
  [8, -24, 12, 2, '#3a2517', -1, 'body'],
  [7, -27, 2, 3, '#3a2517', -1, 'body'],
  [15, -28, 2, 5, '#3a2517', -1, 'body'],
  [-10, -19, 13, 2, '#5a3d27', -1, 'body'],
  [11, -19, 2, 2, '#f1e5c7', -1, 'body'],
  [-10, -19, 13, 2, '#7a5a3b', -1, 'body'],
  [-6, -21, 10, 2, '#6a4a31', -1, 'body'],
  [-12, -13, 20, 2, '#46301f', -1, 'body'],
  [-12, -11, 20, 1, '#2b1c13', -1, 'body'],
  [7, -19, 2, 9, '#3a2b21', -1, 'body'],
];

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx   fötternas mitt i skärmen (x)
 * @param {number} by   fötternas nivå i skärmen (y)
 * @param {number} dir  1 = höger, -1 = vänster
 * @param {number} phase gå-fas (radianer)
 * @param {boolean} onGround
 * @param {number} vy
 */
export function drawMoose(ctx, cx, by, dir, phase, onGround, vy) {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(by));
  ctx.scale(dir, 1);

  // Hur varje ben rör sig: svänger fram och tillbaka vid gång, sträcks ut i luften
  const swing = [0, 0, 0, 0];
  const lift = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    if (onGround) {
      const s = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI));
      swing[i] = Math.round(s * 3);
      lift[i] = s > 0.6 ? 2 : 0;
    } else {
      swing[i] = i >= 2 ? 3 : -3; // framben framåt, bakben bakåt
      lift[i] = vy < 0 ? 2 : 0;
    }
  }

  for (const [px, py, w, h, color, leg, kind] of PARTS) {
    let x = px;
    let y = py;
    let height = h;
    if (leg >= 0) {
      x += swing[leg];
      if (kind === 'leg') height -= lift[leg];
      else if (kind === 'hoof') y -= lift[leg];
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, height);
  }

  ctx.restore();
}
