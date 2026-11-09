// Tangentbordsinput: håller reda på vilka tangenter som är nedtryckta.

const LEFT = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const JUMP = ['Space', 'ArrowUp'];
const PREVENT = new Set([...LEFT, ...RIGHT, ...JUMP, 'ArrowDown']);

const down = new Set();

window.addEventListener('keydown', (e) => {
  if (PREVENT.has(e.code)) e.preventDefault();
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
};
