// Genera el membrete de Orión como .docx (tamaño Carta) con los elementos de la marca:
// logotipo, sello circular, constelación de Orión como marca de agua y pie en Azul Noche.
// Uso: node brand/tools/gen-membrete.cjs <carpeta-del-proyecto> <salida.docx>
// Requiere los paquetes `docx` y `sharp` (vía NODE_PATH; no son dependencias del sitio).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType, BorderStyle, TabStopType,
  ExternalHyperlink, PageNumber, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType,
} = require('docx');

const [, , projectDir, outFile] = process.argv;

const COLOR = { NOCHE: '14233B', PROFUNDO: '0C1626', ORO: 'E8A917', BRONCE: '7A5200', PIZARRA: '4B5669', MARFIL: 'FAF6EC' };
const FONT = { DISPLAY: 'Fraunces', SANS: 'Inter' };

// Carta: 8,5 x 11 pulgadas. 1440 DXA = 1 pulgada = 96 px = 914400 EMU.
const INCH = { DXA: 1440, PX: 96, EMU: 914400 };
const PAGE = { WIDTH_IN: 8.5, HEIGHT_IN: 11, MARGIN_X_IN: 0.9 };
const CONTENT_WIDTH = (PAGE.WIDTH_IN - PAGE.MARGIN_X_IN * 2) * INCH.DXA;
const BAND_HEIGHT_IN = 1.2;
const SEAL_SIZE_IN = 1.02;
const emu = (inches) => Math.round(inches * INCH.EMU);
const px = (inches) => Math.round(inches * INCH.PX);

// ── Constelación (mismas coordenadas que el isotipo) ──
const POINTS = {
  hombroIzq: [350, 345], cabeza: [475, 292], hombroDer: [545, 365], cinturaDer: [497, 505],
  cinturaMedio: [461, 527], cinturaIzq: [425, 548], pieIzq: [345, 752], pieDer: [632, 712],
  brazoIzq: [245, 235], manoIzq: [300, 150], brazoDer: [762, 330], codoDer: [742, 462], manoDer: [712, 268],
};
const LINES = [
  ['manoIzq', 'brazoIzq'], ['brazoIzq', 'hombroIzq'], ['hombroIzq', 'cabeza'], ['cabeza', 'hombroDer'],
  ['hombroIzq', 'cinturaIzq'], ['hombroDer', 'cinturaDer'], ['cinturaIzq', 'cinturaDer'],
  ['cinturaIzq', 'pieIzq'], ['cinturaDer', 'pieDer'], ['hombroDer', 'brazoDer'], ['brazoDer', 'manoDer'],
  ['brazoDer', 'codoDer'],
];
const STARS = [
  ['hombroIzq', 17], ['hombroDer', 15], ['cabeza', 10], ['cinturaIzq', 14, true], ['cinturaMedio', 14, true],
  ['cinturaDer', 14, true], ['pieIzq', 15], ['pieDer', 18], ['brazoIzq', 10], ['manoIzq', 8], ['brazoDer', 11],
  ['codoDer', 8], ['manoDer', 8],
];
const STAR_PATH = 'M0 -1 Q0.14 -0.14 1 0 Q0.14 0.14 0 1 Q-0.14 0.14 -1 0 Q-0.14 -0.14 0 -1 Z';

function constellation({ line, star, belt, lineWidth = 1.6, lineOpacity = 1 }) {
  const lines = LINES.map(([a, b]) => `<path d="M${POINTS[a][0]} ${POINTS[a][1]} L${POINTS[b][0]} ${POINTS[b][1]}"/>`).join('');
  const stars = STARS.map(
    ([p, s, isBelt]) =>
      `<path transform="translate(${POINTS[p][0]} ${POINTS[p][1]}) scale(${s})" d="${STAR_PATH}" fill="${isBelt ? belt : star}"/>`,
  ).join('');
  return `<g fill="none" stroke="${line}" stroke-opacity="${lineOpacity}" stroke-width="${lineWidth}" stroke-linecap="round">${lines}</g>${stars}`;
}

const render = (svg, width) => sharp(Buffer.from(svg), { density: 300 }).resize({ width }).png().toBuffer();

