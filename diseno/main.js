/* =========================================================
   Girma Andreu · Movimiento "El corte"
   Sin librerías: todo con lo que trae el navegador.
   Si este archivo falla, la web se ve completa y quieta.
   ========================================================= */
(() => {
  'use strict';
  // 1. Ayudantes, banderas y tokens de movimiento
  const d = document, html = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (fn) => { try { return fn(); } catch (e) { console.warn('[web]', e); } };
  const puedeAnimar = 'animate' in Element.prototype && 'IntersectionObserver' in window;
  if (!puedeAnimar) { html.classList.remove('js'); }

  const M = { ease: 'cubic-bezier(.16,1,.3,1)', easeIO: 'cubic-bezier(.87,0,.13,1)', dur: 800, stagger: 60, dist: 40 };
  const FOTO_FIN = 'polygon(0 30%,80% 0,100% 0,100% 100%,0 100%)';
  const FOTO_INI = 'polygon(0 30%,80% 0,80% 0,0 30%,0 30%)';

  // 2. Lo que funciona siempre: borde del menú y barra fija del móvil
  safe(() => {
    const nav = $('.nav');
    const barra = $('.barra');
    const portada = $('.portada');
    const contacto = $('#contacto');
    const pie = $('.pie');
    let pasoPortada = false, enContacto = false;
    const pintar = () => { if (barra) barra.classList.toggle('visible', pasoPortada && !enContacto); };
    addEventListener('scroll', () => nav && nav.classList.toggle('con-borde', scrollY > 8), { passive: true });
    if (!('IntersectionObserver' in window)) { if (barra) barra.classList.add('visible'); return; }
    if (portada) new IntersectionObserver(([e]) => { pasoPortada = !e.isIntersecting; pintar(); }).observe(portada);
    else { pasoPortada = true; }
    const zonas = [contacto, pie].filter(Boolean);
    const vistas = new Set();
    if (zonas.length) new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? vistas.add(e.target) : vistas.delete(e.target)));
      enContacto = vistas.size > 0; pintar();
    }).observe(zonas[0]);
    if (zonas[1]) new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? vistas.add(e.target) : vistas.delete(e.target)));
      enContacto = vistas.size > 0; pintar();
    }).observe(zonas[1]);
    pintar();
  });

  if (!puedeAnimar || RM) return; // con "Reducir movimiento" todo queda visible y quieto

  // 3. La firma: el corte cruza la portada, abre la foto, sube el titular y termina en el botón
  function firmaPortada() {
    const anims = [];
    const go = (el, kf, opt) => { if (el) anims.push(el.animate(kf, { fill: 'both', easing: M.ease, ...opt })); };
    go($('.corte line'), [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 650, easing: M.easeIO });
    go($('.foto__img'), [{ clipPath: FOTO_INI }, { clipPath: FOTO_FIN }], { duration: 1000, delay: 250, easing: M.easeIO });
    go($('.foto__img img'), [{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 1400, delay: 250 });
    $$('.titular .linea-in').forEach((el, i) => go(el, [{ transform: 'translate(-.12em,115%)' }, { transform: 'none' }], { duration: M.dur * 1.15, delay: 300 + i * M.stagger * 1.5 }));
    $$('[data-hero-in]').forEach((el, i) => go(el, [{ opacity: 0, transform: `translateY(${M.dist * 0.5}px)` }, { opacity: 1, transform: 'none' }], { duration: M.dur, delay: 520 + i * M.stagger }));
    const flecha = $('[data-cta] .tri');
    go(flecha, [{ transform: 'rotate(90deg) scale(0)' }, { transform: 'rotate(90deg) scale(1.4)', offset: 0.6 }, { transform: 'rotate(90deg) scale(1)' }], { duration: 500, delay: 1150, fill: 'backwards' });
    const cta = $('[data-cta]');
    if (cta) anims.push(cta.parentElement.animate([
      { filter: 'drop-shadow(0 0 0 rgba(222,252,49,0))' },
      { filter: 'drop-shadow(0 0 22px rgba(222,252,49,.6))', offset: 0.4 },
      { filter: 'drop-shadow(0 0 0 rgba(222,252,49,0))' },
    ], { duration: 1100, delay: 1150, easing: 'ease-out' }));
    // Las etiquetas empiezan a flotar cuando termina la entrada
    setTimeout(() => $$('.etiqueta').forEach((e) => e.classList.add('flota')), 1700);
    // Un toque salta la entrada
    d.addEventListener('pointerdown', () => anims.forEach((a) => safe(() => a.finish())), { once: true });
    return anims;
  }

  // 4. Revelados al bajar: el estado oculto lo pone este archivo, así que si falla todo se ve
  safe(() => {
    const els = $$('[data-reveal]');
    els.forEach((el) => el.classList.add('por-revelar'));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const i = Number(el.dataset.reveal) || 0;
      setTimeout(() => { el.classList.add('revelado'); el.classList.remove('por-revelar'); }, i * M.stagger);
      io.unobserve(el);
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io.observe(el));
  });

  // 5. El corte se dibuja al llegar (separadores, proceso y pie)
  safe(() => {
    const lineas = $$('[data-draw] line');
    lineas.forEach((l) => { l.setAttribute('pathLength', '100'); l.style.strokeDasharray = '100'; l.style.strokeDashoffset = '100'; });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('line', e.target).forEach((l) => {
        l.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 1100, easing: M.easeIO, fill: 'forwards' })
          .finished.then(() => { l.style.strokeDashoffset = '0'; }).catch(() => {});
      });
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -15% 0px' });
    $$('[data-draw]').forEach((s) => io.observe(s));
  });

  // 6. El logo del pie se arma: la G entra por la izquierda y el lima corta desde la derecha
  safe(() => {
    const logo = $('.pie__logo');
    if (!logo) return;
    const g = $('.logo-g', logo), a = $('.logo-a', logo);
    if (!g || !a) return;
    g.style.opacity = '0'; a.style.opacity = '0';
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      g.animate([{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], { duration: M.dur, easing: M.ease, fill: 'forwards' });
      a.animate([{ opacity: 1, clipPath: 'inset(0 0 0 100%)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: 900, delay: 180, easing: M.easeIO, fill: 'forwards' });
      o.disconnect();
    }, { threshold: 0.5 }).observe(logo);
  });

  // 7. Arranque de la portada, cuando están las letras (con tope de tiempo)
  safe(() => {
    if (!$('.portada')) return;
    Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))])
      .then(() => safe(firmaPortada));
  });
})();
