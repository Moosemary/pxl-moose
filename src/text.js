// Text i spelet. Använder pixeltypsnittet Press Start 2P (filen ligger i src/fonts/).
// Typsnittet är byggt på ett rutnät om 8 pixlar, så texten blir skarpast i storlekarna 8, 16, 24 och 32.

// Obs: versalen Å saknas i typsnittet (den ritas som ett vanligt A). Gemena å, ä, ö och versalerna Ä och Ö fungerar.
export const FONT_FAMILY = '"Press Start 2P", monospace';

/**
 * Ritar text med skugga.
 * size: typsnittsstorlek (helst 8, 16, 24 eller 32). maxWidth: minskar storleken om texten är för bred.
 */
export function text(ctx, str, x, y, opts = {}) {
  const { size = 8, color = '#f1e6c8', align = 'left', shadow = '#1b1a17', maxWidth = 0, font = FONT_FAMILY } = opts;
  let s = size;
  if (maxWidth) {
    ctx.font = `${s}px ${font}`;
    // Krymp i 8-pixelssteg tills det får plats (men aldrig under 8)
    while (s > 8 && ctx.measureText(str).width > maxWidth) {
      s -= 8;
      ctx.font = `${s}px ${font}`;
    }
  }
  ctx.font = `${s}px ${font}`;
  ctx.textRendering = 'optimizeSpeed'; // inga ligaturer ("fi" ska inte smälta ihop)
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const px = Math.round(x);
  const py = Math.round(y);
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(str, px + 1, py + 1);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, px, py);
}

/** Väntar tills typsnittet är laddat (med en tidsgräns så att spelet alltid startar). */
export function whenFontReady(timeoutMs = 2500) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  const load = document.fonts.load(`16px ${FONT_FAMILY}`).catch(() => {});
  const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([load, timeout]);
}
