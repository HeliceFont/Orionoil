import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// El contenido es visible por defecto en el HTML. Los estados iniciales ocultos se aplican
// SOLO desde aquí, y solo si el usuario no pidió reducir el movimiento.
// Se anima únicamente transform, opacity y clip-path.

const CLIP = {
  HIDDEN: 'inset(0% 0% 100% 0%)',
  SHOWN: 'inset(0% 0% 0% 0%)',
} as const;

const DESKTOP_QUERY = '(min-width: 64rem)';

function animateHero(): void {
  const title = document.querySelector<HTMLElement>('[data-hero-title]');
  const media = document.querySelector<HTMLElement>('[data-hero-media]');
  const image = media?.querySelector('img');
  const rest = gsap.utils
    .toArray<HTMLElement>('[data-hero-copy] > *')
    .filter((element) => element !== title);

  if (media && image) {
    // Entrada con máscara y leve zoom-out.
    gsap.fromTo(media, { clipPath: CLIP.HIDDEN }, { clipPath: CLIP.SHOWN, duration: 1.4, ease: 'power3.inOut' });
    gsap.fromTo(
      image,
      { scale: 1.2, transformOrigin: '50% 0%' },
      { scale: 1.04, transformOrigin: '50% 0%', duration: 2.2, ease: 'power2.out' },
    );
    // Parallax suave al salir del hero.
    gsap.fromTo(
      media,
      { yPercent: 0 },
      {
        yPercent: 14,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true },
      },
    );
  }

  gsap.from('[data-hero-rule]', { scaleX: 0, duration: 0.9, ease: 'power2.out', delay: 0.5 });
  gsap.from(rest, { autoAlpha: 0, y: 26, duration: 0.9, ease: 'power2.out', stagger: 0.14, delay: 0.55 });

  if (title) {
    // Se oculta hasta que las fuentes cargan, para dividir en líneas con la métrica real.
    gsap.set(title, { autoAlpha: 0 });
    document.fonts.ready.then(() => {
      SplitText.create(title, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(title, { autoAlpha: 1 });
          return gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.35 });
        },
      });
    });
  }
}

function animateHeadings(): void {
  document.fonts.ready.then(() => {
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((heading) => {
      SplitText.create(heading, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.1,
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
          });
        },
      });
    });
    ScrollTrigger.refresh();
  });

  // Filete dorado que se dibuja.
  gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((rule) => {
    gsap.from(rule, {
      scaleX: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: rule, start: 'top 90%', once: true },
    });
  });
}

function animateReveals(): void {
  // Aparición de bloques sueltos.
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      autoAlpha: 0,
      y: 30,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    });
  });

  // Aparición escalonada de grupos (tarjetas, pasos, datos).
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      autoAlpha: 0,
      y: 34,
      duration: 0.85,
      ease: 'power2.out',
      stagger: 0.13,
      scrollTrigger: { trigger: group, start: 'top 84%', once: true },
    });
  });
}

function animateMedia(): void {
  // Revelado de imágenes con máscara.
  gsap.utils.toArray<HTMLElement>('[data-clip-reveal]').forEach((frame) => {
    gsap.fromTo(
      frame,
      { clipPath: CLIP.HIDDEN },
      {
        clipPath: CLIP.SHOWN,
        duration: 1.3,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: frame, start: 'top 86%', once: true },
      },
    );
  });

  // Parallax dentro del marco (el marco recorta con overflow hidden).
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;
    gsap.fromTo(
      image,
      { yPercent: -7, scale: 1.16 },
      {
        yPercent: 7,
        scale: 1.16,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function animateProcess(): void {
  const fill = document.querySelector<HTMLElement>('[data-progress-fill]');
  const steps = document.querySelector<HTMLElement>('[data-progress-steps]');
  if (!fill || !steps) return;

  const media = gsap.matchMedia();
  const scrollTrigger = { trigger: steps, start: 'top 78%', end: 'bottom 62%', scrub: 0.6 };

  // Escritorio: la línea avanza de izquierda a derecha. Móvil: de arriba hacia abajo.
  media.add(DESKTOP_QUERY, () => {
    gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, { scaleX: 1, ease: 'none', scrollTrigger });
  });
  media.add(`not all and ${DESKTOP_QUERY}`, () => {
    gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, { scaleY: 1, ease: 'none', scrollTrigger });
  });
}

