// Vectoriza el logo de Orión (v2) separando dorado y azul, y traza cada capa con potrace.
// La capa dorada usa un umbral ADAPTATIVO: además de "es dorado", descarta los píxeles
// mucho más claros que su entorno, para conservar las estrellas y las líneas finas de la
// constelación sin comerse los pétalos de dorado pálido.
//
// Uso: node brand/tools/vectorizar.js <entrada.png> <carpeta-salida> [delta] [sigma]
// Requiere: npm i sharp potrace (en una carpeta temporal, no en el proyecto).
const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');

const [, , input, outDir, deltaArg, sigmaArg] = process.argv;
const SCALE = 4;
const DELTA = Number(deltaArg ?? 26); // cuánto más claro que el entorno cuenta como "hueco"
const SIGMA = Number(sigmaArg ?? 7) * SCALE; // radio del entorno, en px de la imagen original
const GOLD = '#E8A917';
const NAVY = '#14233B';

function trace(buffer, opts) {
  return new Promise((resolve, reject) => {
    const t = new potrace.Potrace(opts);
    t.loadImage(buffer, (err) => (err ? reject(err) : resolve(t.getPathTag().match(/ d="([^"]+)"/)[1])));
  });
}

(async () => {
  const meta = await sharp(input).metadata();
  const { data, info } = await sharp(input)
    .flatten({ background: '#ffffff' })
    .resize({ width: meta.width * SCALE, kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const N = W * H;

  // "Doradez" de cada píxel: r - b (0 en blanco y en azul, ~170 en dorado pleno).
  const goldness = Buffer.alloc(N);
  for (let p = 0, i = 0; p < N; p++, i += C) goldness[p] = Math.max(0, Math.min(255, data[i] - data[i + 2]));
  const local = await sharp(goldness, { raw: { width: W, height: H, channels: 1 } }).blur(SIGMA).raw().toBuffer();

  const gold = Buffer.alloc(N, 255);
  const navy = Buffer.alloc(N, 255);
  const box = { gold: [W, H, 0, 0], navy: [W, H, 0, 0] };
  const grow = (b, x, y) => { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x, i = p * C;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const d = goldness[p];
      if (d > 60 && d > local[p] - DELTA) { gold[p] = 0; grow(box.gold, x, y); }
      else if (b - r > 12 && lum < 150) { navy[p] = 0; grow(box.navy, x, y); }
    }
  }

  const png = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const [goldPng, navyPng] = await Promise.all([png(gold), png(navy)]);

  const common = { threshold: 128, optTolerance: 0.8, alphaMax: 1.25 };
  const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(parseFloat(n))));
  const goldD = round(await trace(goldPng, { ...common, turdSize: 140 }));
  const navyD = round(await trace(navyPng, { ...common, turdSize: 160 }));

  const pad = 6 * SCALE;
  const all = [
    Math.min(box.gold[0], box.navy[0]) - pad, Math.min(box.gold[1], box.navy[1]) - pad,
    Math.max(box.gold[2], box.navy[2]) + pad, Math.max(box.gold[3], box.navy[3]) + pad,
  ];
  const vb = (b) => `${b[0]} ${b[1]} ${b[2] - b[0]} ${b[3] - b[1]}`;
  const side = Math.max(box.gold[2] - box.gold[0], box.gold[3] - box.gold[1]) + pad * 2;
  const cx = (box.gold[0] + box.gold[2]) / 2, cy = (box.gold[1] + box.gold[3]) / 2;
  const iso = [Math.round(cx - side / 2), Math.round(cy - side / 2), Math.round(cx + side / 2), Math.round(cy + side / 2)];

  const svg = (viewBox, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Orión">${body}</svg>\n`;
  const g = `<path fill="${GOLD}" fill-rule="evenodd" d="${goldD}"/>`;
  const n = (c) => `<path fill="${c}" fill-rule="evenodd" d="${navyD}"/>`;
  fs.writeFileSync(path.join(outDir, 'logo-orion-v2.svg'), svg(vb(all), g + n(NAVY)));
  fs.writeFileSync(path.join(outDir, 'logo-orion-v2-negativo.svg'), svg(vb(all), g + n('#FAF6EC')));
  fs.writeFileSync(path.join(outDir, 'isotipo-orion-v2.svg'), svg(vb(iso), g));

  console.log(JSON.stringify({ viewBoxFull: vb(all), viewBoxIso: vb(iso), goldBytes: goldD.length, navyBytes: navyD.length, DELTA, SIGMA }));
})().catch((e) => { console.error(e); process.exit(1); });
