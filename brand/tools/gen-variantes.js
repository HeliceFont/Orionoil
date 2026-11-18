// Genera la lámina de 15 variantes del emblema de Orión.
// Uso: node gen-variantes.js <ruta-salida.svg>
const fs = require('fs');
const out = process.argv[2];

const GOLD = '#E8A917', NAVY = '#14233B', IVORY = '#FAF6EC', BRONZE = '#7A5200', DEEP = '#0C1626';

const schemes = {
  navy:  { bg: NAVY,      line: GOLD, name: IVORY, tag: GOLD,   core: DEEP,     onBg: IVORY, edge: null },
  black: { bg: '#0E1116', line: GOLD, name: IVORY, tag: GOLD,   core: '#000000', onBg: IVORY, edge: null },
  ivory: { bg: IVORY,     line: NAVY, name: NAVY,  tag: BRONZE, core: NAVY,     onBg: NAVY,  edge: NAVY, petal: '#C98A0B' },
  gold:  { bg: GOLD,      line: NAVY, name: NAVY,  tag: NAVY,   core: NAVY,     onBg: NAVY,  edge: null },
};

const STARS = [[-24, -40, 1.05, true], [20, -34, 0.7], [-12, 2, 0.6], [0, -2, 0.6], [12, -6, 0.6], [-18, 40, 0.7], [26, 34, 0.95]];

function constellation(lineColor, starColor, hiColor, lw) {
  let s = `<g fill="none" stroke="${lineColor}" stroke-width="${lw}" stroke-linejoin="round" opacity="0.85">` +
    `<path d="M-24 -40 L20 -34 L12 -6 L26 34 L-18 40 L-12 2 Z"/><path d="M-12 2 L12 -6"/></g>`;
  for (const [x, y, k, hi] of STARS) {
    s += `<use href="#star" transform="translate(${x} ${y}) scale(${k})" fill="${hi ? hiColor : starColor}"/>`;
  }
  return s;
}

function ring(n, fn) {
  let s = '';
  for (let i = 0; i < n; i++) s += fn(i, (360 / n) * i);
  return s;
}

function petals(kind, color) {
  const p16 = 'M0 -100 C11 -90 11 -76 0 -66 C-11 -76 -11 -90 0 -100 Z';
  const p24 = 'M0 -101 C8 -90 8 -75 0 -65 C-8 -75 -8 -90 0 -101 Z';
  switch (kind) {
    case 'outline16': return `<g fill="none" stroke="${color}" stroke-width="0.9">` + ring(16, (i, a) => `<path d="${p16}" transform="rotate(${a})"/>`) + '</g>';
    case 'outline24': return `<g fill="none" stroke="${color}" stroke-width="0.9">` + ring(24, (i, a) => `<path d="${p24}" transform="rotate(${a})"/>`) + '</g>';
    case 'solid16': return `<g fill="${color}">` + ring(16, (i, a) => `<path d="${p16}" transform="rotate(${a})"/>`) + '</g>';
    case 'rays': return `<g stroke="${color}" stroke-width="0.9" stroke-linecap="round">` + ring(60, (i, a) => `<line x1="0" y1="${i % 2 ? -78 : -68}" x2="0" y2="-101" transform="rotate(${a})"/>`) + '</g>';
    case 'dots': return `<g fill="${color}">` +
      ring(24, (i, a) => `<circle cx="0" cy="-72" r="1.3" transform="rotate(${a})"/>`) +
      ring(24, (i, a) => `<circle cx="0" cy="-85" r="1.7" transform="rotate(${a + 7.5})"/>`) +
      ring(24, (i, a) => `<circle cx="0" cy="-98" r="2.1" transform="rotate(${a})"/>`) + '</g>';
    default: return '';
  }
}

