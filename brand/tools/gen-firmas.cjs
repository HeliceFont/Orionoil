// Genera las firmas de correo de Orión: las imágenes (en public/firma/, para que queden publicadas
// en https://orionoil.cl/firma/) y una página HTML con las firmas listas para copiar.
// Uso: node brand/tools/gen-firmas.cjs <carpeta-del-proyecto> <salida.html> [url-base-de-imagenes]
// Requiere `sharp` vía NODE_PATH.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const [, , projectDir, outFile, baseArg] = process.argv;
const BASE = (baseArg || 'https://orionoil.cl/firma').replace(/\/$/, '');

const COLOR = { NOCHE: '#14233B', PROFUNDO: '#0C1626', ORO: '#E8A917', BRONCE: '#7A5200', PIZARRA: '#4B5669', MARFIL: '#FAF6EC' };
// En correo no hay fuentes web: se usan equivalentes seguros.
const FONT = { DISPLAY: "Georgia, 'Times New Roman', serif", SANS: "Arial, Helvetica, sans-serif" };
const SIZE = { WIDTH: 480, LOGO_WIDTH: 168, LOGO_HEIGHT: 61, BAND_HEIGHT: 46, SCALE: 3 };

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

function constellation() {
  const lines = LINES.map(([a, b]) => `<path d="M${POINTS[a][0]} ${POINTS[a][1]} L${POINTS[b][0]} ${POINTS[b][1]}"/>`).join('');
  const stars = STARS.map(
    ([p, s, belt]) =>
      `<path transform="translate(${POINTS[p][0]} ${POINTS[p][1]}) scale(${s * 2.7})" d="${STAR_PATH}" fill="${belt ? COLOR.ORO : COLOR.MARFIL}"/>`,
  ).join('');
  return `<g fill="none" stroke="${COLOR.MARFIL}" stroke-opacity="0.7" stroke-width="5" stroke-linecap="round">${lines}</g>${stars}`;
}