function animateShowpieces(): void {
  // Barra de progreso de lectura en el header.
  gsap.to('[data-scroll-progress]', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  // Imagen que se expande hasta el ancho completo.
  gsap.utils.toArray<HTMLElement>('[data-expand]').forEach((frame) => {
    gsap.fromTo(
      frame,
      { scale: 0.8, borderRadius: '1.5rem' },
      {
        scale: 1,
        borderRadius: '0.25rem',
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 95%', end: 'top 18%', scrub: 0.5 },
      },
    );
  });

  // Manifiesto: las palabras se encienden a medida que se avanza.
  const manifesto = document.querySelector<HTMLElement>('[data-manifesto]');
  if (manifesto) {
    document.fonts.ready.then(() => {
      const split = SplitText.create(manifesto, { type: 'words' });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 48%', scrub: 0.4 },
        },
      );
    });
  }

  // Sello e indicador del hero: entran al final de la secuencia inicial.
  gsap.from('[data-hero-seal]', { autoAlpha: 0, scale: 0.7, duration: 1.2, ease: 'power3.out', delay: 1.3 });
  gsap.from('[data-hero-cue]', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power2.out', delay: 1.5 });
}

function animateConstellations(): void {
  // Orión se dibuja al entrar en pantalla: primero las líneas, después se encienden las estrellas.
  gsap.utils.toArray<SVGElement>('[data-constellation]').forEach((constellation) => {
    const lines = constellation.querySelectorAll('[data-constellation-line]');
    const stars = constellation.querySelectorAll('[data-constellation-star]');

    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap
      .timeline({ scrollTrigger: { trigger: constellation, start: 'top 80%', once: true } })
      .from(stars, { scale: 0, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.07 })
      .to(lines, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.11 }, 0.25);

    // Deriva lenta con el scroll, para dar profundidad.
    gsap.fromTo(
      constellation,
      { yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: constellation, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

function animateField(): void {
  // El campo se ve a través de la constelación de Orión (estrellas de 4 puntas y líneas),
  // que crece hasta descubrir la foto entera. La sección queda fija mientras tanto.
  const section = document.querySelector<HTMLElement>('[data-field]');
  const media = section?.querySelector<HTMLElement>('[data-field-media]');
  const image = media?.querySelector('img');
  const copy = section?.querySelector<HTMLElement>('[data-field-copy]');
  const cover = section?.querySelector<SVGElement>('[data-field-cover]');
  const lines = cover?.querySelector<SVGElement>('[data-field-lines]');
  const stars = cover ? Array.from(cover.querySelectorAll<SVGElement>('[data-field-star]')) : [];
  if (!section || !media || !image || !copy || !cover || !lines) return;

  // Ventanas de la cubierta: escala de las estrellas y grosor de las líneas.
  const WINDOW = { START_SCALE: 1, END_SCALE: 95, START_STROKE: 5, END_STROKE: 1100 } as const;
  const state: { scale: number; stroke: number } = { scale: WINDOW.START_SCALE, stroke: WINDOW.START_STROKE };
  const applyWindow = (): void => {
    stars.forEach((star) => star.setAttribute('transform', `scale(${state.scale})`));
    lines.setAttribute('stroke-width', String(state.stroke));
  };

  gsap.set(cover, { autoAlpha: 1 });

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: '+=160%', pin: true, scrub: 0.6 },
    })
    .fromTo(
      state,
      { scale: WINDOW.START_SCALE, stroke: WINDOW.START_STROKE },
      { scale: WINDOW.END_SCALE, stroke: WINDOW.END_STROKE, duration: 0.9, ease: 'power3.in', onUpdate: applyWindow },
      0,
    )
    // Red de seguridad: la cubierta se desvanece al final por si queda algún resquicio.
    .to(cover, { autoAlpha: 0, duration: 0.1 }, 0.9)
    // El zoom parte centrado en las flores, para que las ventanas muestren girasoles y no cielo.
    .fromTo(image, { scale: 1.7, transformOrigin: '50% 80%' }, { scale: 1, transformOrigin: '50% 80%', duration: 1 }, 0)
    // El velo oscuro entra recién cuando aparece el texto.
    .fromTo(media.querySelectorAll('[data-field-veil]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.62)
    .fromTo(
      copy.children,
      { autoAlpha: 0, y: 60 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' },
      0.7,
    );
}

function animateBrand(): void {
  // Giro muy lento del girasol en la marca de agua.
  gsap.to('[data-spin] [data-isotipo]', {
    rotation: 360,
    transformOrigin: '50% 50%',
    duration: 180,
    ease: 'none',
    repeat: -1,
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  animateHero();
  animateField();
  animateHeadings();
  animateReveals();
  animateMedia();
  animateProcess();
  animateBrand();
  animateShowpieces();
  animateConstellations();

  // Las imágenes diferidas cambian alturas: se recalculan los disparadores al terminar de cargar.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
