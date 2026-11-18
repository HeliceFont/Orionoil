// Genera dos láminas: 15 logos minimalistas y 15 geométricos para Orión.
// Uso: node brand/tools/gen-logos.js <carpeta-salida>
const fs = require('fs');
const path = require('path');
const outDir = process.argv[2] || '.';

const G = '#E8A917', D = '#C98A0B', N = '#14233B', I = '#FAF6EC';

const f = (n) => Number(n.toFixed(2));
const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const star = (x, y, k, fill) => `<use href="#star" transform="translate(${x} ${y}) scale(${k})" fill="${fill}"/>`;
const diamond = (x, y, h, fill) => `<path d="M${x} ${y - h} L${x + h} ${y} L${x} ${y + h} L${x - h} ${y} Z" fill="${fill}"/>`;
const ring = (n, fn) => Array.from({ length: n }, (_, i) => fn(i, (360 / n) * i)).join('');
const polar = (r, deg) => [f(r * Math.cos((deg * Math.PI) / 180)), f(r * Math.sin((deg * Math.PI) / 180))];
const DROP = 'M0 -46 C16 -22 30 -6 30 14 A30 30 0 1 1 -30 14 C-30 -6 -16 -22 0 -46 Z';
// Constelación: Betelgeuse, Bellatrix, Alnitak, Alnilam, Mintaka, Saiph, Rigel
const C = { be: [-24, -40], bl: [20, -34], a1: [-12, 2], a2: [0, -2], a3: [12, -6], sa: [-18, 40], ri: [26, 34] };

const minimal = [
  ['Tres Marías', () => dot(-24, 11, 5, N) + dot(0, 0, 7, G) + dot(24, -11, 5, N)],
  ['Anillo y cinturón', () => `<circle r="38" fill="none" stroke="${N}" stroke-width="3"/>` + dot(-15, 7, 3.5, N) + dot(0, 0, 4.8, G) + dot(15, -7, 3.5, N)],
  ['Constelación en línea', () => `<g transform="scale(1.08)"><g fill="none" stroke="${N}" stroke-width="1.2" stroke-linejoin="round"><path d="M-24 -40 L20 -34 L12 -6 L26 34 L-18 40 L-12 2 Z"/><path d="M-12 2 L12 -6"/></g>` +
    dot(...C.be, 4.2, G) + dot(...C.bl, 3, N) + dot(...C.a1, 2.6, N) + dot(...C.a2, 2.6, N) + dot(...C.a3, 2.6, N) + dot(...C.sa, 3, N) + dot(...C.ri, 3.8, N) + '</g>'],
  ['Gota en línea', () => `<path d="${DROP}" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>` + dot(-12, 20, 3, N) + dot(0, 14, 4, G) + dot(12, 8, 3, N)],
  ['Ó con estrella', () => `<circle cx="-4" cy="8" r="30" fill="none" stroke="${N}" stroke-width="5"/>` + star(30, -32, 1.9, G)],
  ['Horizonte', () => `<line x1="-44" y1="24" x2="44" y2="24" stroke="${N}" stroke-width="3" stroke-linecap="round"/><path d="M-24 24 A24 24 0 0 1 24 24" fill="none" stroke="${G}" stroke-width="3"/>` + dot(-16, -20, 2.8, N) + dot(0, -27, 2.8, N) + dot(16, -34, 2.8, N)],
  ['Tres estrellas', () => star(-27, 14, 1.7, N) + star(0, 0, 2.5, G) + star(27, -14, 1.7, N)],
  ['Reloj en línea', () => `<path d="M-28 -40 L28 -40 L-28 40 L28 40 Z" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>` + dot(0, 0, 8, I) + dot(0, 0, 5, G)],
  ['Gota y estrella', () => `<path d="${DROP}" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>` + star(0, 14, 2.4, G)],
  ['Girasol en línea', () => `<circle r="18" fill="none" stroke="${N}" stroke-width="3"/><g stroke="${G}" stroke-width="3" stroke-linecap="round">` + ring(12, (i, a) => `<line x1="0" y1="-27" x2="0" y2="-40" transform="rotate(${a})"/>`) + '</g>' + dot(-8, 3.5, 2.2, N) + dot(0, 0, 2.2, N) + dot(8, -3.5, 2.2, N)],
  ['Anillo de puntos', () => ring(14, (i, a) => { const [x, y] = polar(38, a); return dot(x, y, 2.8, N); }) + dot(-16, 7, 4.2, G) + dot(0, 0, 5.2, G) + dot(16, -7, 4.2, G)],
  ['Órbita', () => `<ellipse rx="42" ry="16" fill="none" stroke="${N}" stroke-width="2.5" transform="rotate(-24)"/>` + dot(0, 0, 9, G) + dot(38.4, -17.1, 3.6, N)],
  ['Tilde de estrellas', () => `<circle cx="-6" cy="12" r="27" fill="none" stroke="${N}" stroke-width="5"/>` + dot(12, -27, 3.2, G) + dot(23, -35, 4, G) + dot(34, -43, 3.2, G)],
  ['Moneda nocturna', () => `<circle r="38" fill="${N}"/>` + dot(-15, 7, 3.5, I) + dot(0, 0, 4.8, G) + dot(15, -7, 3.5, I)],
  ['Estrella guía', () => `<path d="M0 -42 Q3 -6 22 -2 Q3 2 0 46 Q-3 2 -22 -2 Q-3 -6 0 -42 Z" fill="${G}"/>` + dot(-20, 14, 2.8, N) + dot(20, -18, 2.8, N)],
];

