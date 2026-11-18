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

function animateBrand(): void {
  // Las tres estrellas titilan de forma sutil.
  gsap.to('[data-estrella]', {
    opacity: 0.35,
    duration: 1.6,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.45, from: 'random' },
  });

  // Giro muy lento de la corona del girasol en la marca de agua.
  gsap.to('[data-spin] [data-corona]', {
    rotation: 360,
    svgOrigin: '70 70',
    duration: 180,
    ease: 'none',
    repeat: -1,
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  animateHero();
  animateHeadings();
  animateReveals();
  animateMedia();
  animateProcess();
  animateBrand();

  // Las imágenes diferidas cambian alturas: se recalculan los disparadores al terminar de cargar.
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
