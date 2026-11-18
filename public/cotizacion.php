<?php
// Recibe el formulario de cotización de la landing y lo envía por correo a info@orionoil.cl.
// Usa mail() del hosting (Hostinger): no hay contraseñas en el repositorio.
// Responde siempre JSON; el formulario lo consume con fetch.

declare(strict_types=1);

const DESTINO = 'info@orionoil.cl';
const REMITENTE = 'info@orionoil.cl';
const MAX_CAMPO = 200;
const MAX_MENSAJE = 4000;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function responder(int $codigo, array $cuerpo): void
{
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

// Limpia un campo de una línea: sin saltos (evita inyección de cabeceras) y con largo máximo.
function campo(string $nombre, int $max = MAX_CAMPO): string
{
    $valor = trim((string) ($_POST[$nombre] ?? ''));
    $valor = preg_replace('/[\r\n\t]+/', ' ', $valor) ?? '';
    return mb_substr($valor, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// Trampa para bots: el campo "sitio" está oculto, una persona nunca lo completa.
if (campo('sitio') !== '') {
    responder(200, ['ok' => true]);
}

$empresa = campo('empresa');
$nombre = campo('nombre');
$email = campo('email');
$telefono = campo('telefono');
$volumen = campo('volumen');
$formato = campo('formato');
$mensaje = mb_substr(trim((string) ($_POST['mensaje'] ?? '')), 0, MAX_MENSAJE);

if ($empresa === '' || $nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(422, ['ok' => false, 'error' => 'invalid_fields']);
}

$lineas = [
    'Nueva solicitud de cotización desde orionoil.cl',
    '',
    "Empresa:  $empresa",
    "Nombre:   $nombre",
    "Correo:   $email",
    'Teléfono: ' . ($telefono ?: '-'),
    'Volumen:  ' . ($volumen ?: '-'),
    'Formato:  ' . ($formato ?: '-'),
    '',
    'Mensaje:',
    $mensaje ?: '-',
];

$asunto = mb_encode_mimeheader("Cotización: $empresa", 'UTF-8', 'B');
$cabeceras = implode("\r\n", [
    'From: Orión <' . REMITENTE . '>',
    "Reply-To: $email",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$enviado = mail(DESTINO, $asunto, implode("\n", $lineas), $cabeceras, '-f' . REMITENTE);

if (!$enviado) {
    responder(500, ['ok' => false, 'error' => 'send_failed']);
}

responder(200, ['ok' => true]);