const geometric = [
  ['Reloj de triángulos', () => `<path d="M-36 -42 L36 -42 L0 -6 Z" fill="${G}"/><path d="M0 6 L36 42 L-36 42 Z" fill="${N}"/>` + diamond(-13, 4, 4, D) + diamond(0, 0, 5, D) + diamond(13, -4, 4, D)],
  ['Hexágono', () => `<polygon points="${[0, 60, 120, 180, 240, 300].map((a) => polar(44, a - 90).join(',')).join(' ')}" fill="${N}"/>` + diamond(-17, 8, 6, G) + diamond(0, 0, 8.5, G) + diamond(17, -8, 6, G)],
  ['Girasol de triángulos', () => `<g fill="${G}">` + ring(12, (i, a) => `<path d="M-8 -25 L8 -25 L0 -46 Z" transform="rotate(${a})"/>`) + '</g>' + `<circle r="20" fill="${N}"/>` + dot(-8, 3.5, 2.2, I) + dot(0, 0, 2.8, I) + dot(8, -3.5, 2.2, I)],
  ['Día y noche', () => `<g transform="rotate(-24)"><path d="M-40 0 A40 40 0 0 1 40 0 Z" fill="${G}"/><path d="M-40 0 A40 40 0 0 0 40 0 Z" fill="${N}"/>` + dot(-19, 0, 4.2, I) + dot(0, 0, 5.4, I) + dot(19, 0, 4.2, I) + '</g>'],
  ['Órbitas', () => `<g fill="none" stroke="${N}" stroke-width="2"><circle r="14"/><circle r="27"/><circle r="40"/></g>` + dot(...polar(14, -24), 4.2, G) + dot(...polar(27, 156), 4.2, G) + dot(...polar(40, -24), 4.2, G) + dot(0, 0, 3, N)],
  ['Tres rombos', () => diamond(-25, 14, 14, N) + diamond(0, 0, 14, G) + diamond(25, -14, 14, N)],
  ['O octogonal', () => ring(8, (i, a) => {
    const p = [polar(44, a - 22.5), polar(44, a + 22.5), polar(24, a + 22.5), polar(24, a - 22.5)];
    return `<polygon points="${p.map((q) => q.join(',')).join(' ')}" fill="${i % 2 ? N : G}"/>`;
  })],
  ['Gota facetada', () => `<path d="M0 -46 L26 -1 A30 30 0 1 1 -26 -1 Z" fill="${G}"/>` + `<rect x="-17" y="18" width="7.5" height="7.5" fill="${N}"/><rect x="-4.5" y="9.5" width="9" height="9" fill="${N}"/><rect x="9.5" y="2" width="7.5" height="7.5" fill="${N}"/>`],
  ['Rombo y constelación', () => diamond(0, 0, 47, N) + `<path d="M-16 -22 L16 -22 L-16 22 L16 22 Z" fill="none" stroke="${G}" stroke-width="2" stroke-linejoin="round"/>` + dot(-16, -22, 3.2, G) + dot(16, -22, 3.2, G) + dot(-16, 22, 3.2, G) + dot(16, 22, 3.2, G) + dot(0, 0, 4, I)],
  ['Sol naciente', () => `<path d="M-26 12 A26 26 0 0 1 26 12 Z" fill="${G}"/><g fill="${G}">` + [-90, -60, -30, 0, 30, 60, 90].map((a) => `<rect x="-2.5" y="-46" width="5" height="12" transform="translate(0 12) rotate(${a})"/>`).join('') + '</g>' + `<rect x="-46" y="18" width="92" height="7" fill="${N}"/>`],
  ['Círculos enlazados', () => `<circle cx="-22" cy="11" r="21" fill="${N}"/><circle cx="22" cy="-11" r="21" fill="${N}"/><circle cx="0" cy="0" r="21" fill="${G}" fill-opacity="0.92"/>`],
  ['Estrella de ocho puntas', () => `<g fill="${G}"><rect x="-31" y="-31" width="62" height="62"/><rect x="-31" y="-31" width="62" height="62" transform="rotate(45)"/></g><circle r="20" fill="${N}"/>` + dot(-9, 4, 2.4, I) + dot(0, 0, 3, I) + dot(9, -4, 2.4, I)],
  ['Dos cuencos', () => `<path d="M-34 -42 L34 -42 A34 34 0 0 1 -34 -42 Z" fill="${G}"/><path d="M-34 42 L34 42 A34 34 0 0 0 -34 42 Z" fill="${N}"/>` + dot(-12, 3, 2.8, D) + dot(0, 0, 3.4, D) + dot(12, -3, 2.8, D)],
  ['Disco radial', () => ring(16, (i, a) => {
    const [x1, y1] = polar(44, a - 11.25), [x2, y2] = polar(44, a + 11.25);
    return `<path d="M0 0 L${x1} ${y1} A44 44 0 0 1 ${x2} ${y2} Z" fill="${i % 2 ? D : G}"/>`;
  }) + `<circle r="17" fill="${N}"/>`],
  ['Facetas de Orión', () => `<g transform="scale(1.08)"><polygon points="-24,-40 20,-34 12,-6 -12,2" fill="${G}"/><polygon points="-12,2 12,-6 26,34 -18,40" fill="${N}"/>` + dot(-12, 2, 3.2, I) + dot(0, -2, 3.2, I) + dot(12, -6, 3.2, I) + '</g>'],
];