// Marca de agua: constelación dorada muy tenue.
const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="200 110 610 690"><g opacity="0.2">${constellation({
  line: '#C98A0B', star: '#C98A0B', belt: '#E8A917', lineWidth: 2.2,
})}</g></svg>`;

// Sello: disco Azul Noche con texto en anillo y el isotipo al centro (como el del hero de la web).
function sealSvg(isotypeSvg) {
  const TEXT = 'ACEITE DE GIRASOL PREMIUM · ORIÓN · ';
  const step = 360 / TEXT.length;
  const ring = [...TEXT]
    .map((char, i) => `<text transform="rotate(${(i * step).toFixed(2)} 100 100) translate(100 27)" text-anchor="middle">${char}</text>`)
    .join('');
  const isotype = isotypeSvg.replace('<svg ', '<svg x="59" y="59" width="82" height="82" ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="98.5" fill="#0C1626" stroke="#E8A917" stroke-width="1.6"/>
<circle cx="100" cy="100" r="58" fill="none" stroke="#E8A917" stroke-opacity="0.45" stroke-width="0.8"/>
<g fill="#FAF6EC" font-family="Segoe UI, Arial, sans-serif" font-size="12.4" font-weight="700">${ring}</g>
${isotype}</svg>`;
}

// Pie: banda Azul Noche a todo el ancho, con filete dorado, estrellas y la constelación.
function bandSvg() {
  const W = 2550, H = Math.round(BAND_HEIGHT_IN * 300);
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = Array.from({ length: 70 }, () => {
    const gold = random() > 0.82;
    return `<circle cx="${(random() * W).toFixed(0)}" cy="${(14 + random() * (H - 20)).toFixed(0)}" r="${(1.2 + random() * 2.4).toFixed(1)}" fill="${gold ? '#E8A917' : '#FAF6EC'}" fill-opacity="${(0.25 + random() * 0.5).toFixed(2)}"/>`;
  }).join('');
  // Constelación asomando por la derecha, recortada por la banda.
  const orion = `<g transform="translate(1560 -150) scale(1.05)">${constellation({
    line: '#FAF6EC', star: '#FAF6EC', belt: '#E8A917', lineWidth: 2, lineOpacity: 0.5,
  })}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0C1626"/><stop offset="1" stop-color="#14233B"/></linearGradient>
<clipPath id="c"><rect width="${W}" height="${H}"/></clipPath></defs>
<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#g)"/>${dots}<g opacity="0.3">${orion}</g></g>
<rect width="${W}" height="9" fill="#E8A917"/></svg>`;
}

const floating = (xIn, yIn) => ({
  horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: emu(xIn) },
  verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: emu(yIn) },
  wrap: { type: TextWrappingType.NONE },
  behindDocument: true,
  allowOverlap: true,
});

const sans = (text, opts = {}) => new TextRun({ text, font: FONT.SANS, size: 21, color: COLOR.NOCHE, ...opts });
const display = (text, opts = {}) => new TextRun({ text, font: FONT.DISPLAY, color: COLOR.NOCHE, ...opts });
const body = (text) => new Paragraph({ spacing: { after: 200, line: 330 }, children: [sans(text)] });
const gap = (after) => new Paragraph({ spacing: { after }, children: [] });
const eyebrow = (text) =>
  new Paragraph({
    spacing: { after: 110 },
    children: [sans(text, { size: 14, bold: true, color: COLOR.BRONCE, characterSpacing: 46 })],
  });

