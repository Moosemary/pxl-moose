// Spelloop med fast tidssteg: spelet uppdateras alltid 60 gånger per sekund,
// oavsett om skärmen kör 60, 144 eller 240 Hz.

export const STEP = 1 / 60;
const MAX_FRAME = 0.25; // skydd om fliken varit pausad
const MAX_STEPS = 8;

export function startLoop(update, render) {
  let last = performance.now() / 1000;
  let acc = 0;

  function frame(nowMs) {
    const now = nowMs / 1000;
    acc += Math.min(now - last, MAX_FRAME);
    last = now;

    let steps = 0;
    while (acc >= STEP && steps < MAX_STEPS) {
      update(STEP);
      acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) acc = 0;

    render(acc / STEP);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