// Banda Azul Noche con filete dorado, estrellas y la constelación completa a la derecha.
function bandSvg() {
  const W = SIZE.WIDTH * SIZE.SCALE, H = SIZE.BAND_HEIGHT * SIZE.SCALE;
  let seed = 11;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = Array.from({ length: 46 }, () => {
    const gold = random() > 0.8;
    return `<circle cx="${(random() * W).toFixed(0)}" cy="${(10 + random() * (H - 16)).toFixed(0)}" r="${(0.9 + random() * 1.9).toFixed(1)}" fill="${gold ? COLOR.ORO : COLOR.MARFIL}" fill-opacity="${(0.3 + random() * 0.5).toFixed(2)}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLOR.PROFUNDO}"/><stop offset="1" stop-color="${COLOR.NOCHE}"/></linearGradient>
<clipPath id="c"><rect width="${W}" height="${H}"/></clipPath></defs>
<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#g)"/>${dots}
<g opacity="0.85" transform="translate(${W - 215} -24) scale(0.21)">${constellation()}</g></g>
<rect width="${W}" height="5" fill="${COLOR.ORO}"/></svg>`;
}

// Datos legales que cierran la firma.
const LEGAL = [
  'FOGO AZUL UNIPESSOAL LDA · NIF 519297504',
  'Campo Grande, 28, 7 E, Lisboa · Freguesia de Alvalade de Lisboa',
];
const WEBSITE = { label: 'www.orionoil.cl', href: 'https://orionoil.cl' };

// Plantilla sin nombre ni número: se completan antes de copiar.
const SIGNATURES = [
  {
    id: 'plantilla',
    title: 'Firma corporativa',
    note: 'Haga clic sobre el nombre, el cargo y el teléfono para escribir los suyos, y luego copie la firma.',
    name: '[Nombre y apellido]',
    role: '[CARGO - ÁREA]',
    phone: '[Teléfono]',
  },
];

// Íconos de contacto (línea Azul Noche), como PNG porque el correo no admite SVG.
const ICONS = {
  telefono:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
};
const iconSvg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${COLOR.NOCHE}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const link = (href, label) =>
  `<a href="${href}" style="color:${COLOR.NOCHE};text-decoration:none;font-weight:bold;">${label}</a>`;

// Maquetada con tablas y estilos en línea: es lo que Gmail, Outlook y los webmail respetan.
function signatureHtml({ name, role, phone }) {
  const ICON_SIZE = 16;
  const contactRow = (icon, content) => `<tr>
                <td valign="middle" style="padding:0 9px 5px 0;"><img src="${BASE}/icono-${icon}.png" width="${ICON_SIZE}" height="${ICON_SIZE}" alt="" style="display:block;border:0;width:${ICON_SIZE}px;height:${ICON_SIZE}px;"></td>
                <td valign="middle" style="padding:0 0 5px 0;font-family:${FONT.SANS};font-size:13px;line-height:18px;color:${COLOR.PIZARRA};">${content}</td>
              </tr>`;
  return `<table cellpadding="0" cellspacing="0" border="0" width="${SIZE.WIDTH}" style="width:${SIZE.WIDTH}px;border-collapse:collapse;">
  <tr>
    <td style="padding:0 0 14px 0;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td valign="middle" style="padding:0 20px 0 0;">
            <a href="${WEBSITE.href}" style="text-decoration:none;"><img src="${BASE}/logo-orion.png" width="${SIZE.LOGO_WIDTH}" height="${SIZE.LOGO_HEIGHT}" alt="Orión" style="display:block;border:0;width:${SIZE.LOGO_WIDTH}px;height:${SIZE.LOGO_HEIGHT}px;"></a>
          </td>
          <td valign="middle" style="padding:2px 0 2px 20px;border-left:2px solid ${COLOR.ORO};">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr><td style="padding:0 0 3px 0;font-family:${FONT.DISPLAY};font-size:19px;line-height:23px;font-weight:bold;color:${COLOR.NOCHE};">${name}</td></tr>
              <tr><td style="padding:0 0 10px 0;font-family:${FONT.SANS};font-size:10px;line-height:14px;font-weight:bold;letter-spacing:1.6px;color:${COLOR.BRONCE};">${role}</td></tr>
              <tr><td>
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              ${contactRow('telefono', phone)}
              ${contactRow('web', link(WEBSITE.href, WEBSITE.label))}
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td bgcolor="${COLOR.PROFUNDO}" style="background-color:${COLOR.PROFUNDO};line-height:0;font-size:0;">
      <img src="${BASE}/banda-orion.png" width="${SIZE.WIDTH}" height="${SIZE.BAND_HEIGHT}" alt="" style="display:block;border:0;width:${SIZE.WIDTH}px;height:${SIZE.BAND_HEIGHT}px;">
    </td>
  </tr>
  <tr>
    <td style="padding:9px 0 0 0;font-family:${FONT.SANS};font-size:10px;line-height:15px;color:${COLOR.PIZARRA};"><span style="font-weight:bold;color:${COLOR.NOCHE};">${LEGAL[0]}</span><br>${LEGAL[1]}</td>
  </tr>
</table>`;
}

function pageHtml() {
  const cards = SIGNATURES.map(
    (signature) => `<section class="card">
  <h2>${signature.title}</h2>
  <p class="note">${signature.note}</p>
  <div class="signature" id="firma-${signature.id}" contenteditable="true" spellcheck="false">${signatureHtml(signature)}</div>
  <button type="button" data-copy="firma-${signature.id}">Copiar firma</button>
  <span class="status" role="status" aria-live="polite"></span>
</section>`,
  ).join('\n');

  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Firmas de correo · Orión</title>
<style>
  body { margin: 0; padding: 40px 20px 64px; background: ${COLOR.MARFIL}; color: ${COLOR.NOCHE}; font-family: Arial, Helvetica, sans-serif; line-height: 1.55; }
  main { max-width: 620px; margin: 0 auto; }
  h1 { font-family: Georgia, serif; font-size: 30px; margin: 0 0 8px; }
  h2 { font-family: Georgia, serif; font-size: 20px; margin: 0 0 4px; }
  .lead, .note { color: ${COLOR.PIZARRA}; margin: 0 0 16px; }
  .card { background: #fff; border-top: 2px solid ${COLOR.ORO}; padding: 24px; margin-top: 28px; overflow-x: auto; }
  .signature { padding: 18px; border: 1px dashed rgba(20, 35, 59, 0.3); margin-bottom: 16px; }
  .signature:focus { outline: 3px solid ${COLOR.NOCHE}; outline-offset: 2px; }
  button { background: ${COLOR.ORO}; color: ${COLOR.NOCHE}; border: 0; padding: 12px 20px; font-size: 15px; font-weight: bold; cursor: pointer; }
  button:hover { background: #C98A0B; }
  button:focus-visible { outline: 3px solid ${COLOR.NOCHE}; outline-offset: 3px; }
  .status { margin-left: 12px; font-weight: bold; color: #1E6B45; }
  ol { padding-left: 20px; }
  li { margin-bottom: 6px; }
</style>
</head>
<body>
<main>
  <h1>Firmas de correo de Orión</h1>
  <p class="lead">Edite el texto directamente sobre la firma (haga clic en el nombre o el cargo) y luego presione «Copiar firma».</p>
${cards}
  <section class="card">
    <h2>Cómo instalarla</h2>
    <ol>
      <li><strong>Gmail:</strong> Configuración → Ver toda la configuración → General → Firma → Crear nueva, y pegue.</li>
      <li><strong>Webmail de Hostinger:</strong> Configuración → Identidades → elija la casilla → Firma. Active «Firma HTML» y pegue.</li>
      <li><strong>Outlook:</strong> Archivo → Opciones → Correo → Firmas → Nueva, y pegue.</li>
    </ol>
    <p class="note">Las imágenes se cargan desde ${BASE}/, así que deben estar publicadas en el sitio para que se vean.</p>
  </section>
</main>
<script>
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var source = document.getElementById(button.dataset.copy);
      var status = button.nextElementSibling;
      var range = document.createRange();
      range.selectNodeContents(source);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
      status.textContent = copied ? 'Copiada. Péguela en su correo.' : 'Quedó seleccionada: presione Ctrl+C para copiarla.';
    });
  });
</script>
</body>
</html>
`;
}

(async () => {
  const assetsDir = path.join(projectDir, 'public/firma');
  fs.mkdirSync(assetsDir, { recursive: true });
  const logoSvg = fs.readFileSync(path.join(projectDir, 'public/logo-orion.svg'));
  await sharp(logoSvg, { density: 300 }).resize({ width: SIZE.LOGO_WIDTH * SIZE.SCALE }).png().toFile(path.join(assetsDir, 'logo-orion.png'));
  await sharp(Buffer.from(bandSvg()), { density: 300 }).resize({ width: SIZE.WIDTH * SIZE.SCALE }).png().toFile(path.join(assetsDir, 'banda-orion.png'));
  for (const [name, body] of Object.entries(ICONS)) {
    await sharp(Buffer.from(iconSvg(body)), { density: 300 }).resize({ width: 16 * SIZE.SCALE }).png().toFile(path.join(assetsDir, `icono-${name}.png`));
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, pageHtml());
  console.log('OK', outFile, 'imagenes desde', BASE);
})();