(async () => {
  const read = (file) => fs.readFileSync(path.join(projectDir, file), 'utf8');
  const [logo, seal, watermark, band] = await Promise.all([
    render(read('public/logo-orion.svg'), 1100),
    render(sealSvg(read('public/isotipo-orion.svg')), 700),
    render(watermarkSvg, 1300),
    render(bandSvg(), 2550),
  ]);

  const LOGO_WIDTH = 212;
  const WATERMARK_WIDTH_IN = 4.1;
  const image = (data, widthPx, heightPx, name, extra = {}) =>
    new ImageRun({ type: 'png', data, transformation: { width: widthPx, height: heightPx }, altText: { title: name, description: name, name }, ...extra });

  const header = new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR.ORO, space: 14 } },
        children: [
          image(logo, LOGO_WIDTH, Math.round((LOGO_WIDTH * 1343) / 3719), 'Logotipo de Orión'),
          // Sello, arriba a la derecha.
          image(seal, px(SEAL_SIZE_IN), px(SEAL_SIZE_IN), 'Sello de Orión', {
            floating: { ...floating(PAGE.WIDTH_IN - PAGE.MARGIN_X_IN - SEAL_SIZE_IN, 0.3), behindDocument: false },
          }),
          // Marca de agua: va en el encabezado para repetirse en todas las páginas.
          image(watermark, px(WATERMARK_WIDTH_IN), px((WATERMARK_WIDTH_IN * 690) / 610), 'Constelación de Orión', {
            floating: floating(PAGE.WIDTH_IN - WATERMARK_WIDTH_IN - 0.35, 4.55),
          }),
        ],
      }),
    ],
  });

  const footerText = (text, opts = {}) => new TextRun({ text, font: FONT.SANS, size: 16, color: COLOR.MARFIL, ...opts });
  const link = (label, href) =>
    new ExternalHyperlink({ link: href, children: [footerText(label, { color: COLOR.ORO, bold: true })] });

  const footer = new Footer({
    children: [
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        spacing: { after: 50 },
        children: [
          image(band, px(PAGE.WIDTH_IN), px(BAND_HEIGHT_IN), 'Pie de página', {
            floating: floating(0, PAGE.HEIGHT_IN - BAND_HEIGHT_IN),
          }),
          display('Orión', { size: 24, bold: true, color: COLOR.MARFIL }),
          footerText('\t'),
          link('info@orionoil.cl', 'mailto:info@orionoil.cl'),
          footerText('   ·   ', { color: COLOR.ORO }),
          link('orionoil.cl', 'https://orionoil.cl'),
        ],
      }),
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
        children: [
          footerText('Importación y distribución mayorista de aceite de girasol para empresas en Chile'),
          footerText('\tPágina '),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT.SANS, size: 16, color: COLOR.MARFIL }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: 'Orión',
    title: 'Membrete Orión',
    description: 'Plantilla de carta con membrete de Orión',
    styles: { default: { document: { run: { font: FONT.SANS, size: 21, color: COLOR.NOCHE } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.WIDTH_IN * INCH.DXA, height: PAGE.HEIGHT_IN * INCH.DXA },
            margin: {
              top: 2500,
              bottom: 2250,
              left: PAGE.MARGIN_X_IN * INCH.DXA,
              right: PAGE.MARGIN_X_IN * INCH.DXA,
              header: 640,
              footer: 520,
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 460 },
            children: [sans('Santiago, [día] de [mes] de [año]', { color: COLOR.PIZARRA })],
          }),
          eyebrow('DESTINATARIO'),
          new Paragraph({ spacing: { after: 40 }, children: [display('[Nombre del destinatario]', { size: 26, bold: true })] }),
          new Paragraph({ spacing: { after: 40 }, children: [sans('[Cargo]')] }),
          new Paragraph({ spacing: { after: 460 }, children: [sans('[Empresa]')] }),
          eyebrow('ASUNTO'),
          new Paragraph({
            spacing: { after: 360 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.ORO, space: 12 } },
            children: [display('[Asunto de la carta]', { size: 40, bold: true })],
          }),
          body('Estimado/a [nombre]:'),
          body(
            '[Escriba aquí el texto de la carta. Este párrafo ya tiene la tipografía, el color y el interlineado de la marca: basta con reemplazarlo.]',
          ),
          body('[Segundo párrafo.]'),
          gap(220),
          body('Atentamente,'),
          gap(500),
          new Paragraph({ spacing: { after: 40 }, children: [display('[Nombre y apellido]', { size: 28, bold: true })] }),
          new Paragraph({ children: [sans('[Cargo]  ·  Orión', { color: COLOR.BRONCE, size: 17, bold: true, characterSpacing: 20 })] }),
        ],
      },
    ],
  });

  fs.writeFileSync(outFile, await Packer.toBuffer(doc));
  console.log('OK', outFile, fs.statSync(outFile).size);
})();
