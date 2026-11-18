// Redibuja a mano el isotipo de Orión (girasol con la constelación calada) y arma el logo
// completo combinándolo con el nombre "ORIÓN" vectorizado por vectorizar.cjs.
//
// Uso: node brand/tools/gen-isotipo.cjs <svg-trazado-con-nombre> <carpeta-salida>
// El isotipo se dibuja en un espacio de 900x900 con el centro en (460, 460).
const fs = require('fs');
const path = require('path');

const [, , tracedSvg, outDir] = process.argv;
const GOLD = '#E8A917';
const NAVY = '#14233B';
const IVORY = '#FAF6EC';
const CX = 460, CY = 460;

const f = (n) => Math.round(n * 10) / 10;
const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [f(CX + r * Math.cos(a)), f(CY + r * Math.sin(a))];
};
const ring = (n, offset, fn) => Array.from({ length: n }, (_, i) => fn(offset + (360 / n) * i)).join('');

// Pétalo en forma de hoja, del radio r0 al r1, con ancho máximo w.
function petal(deg, r0, r1, w) {
  const [x0, y0] = polar(r0, deg);
  const [x1, y1] = polar(r1, deg);
  const mid = r0 + (r1 - r0) * 0.5;
  const [lx, ly] = polar(Math.hypot(mid, w), deg - (Math.atan2(w, mid) * 180) / Math.PI);
  const [rx, ry] = polar(Math.hypot(mid, w), deg + (Math.atan2(w, mid) * 180) / Math.PI);
  return `M${x0} ${y0} Q${lx} ${ly} ${x1} ${y1} Q${rx} ${ry} ${x0} ${y0} Z`;
}
function vein(deg, r0, r1) {
  const [x0, y0] = polar(r0, deg);
  const [x1, y1] = polar(r1, deg);
  return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
}
const star = (x, y, s) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -1 Q0.16 -0.16 1 0 Q0.16 0.16 0 1 Q-0.16 0.16 -1 0 Q-0.16 -0.16 0 -1 Z"/>`;

// Constelación (coordenadas tomadas del logo original).
const S = {
  hombroIzq: [350, 345], cabeza: [475, 292], hombroDer: [545, 365],
  cinturaDer: [497, 505], cinturaIzq: [425, 548],
  pieIzq: [345, 752], pieDer: [632, 712],
  brazoIzq: [245, 235], manoIzq: [300, 150],
  brazoDer: [762, 330], codoDer: [742, 462], manoDer: [712, 268],
};
const LINES = [
  ['manoIzq', 'brazoIzq'], ['brazoIzq', 'hombroIzq'], ['hombroIzq', 'cabeza'], ['cabeza', 'hombroDer'],
  ['hombroIzq', 'cinturaIzq'], ['hombroDer', 'cinturaDer'], ['cinturaIzq', 'cinturaDer'],
  ['cinturaIzq', 'pieIzq'], ['cinturaDer', 'pieDer'],
  ['hombroDer', 'brazoDer'], ['brazoDer', 'codoDer'], ['brazoDer', 'manoDer'],
];
const STARS = [
  ['hombroIzq', 30], ['hombroDer', 26], ['cinturaIzq', 30], ['pieDer', 28], ['pieIzq', 24],
  ['brazoIzq', 22], ['cabeza', 18], ['cinturaDer', 18], ['brazoDer', 24], ['codoDer', 20],
];

const outer = ring(16, 0, (d) => `<path d="${petal(d, 165, 432, 104)}"/>`);
const inner = ring(16, 11.25, (d) => `<path d="${petal(d, 120, 338, 90)}"/>`);
const veins = ring(16, 0, (d) => vein(d, 318, 392)) + ring(16, 11.25, (d) => vein(d, 238, 298));
const lines = LINES.map(([a, b]) => `<line x1="${S[a][0]}" y1="${S[a][1]}" x2="${S[b][0]}" y2="${S[b][1]}"/>`).join('');
const stars = STARS.map(([k, s]) => star(S[k][0], S[k][1], s * 1.35)).join('');

// Máscara: blanco = dorado visible, negro = calado. Así el isotipo funciona sobre cualquier fondo.
const isoBody = (id) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="920" height="920">
<g fill="#fff" stroke="#000" stroke-width="11" stroke-linejoin="round">${outer}${inner}</g>
<circle cx="${CX}" cy="${CY}" r="205" fill="#fff"/>
<g stroke="#000" stroke-width="9" stroke-linecap="round">${veins}</g>
<g stroke="#000" stroke-width="9" stroke-linecap="round">${lines}</g>
<g fill="#000">${stars}</g>
</mask></defs><rect x="0" y="0" width="920" height="920" fill="${GOLD}" mask="url(#${id})"/>`;

const svg = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Orión">${body}</svg>\n`;

// Nombre "ORIÓN": se reutiliza el trazado azul de vectorizar.cjs.
const traced = fs.readFileSync(tracedSvg, 'utf8');
const vbFull = traced.match(/viewBox="([^"]+)"/)[1];
const navyD = [...traced.matchAll(/<path fill="([^"]+)" fill-rule="evenodd" d="([^"]+)"/g)].find((m) => m[1] === NAVY)[2];

// El isotipo se ubica sobre el girasol original: recorte (215, 195, 345 px) del PNG escalado x4.
const ISO_PLACE = 'translate(860 780) scale(1.5333)';
const word = (c) => `<path fill="${c}" fill-rule="evenodd" d="${navyD}"/>`;
const full = (c, id) => `<g transform="${ISO_PLACE}">${isoBody(id)}</g>${word(c)}`;

fs.writeFileSync(path.join(outDir, 'isotipo-orion-v2.svg'), svg('15 15 890 890', isoBody('m')));
fs.writeFileSync(path.join(outDir, 'logo-orion-v2.svg'), svg(vbFull, full(NAVY, 'm')));
fs.writeFileSync(path.join(outDir, 'logo-orion-v2-negativo.svg'), svg(vbFull, full(IVORY, 'm')));
console.log('OK', vbFull, fs.statSync(path.join(outDir, 'isotipo-orion-v2.svg')).size, fs.statSync(path.join(outDir, 'logo-orion-v2.svg')).size);