function base(shape, sc) {
  let s = '';
  if (shape === 'octagon') {
    const pts = (R) => Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`;
    }).join(' ');
    s += `<polygon points="${pts(160)}" fill="${sc.bg}"${sc.edge ? ` stroke="${sc.edge}" stroke-width="2.5"` : ''}/>`;
    s += `<polygon points="${pts(153)}" fill="none" stroke="${sc.line}" stroke-width="1.4"/>`;
  } else if (shape === 'scallop') {
    s += `<g fill="${sc.edge || sc.bg}">` + ring(36, (i, a) => `<circle cx="0" cy="-147" r="10" transform="rotate(${a})"/>`) + `<circle r="149"/></g>`;
    if (sc.edge) s += `<circle r="146" fill="${sc.bg}"/>`;
    s += `<circle r="140" fill="none" stroke="${sc.line}" stroke-width="1.4"/>`;
  } else {
    s += `<circle r="150" fill="${sc.bg}"${sc.edge ? ` stroke="${sc.edge}" stroke-width="3"` : ''}/>`;
    s += `<circle r="143" fill="none" stroke="${sc.line}" stroke-width="1.5"/>`;
  }
  return s;
}

function arcName(sc) {
  return `<text font-family="Fraunces, Georgia, 'Times New Roman', serif" font-size="27" font-weight="600" letter-spacing="9" fill="${sc.name}" text-anchor="middle"><textPath href="#arcoSup" startOffset="50%">ORIÓN</textPath></text>`;
}
function arcTag(sc) {
  return `<text font-family="Inter, 'Helvetica Neue', Arial, sans-serif" font-size="10.5" font-weight="600" letter-spacing="3.4" fill="${sc.tag}" text-anchor="middle"><textPath href="#arcoInf" startOffset="50%">ACEITE DE GIRASOL PREMIUM</textPath></text>`;
}
function sideStars(sc) {
  return `<g fill="${sc.tag}"><use href="#star" transform="translate(-125 0) scale(0.9)"/><use href="#star" transform="translate(125 0) scale(0.9)"/></g>`;
}

function emblem(v) {
  const sc = schemes[v.scheme];
  const petalColor = sc.petal || sc.line;
  let s = base(v.shape, sc);
  if (v.layout === 'arcs') {
    s += `<circle r="109" fill="none" stroke="${sc.line}" stroke-width="0.6"/>`;
    s += arcName(sc) + arcTag(sc) + sideStars(sc);
    s += petals(v.petals, petalColor);
    s += `<circle r="58" fill="${sc.core}"/><circle r="58" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;
    s += constellation(GOLD, IVORY, GOLD, 0.9);
  } else if (v.layout === 'big') {
    s += arcName(sc) + arcTag(sc) + sideStars(sc);
    s += `<circle r="106" fill="${sc.core}"/><circle r="106" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;
    s += `<g transform="scale(1.8)">` + constellation(GOLD, IVORY, GOLD, 0.6) + `</g>`;
  } else if (v.layout === 'word') {
    s += `<circle r="109" fill="none" stroke="${sc.line}" stroke-width="0.6" opacity="0"/>`;
    s += arcTag(sc);
    s += `<g transform="translate(0 -60) scale(0.95)">` + constellation(sc.line === NAVY ? '#C98A0B' : GOLD, sc.onBg, sc.line === NAVY ? '#C98A0B' : GOLD, 0.95) + `</g>`;
    s += `<text x="4" y="42" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-size="48" font-weight="600" letter-spacing="8" fill="${sc.name}" text-anchor="middle">ORIÓN</text>`;
    s += `<g stroke="${sc.tag}" stroke-width="0.8"><line x1="-80" y1="62" x2="-14" y2="62"/><line x1="14" y1="62" x2="80" y2="62"/></g>`;
    s += `<use href="#star" transform="translate(0 62) scale(0.8)" fill="${sc.tag}"/>`;
    if (v.petals) s += `<g opacity="0.5">` + petals(v.petals, petalColor) + `</g>`;
  }
  return s;
}

const variants = [
  { label: 'Sello clásico',        scheme: 'navy',  shape: 'circle',  layout: 'arcs', petals: 'outline16' },
  { label: 'Cielo abierto',        scheme: 'navy',  shape: 'circle',  layout: 'big' },
  { label: 'Rayos de sol',         scheme: 'navy',  shape: 'circle',  layout: 'arcs', petals: 'rays' },
  { label: 'Semillas',             scheme: 'navy',  shape: 'circle',  layout: 'arcs', petals: 'dots' },
  { label: 'Girasol pleno',        scheme: 'navy',  shape: 'circle',  layout: 'arcs', petals: 'solid16' },
  { label: 'Marfil clásico',       scheme: 'ivory', shape: 'circle',  layout: 'arcs', petals: 'outline16' },
  { label: 'Marfil cielo abierto', scheme: 'ivory', shape: 'circle',  layout: 'big' },
  { label: 'Negro y oro',          scheme: 'black', shape: 'circle',  layout: 'arcs', petals: 'outline24' },
  { label: 'Oro invertido',        scheme: 'gold',  shape: 'circle',  layout: 'arcs', petals: 'outline16' },
  { label: 'Octógono',             scheme: 'navy',  shape: 'octagon', layout: 'big' },
  { label: 'Octógono solar',       scheme: 'black', shape: 'octagon', layout: 'arcs', petals: 'rays' },
  { label: 'Nombre al centro',     scheme: 'navy',  shape: 'circle',  layout: 'word' },
  { label: 'Marfil con nombre',    scheme: 'ivory', shape: 'circle',  layout: 'word' },
  { label: 'Sello dentado',        scheme: 'navy',  shape: 'scallop', layout: 'arcs', petals: 'solid16' },
  { label: 'Dentado con nombre',   scheme: 'black', shape: 'scallop', layout: 'word' },
];

const COLS = 5, CW = 230, CH = 260, MX = 30, MY = 30, K = 0.58;
const W = MX * 2 + COLS * CW, H = MY * 2 + Math.ceil(variants.length / COLS) * CH;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Orión — 15 variantes del emblema</title>
<defs>
<path id="star" d="M0 -7 Q1.4 -1.4 7 0 Q1.4 1.4 0 7 Q-1.4 1.4 -7 0 Q-1.4 -1.4 0 -7 Z"/>
<path id="arcoSup" d="M-117 0 A117 117 0 0 1 117 0"/>
<path id="arcoInf" d="M-131 0 A131 131 0 0 0 131 0"/>
</defs>
<rect width="${W}" height="${H}" fill="#F1EAD9"/>
`;
variants.forEach((v, i) => {
  const cx = MX + CW * (i % COLS) + CW / 2;
  const cy = MY + CH * Math.floor(i / COLS) + 108;
  const n = String(i + 1).padStart(2, '0');
  svg += `<g transform="translate(${cx} ${cy}) scale(${K})">${emblem(v)}</g>\n`;
  svg += `<text x="${cx}" y="${cy + 122}" text-anchor="middle" font-family="Inter, 'Helvetica Neue', Arial, sans-serif" font-size="13" fill="#14233B"><tspan font-weight="700">${n}</tspan> · ${v.label}</text>\n`;
});
svg += '</svg>\n';
fs.writeFileSync(out, svg, 'utf8');
console.log(`OK ${variants.length} variantes -> ${out} (${W}x${H})`);
