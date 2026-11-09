// Tangentbordsinput: håller reda på vilka tangenter som är nedtryckta.

const LEFT = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const JUMP = ['Space', 'ArrowUp'];
const START = ['Space', 'Enter'];
const PREVENT = new Set([...LEFT, ...RIGHT, ...JUMP, ...START, 'ArrowDown', 'F3']);

const down = new Set();
let startFlag = false;
let debugOn = false;

window.addEventListener('keydown', (e) => {
  if (PREVENT.has(e.code)) e.preventDefault();
  if (!e.repeat && START.includes(e.code)) startFlag = true;
  if (!e.repeat && e.code === 'F3') debugOn = !debugOn;
  down.add(e.code);
});
window.addEventListener('keyup', (e) => down.delete(e.code));
window.addEventListener('blur', () => down.clear());

const any = (codes) => codes.some((c) => down.has(c));

export const input = {
  get left() {
    return any(LEFT);
  },
  get right() {
    return any(RIGHT);
  },
  get jump() {
    return any(JUMP);
  },
  get debug() {
    return debugOn;
  },
  // True en gång per tryck på mellanslag eller Enter (för menyer).
  consumeStart() {
    const was = startFlag;
    startFlag = false;
    return was;
  },
};
