// Steg 1: tom canvas som fyller fönstret och visar namnet.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

function draw() {
  ctx.fillStyle = '#2f3b2a'; // mörk skogsgrön
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e8dcc0';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('pxl moose', canvas.width / 2, canvas.height / 2);
}

window.addEventListener('resize', resize);
resize();
