/**
 * Fuente única de datos del sitio.
 *
 * Todo lo marcado con TODO es información que el negocio todavía no entregó.
 * Mientras esté vacío, la landing muestra texto neutro y NO inventa datos.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface TrustItem {
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface ProductFormat {
  name: string;
  description: string;
  /** URL de la ficha técnica en PDF, si existe. */
  specSheetUrl: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

export const SITE = {
  name: 'Orión',
  legalName: 'Orión', // TODO: razón social en Chile.
  url: 'https://orionoil.cl',
  locale: 'es-CL',
  tagline: 'Aceite de girasol premium',
  title: 'Orión | Aceite de girasol premium al por mayor en Chile',
  description:
    'Orión importa y distribuye aceite de girasol premium al por mayor para empresas en Chile. Solicite su cotización.',
  // Imagen Open Graph (1200x630) generada desde src/assets/images/campo-girasoles-agricultor.jpg.
  // TODO: es una imagen generada por IA; reemplazar por una fotografía real cuando exista.
  ogImage: '/og-orion.jpg',
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Producto', href: '#producto' },
  { label: 'Cómo trabajamos', href: '#proceso' },
  { label: 'Origen', href: '#origen' },
];

export const QUOTE_ANCHOR = '#cotizacion';

/**
 * TODO: endpoint que recibirá el formulario de cotización (Formspree, API propia, etc.).
 * Mientras esté vacío, el formulario NO envía nada y lo informa al usuario.
 */
export const QUOTE_ENDPOINT: string = '';

/**
 * TODO: datos de contacto reales en Chile. Los campos vacíos no se muestran.
 * El sitio portugués usa info@orion.pt, que no coincide con el dominio: confirmar el correo definitivo.
 */
export const CONTACT: ContactInfo = {
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
};

/** TODO: redes sociales reales. Vacío = no se muestra el bloque. */
export const SOCIAL_LINKS: readonly SocialLink[] = [];

/**
 * Barra de confianza.
 * TODO: reemplazar por cifras reales (años de trayectoria, volumen anual, cobertura, etc.).
 * Hoy solo contiene hechos confirmados por el negocio, sin números.
 */
export const TRUST_ITEMS: readonly TrustItem[] = [
  { title: 'Importación directa', description: 'Sin intermediarios entre el origen y su empresa.' },
  { title: 'Venta mayorista', description: 'Atención exclusiva a empresas (B2B).' },
  { title: 'Origen europeo', description: 'Operación con base en Lisboa, Portugal.' },
  { title: 'Chile', description: 'Distribución para el mercado chileno.' },
];

export const BENEFITS: readonly Benefit[] = [
  {
    title: 'Calidad premium',
    description:
      'Trabajamos un solo producto y lo conocemos a fondo: aceite de girasol seleccionado para clientes que no transan en calidad.',
  },
  {
    title: 'Abastecimiento planificado',
    description:
      'Coordinamos cada importación según el volumen y los plazos de su operación, para que su producción no dependa de la improvisación.',
  },
  {
    title: 'Respaldo en comercio exterior',
    description:
      'Nos hacemos cargo de la importación. Usted trata con un solo interlocutor, desde la cotización hasta la entrega.',
  },
];

/**
 * TODO: formatos reales (granel, envases industriales, etc.), especificaciones y fichas técnicas.
 * Vacío = la sección muestra un texto neutro e invita a consultar por el formulario.
 */
export const PRODUCT_FORMATS: readonly ProductFormat[] = [];

/** TODO: certificaciones reales (nombre exacto). Vacío = no se muestra el bloque. */
export const CERTIFICATIONS: readonly string[] = [];

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    title: 'Cotización',
    description: 'Usted nos indica el volumen y el formato que necesita. Le respondemos con una propuesta clara.',
  },
  {
    title: 'Origen',
    description: 'Gestionamos el producto en origen conforme a lo acordado en su cotización.',
  },
  {
    title: 'Importación',
    description: 'Nos encargamos de la operación de comercio exterior hasta su llegada a Chile.',
  },
  {
    title: 'Entrega',
    description: 'Coordinamos con su equipo la entrega del producto en las condiciones pactadas.',
  },
];