function sheet(title, prefix, items) {
  const COLS = 5, CW = 230, CH = 226, MX = 30, MY = 70;
  const W = MX * 2 + COLS * CW, H = MY + 30 + Math.ceil(items.length / COLS) * CH;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Orión — ${title}</title>
<defs><path id="star" d="M0 -7 Q1.4 -1.4 7 0 Q1.4 1.4 0 7 Q-1.4 1.4 -7 0 Q-1.4 -1.4 0 -7 Z"/></defs>
<rect width="${W}" height="${H}" fill="#F1EAD9"/>
<text x="${MX + 8}" y="44" font-family="Inter, 'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="${N}">${title.toUpperCase()}</text>
`;
  items.forEach(([label, draw], i) => {
    const x0 = MX + CW * (i % COLS), y0 = MY + CH * Math.floor(i / COLS);
    const cx = x0 + CW / 2, cy = y0 + 72;
    const n = prefix + String(i + 1).padStart(2, '0');
    s += `<rect x="${x0 + 8}" y="${y0 + 6}" width="${CW - 16}" height="${CH - 14}" rx="10" fill="${I}"/>\n`;
    s += `<g transform="translate(${cx} ${cy})">${draw()}</g>\n`;
    s += `<text x="${cx + 3}" y="${cy + 84}" text-anchor="middle" font-family="Fraunces, Georgia, 'Times New Roman', serif" font-size="24" font-weight="600" letter-spacing="6" fill="${N}">ORIÓN</text>\n`;
    s += `<text x="${cx}" y="${cy + 116}" text-anchor="middle" font-family="Inter, 'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#4B5669"><tspan font-weight="700" fill="${N}">${n}</tspan> · ${label}</text>\n`;
  });
  return s + '</svg>\n';
}

fs.writeFileSync(path.join(outDir, 'logo-minimalistas.svg'), sheet('15 logos minimalistas', 'M', minimal), 'utf8');
fs.writeFileSync(path.join(outDir, 'logo-geometricos.svg'), sheet('15 logos geométricos', 'G', geometric), 'utf8');
console.log(`OK ${minimal.length} minimalistas + ${geometric.length} geométricos -> ${outDir}`);
