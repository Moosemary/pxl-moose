// Älgen ritas med kod (små rektanglar = pixlar). Inga bildfiler.
// Koordinater är relativa till älgens fötter, mitt under kroppen, och vänd åt höger.
// Vänd åt vänster speglas bilden.

const C = {
  body: '#5a3c26',
  bodyLight: '#6e4b30',
  bodyDark: '#432b1b',
  antler: '#3a2414',
  antlerLight: '#5a3a20',
  legs: '#8b7b66',
  hoof: '#2b1a10',
  muzzle: '#3a2a20',
  eye: '#f1e6c8',
};

function r(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawLeg(ctx, x, swing, lift, far) {
  const color = far ? '#6f6250' : C.legs;
  const sx = x + Math.round(swing);
  const h = 8 - lift;
  r(ctx, color, sx, -8, 3, h);
  r(ctx, C.hoof, sx, -lift - 2, 3, 2);
}

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

  // Ben (bakom kroppen först, så att de "längst bort" hamnar under)
  const legX = [-10, -6, 1, 5];
  for (let i = 0; i < 4; i++) {
    const far = i === 0 || i === 2;
    let swing, lift;
    if (onGround) {
      const s = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI));
      swing = s * 3;
      lift = s > 0.6 ? 2 : 0;
    } else {
      // I luften: framben framåt, bakben bakåt
      swing = i >= 2 ? 3 : -3;
      lift = vy < 0 ? 2 : 0;
    }
    drawLeg(ctx, legX[i], swing, lift, far);
  }

  // Svans
  r(ctx, C.bodyDark, -13, -16, 2, 3);

  // Kropp och bog
  r(ctx, C.body, -11, -17, 17, 9);
  r(ctx, C.bodyLight, -9, -17, 13, 2);
  r(ctx, C.bodyDark, -11, -10, 17, 2);
  r(ctx, C.body, -3, -19, 8, 3); // manken

  // Hals, huvud och mular
  r(ctx, C.body, 4, -21, 5, 9);
  r(ctx, C.body, 7, -22, 8, 6);
  r(ctx, C.muzzle, 12, -19, 5, 6);
  r(ctx, C.bodyDark, 8, -15, 2, 4); // haklapp
  r(ctx, C.eye, 11, -20, 1, 1);
  r(ctx, C.body, 6, -24, 3, 2); // öra

  // Horn (platta skovlar)
  r(ctx, C.antler, 8, -26, 2, 4);
  r(ctx, C.antler, 4, -29, 11, 3);
  r(ctx, C.antlerLight, 5, -29, 9, 1);
  r(ctx, C.antler, 4, -31, 2, 2);
  r(ctx, C.antler, 8, -32, 2, 3);
  r(ctx, C.antler, 12, -31, 2, 2);
  r(ctx, C.antler, 15, -30, 2, 2);

  ctx.restore();
}
