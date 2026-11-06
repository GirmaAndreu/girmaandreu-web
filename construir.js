// Genera la web completa en /publico a partir de /contenido, /diseno e /img.
// Uso: node construir.js   (sin dependencias, solo Node 18 o más)
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const SALIDA = path.join(RAIZ, 'publico');
const VERSION = new Date().toISOString().slice(0, 16).replace(/\D/g, ''); // para que el hosting no sirva CSS viejo
const leerJSON = (f) => JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido', f), 'utf8'));

const sitio = leerJSON('sitio.json');
const inicio = leerJSON('inicio.json');

// ---------- utilidades ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const enLinea = (s, R = '') => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/\[(.+?)\]\((.+?)\)/g, (_, t, u) => `<a href="${u.startsWith('/') ? R + u.slice(1) : u}">${t}</a>`)
  .replace(/\[([A-ZÁÉÍÓÚÑ0-9 ,]+)\]/g, '<span class="marcador">[$1]</span>');
const wa = (mensaje) => `https://wa.me/${sitio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
const fechaBonita = (f) => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const tri = (extra = '') => `<svg class="tri${extra}" aria-hidden="true" focusable="false"><use href="#tri"/></svg>`;
const linkWA = (mensaje, texto, clase = 'boton boton--cta', extra = '') =>
  `<a class="${clase}" href="${wa(mensaje)}" target="_blank" rel="noopener"${extra}>${esc(texto)} ${tri(' tri--der')}</a>`;
const botonPrincipal = (extra = '', mensaje = sitio.mensaje_principal) =>
  `<span class="brillo">${linkWA(mensaje, sitio.boton, 'boton boton--cta', extra)}</span>`;

// Logo: se lee del SVG trazado para pintarlo en línea (así se puede animar por piezas)
const logoSVG = fs.readFileSync(path.join(RAIZ, 'img', 'logo-ga.svg'), 'utf8');
const dG = logoSVG.match(/id="g"[^>]*d="([^"]+)"/)[1];
const dA = logoSVG.match(/id="a"[^>]*d="([^"]+)"/)[1];
const logo = (clase) => `<svg class="${clase}" viewBox="0 0 950 470" role="img" aria-label="${esc(sitio.nombre)}"><path class="logo-g" fill="currentColor" d="${dG}"/><path class="logo-a" fill="var(--brand)" fill-rule="evenodd" d="${dA}"/></svg>`;
const iconoWA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2.1 12 .1 5.5.1.1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.6c1.7 1 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.3z"/></svg>';

// ---------- markdown sencillo para el blog ----------
function markdown(texto, R) {
  let html = '', lista = null, parrafo = [];
  const cerrarP = () => { if (parrafo.length) { html += `<p>${enLinea(parrafo.join(' '), R)}</p>\n`; parrafo = []; } };
  const cerrarL = () => { if (lista) { html += `</${lista}>\n`; lista = null; } };
  for (const l of texto.split('\n')) {
    const t = l.trim();
    if (!t) { cerrarP(); cerrarL(); continue; }
    const h = t.match(/^(#{2,4})\s+(.*)$/);
    if (h) { cerrarP(); cerrarL(); html += `<h${h[1].length}>${enLinea(h[2], R)}</h${h[1].length}>\n`; continue; }
    const ul = t.match(/^[-*]\s+(.*)$/), ol = t.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      cerrarP(); const tipo = ul ? 'ul' : 'ol';
      if (lista !== tipo) { cerrarL(); html += `<${tipo}>\n`; lista = tipo; }
      html += `<li><span>${enLinea((ul || ol)[1], R)}</span></li>\n`; continue;
    }
    cerrarL(); parrafo.push(t);
  }
  cerrarP(); cerrarL();
  return html;
}

function leerPosts() {
  const dir = path.join(RAIZ, 'contenido', 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const bruto = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r/g, '');
    const m = bruto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const datos = {};
    if (m) m[1].split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) datos[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    return { ...datos, slug: f.replace(/\.md$/, ''), cuerpoMd: m ? m[2] : bruto };
  }).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

// ---------- plantilla de página ----------
const variables = Object.entries(sitio.colores).map(([k, v]) => `--${k}:${v}`).join(';');

function pagina({ titulo, descripcion, ruta, R, cuerpo, schema = [], tipo = 'website', conPortada = false }) {
  const url = sitio.url + ruta;
  const menu = sitio.menu.map((m) => `<a href="${m.enlace.startsWith('#') ? (R === './' ? '' : R) + m.enlace : R + m.enlace}">${esc(m.texto)}</a>`).join('');
  return `<!doctype html>
<html lang="${sitio.idioma}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${tipo}">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(sitio.nombre)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${sitio.url}/img/og-imagen.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${sitio.colores.bg}">
<link rel="icon" href="${R}img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${R}img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Saira:ital,wdth,wght@0,62.5..125,100..900;1,62.5..125,100..900&display=swap">
${conPortada ? `<link rel="preload" as="image" href="${R}img/girma.webp" type="image/webp">` : ''}
<style>:root{${variables}}</style>
<link rel="stylesheet" href="${R}css/estilos.css?v=${VERSION}">
<script>document.documentElement.className=document.documentElement.className.replace('no-js','js');</script>
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="gradCorte" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${sitio.colores.brand}" stop-opacity="0"/><stop offset=".25" stop-color="${sitio.colores.brand}"/>
      <stop offset=".8" stop-color="${sitio.colores.brand}"/><stop offset="1" stop-color="${sitio.colores.brand}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <symbol id="tri" viewBox="0 0 12 10"><path d="M6 0 12 10H0Z"/></symbol>
</svg>

<!-- ===== INICIO Navegación ===== -->
<header class="nav"><div class="wrap nav__in">
  <a href="${R}" aria-label="Inicio">${logo('logo')}</a>
  <nav class="nav__menu" aria-label="Principal">${menu}</nav>
  <span class="brillo"${conPortada ? ' data-hero-in' : ''}>${linkWA(sitio.mensaje_principal, sitio.boton, 'boton boton--cta boton--peq')}</span>
</div></header>
<!-- ===== FIN Navegación ===== -->

<main id="contenido">
${cuerpo}
</main>

<!-- ===== INICIO Pie ===== -->
<footer class="pie"><div class="wrap">
  <div class="pie__arriba">
    <div>${logo('pie__logo')}<p class="pie__frase display">${esc(sitio.frase_marca)}</p></div>
    <nav aria-label="Pie">${sitio.menu.map((m) => `<a href="${m.enlace.startsWith('#') ? (R === './' ? '' : R) + m.enlace : R + m.enlace}">${esc(m.texto)}</a>`).join('')}</nav>
    <div>${botonPrincipal()}</div>
  </div>
  <div class="pie__abajo">
    <span>© ${new Date().getFullYear()} ${esc(sitio.nombre)} · ${esc(sitio.profesion)} · ${esc(sitio.zona)}</span>
    <span><a href="mailto:${esc(sitio.contacto.email)}">${esc(sitio.contacto.email)}</a> · <a href="${wa(sitio.mensaje_principal)}" target="_blank" rel="noopener">${esc(sitio.contacto.whatsapp_visible)}</a></span>
  </div>
</div></footer>
<!-- ===== FIN Pie ===== -->

<div class="barra" aria-hidden="false">
  ${linkWA(sitio.mensaje_principal, sitio.boton)}
  <a class="barra__wa" href="${wa(sitio.mensaje_principal)}" target="_blank" rel="noopener" aria-label="Escríbeme por WhatsApp">${iconoWA}</a>
</div>
<script src="${R}js/main.js?v=${VERSION}" defer></script>
</body>
</html>`;
}

const cabeza = (corto, titulo) => `<div class="seccion__cabeza" data-reveal><span class="ceja">${tri()}${esc(corto)}</span><h2 class="display">${enLinea(titulo)}</h2></div>`;

// ---------- página de inicio ----------
function paginaInicio(posts) {
  const R = './';
  const p = inicio.portada, s = inicio.sobre_mi;

  const portada = `
<!-- ===== INICIO Portada ===== -->
<section class="portada"><div class="wrap"><div class="portada__grid">
  <div>
    <span class="ceja" data-hero-in>${tri()}${esc(p.ceja)}</span>
    <h1 class="titular display">${p.titular.map((l) => `<span class="linea"><span class="linea-in">${enLinea(l)}</span></span>`).join('')}</h1>
    <p class="portada__linea" data-hero-in>${esc(p.linea)}</p>
    <div class="acciones" data-hero-in>${botonPrincipal(' data-cta')}<a class="boton boton--sec" href="#precios">${esc(p.secundario)}</a></div>
    <ul class="confianza" data-hero-in>${p.confianza.map((c) => `<li>${tri()}${esc(c)}</li>`).join('')}</ul>
  </div>
  <div class="foto">
    <div class="foto__img"><picture><source srcset="${R}img/girma.webp" type="image/webp"><img src="${R}img/girma.jpg" alt="${esc(sitio.nombre)}, diseñador web y técnico SEO" width="900" height="1100" fetchpriority="high"></picture></div>
    <svg class="corte" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true" focusable="false"><line x1="-90" y1="192" x2="410" y2="-42" pathLength="100"/></svg>
    ${p.etiquetas.map((e, i) => `<span class="etiqueta etiqueta--${i + 1}" data-hero-in>${tri()}${esc(e)}</span>`).join('')}
    <span class="foto__pie" data-hero-in>${esc(p.pie_foto)}</span>
  </div>
</div></div></section>
<!-- ===== FIN Portada ===== -->`;

  const sobre = `
<!-- ===== INICIO Sobre mí ===== -->
<section class="seccion" id="sobre-mi"><div class="wrap">
  ${cabeza(s.corto, s.titulo)}
  <div class="sobre">
    <div class="sobre__texto" data-reveal>
      ${s.texto.map((t) => `<p>${enLinea(t)}</p>`).join('')}
      <ol class="creds">${s.credenciales.map((c) => `<li><span class="num">${esc(c.num)}</span><div><h3>${esc(c.titulo)}</h3><p>${esc(c.texto)}</p></div></li>`).join('')}</ol>
    </div>
    <aside class="ficha" data-reveal="2">
      <div class="ficha__cab"><img src="${R}img/girma.webp" alt="" width="64" height="64" loading="lazy"><div><strong>${esc(sitio.nombre)}</strong><span>${esc(sitio.profesion)}</span></div></div>
      <dl>${s.ficha.map((f) => `<div><dt>${esc(f.dato)}</dt><dd>${f.dato === 'Estado' ? `<span class="estado">${esc(f.valor)}</span>` : f.dato === 'Email' ? `<a href="mailto:${esc(f.valor)}">${esc(f.valor)}</a>` : esc(f.valor)}</dd></div>`).join('')}</dl>
      <div class="ficha__testimonio">${enLinea(s.testimonio)}</div>
    </aside>
  </div>
</div></section>
<!-- ===== FIN Sobre mí ===== -->`;

  const sv = inicio.servicios;
  const servicios = `
<!-- ===== INICIO Servicios ===== -->
<section class="seccion" id="servicios"><div class="wrap">
  ${cabeza(sv.corto, sv.titulo)}
  <div class="servicios">${sv.lista.map((x, i) => `
    <article class="servicio" data-reveal="${i}">
      <span class="num">${esc(x.num)}</span>
      <h3>${esc(x.nombre)}</h3>
      <p>${esc(x.frase)}</p>
      <ul class="lista-tri">${x.incluye.map((y) => `<li>${tri()}${esc(y)}</li>`).join('')}</ul>
      ${linkWA(x.mensaje, 'Pedir info por WhatsApp', 'enlace-wa')}
    </article>`).join('')}
  </div>
</div></section>
<!-- ===== FIN Servicios ===== -->`;

  const inc = inicio.incluye;
  const incluye = `
<!-- ===== INICIO Qué incluye ===== -->
<section class="seccion"><div class="wrap">
  ${cabeza(inc.corto, inc.titulo)}
  <ul class="incluye">${inc.lista.map((x, i) => `<li data-reveal="${i % 4}">${tri()}<h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></li>`).join('')}</ul>
</div></section>
<!-- ===== FIN Qué incluye ===== -->`;

  const pr = inicio.proceso;
  const proceso = `
<!-- ===== INICIO Cómo trabajo ===== -->
<section class="seccion" id="proceso"><div class="wrap">
  ${cabeza(pr.corto, pr.titulo)}
  <div class="proceso">
    <svg class="proceso__linea" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><line class="h" x1="0" y1="50" x2="100" y2="50"/><line class="v" x1="50" y1="0" x2="50" y2="100"/></svg>
    <ol class="proceso__pasos">${pr.pasos.map((x, i) => `<li class="paso" data-reveal="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></li>`).join('')}</ol>
  </div>
</div></section>
<!-- ===== FIN Cómo trabajo ===== -->`;

  const pc = inicio.precios;
  const precios = `
<!-- ===== INICIO Precios ===== -->
<section class="seccion" id="precios"><div class="wrap">
  ${cabeza(pc.corto, pc.titulo)}
  <div class="planes">${pc.planes.map((x) => `
    <div class="plan${x.destacado ? ' plan--destacado' : ''}">
      ${x.etiqueta ? `<span class="plan__etiqueta">${esc(x.etiqueta)}</span>` : ''}
      <h3>${esc(x.nombre)}</h3>
      <div class="plan__precio">${esc(x.precio)}</div><span class="plan__periodo">${esc(x.periodo)}</span>
      <ul class="lista-tri">${x.incluye.map((y) => `<li>${tri()}${esc(y)}</li>`).join('')}</ul>
      ${linkWA(`Hola Girma, me interesa ${x.nombre} de ${x.precio}${x.periodo === 'al mes' ? ' al mes' : ''}. ¿Cómo empezamos?`, sitio.boton, x.destacado ? 'boton' : 'boton boton--sec')}
    </div>`).join('')}
  </div>
  <p class="nota">${esc(pc.nota)}</p>
</div></section>
<!-- ===== FIN Precios ===== -->`;

  const bl = inicio.blog;
  const blog = posts.length ? `
<!-- ===== INICIO Blog ===== -->
<section class="seccion" id="blog"><div class="wrap">
  ${cabeza(bl.corto, bl.titulo)}
  <div class="articulos">${posts.slice(0, 3).map((x, i) => tarjeta(x, R, i)).join('')}</div>
  <div class="blog__mas"><a class="boton boton--sec" href="${R}blog/">${esc(bl.boton)} ${tri(' tri--der')}</a></div>
</div></section>
<!-- ===== FIN Blog ===== -->` : '';

  const fq = inicio.faq;
  const faq = `
<!-- ===== INICIO Preguntas ===== -->
<section class="seccion" id="preguntas"><div class="wrap faq">
  <div>${cabeza(fq.corto, fq.titulo)}${linkWA(fq.mensaje, 'Preguntar por WhatsApp', 'boton boton--sec')}</div>
  <div class="faq__lista">${fq.lista.map((x) => `<details><summary>${esc(x.pregunta)} ${tri()}</summary><p>${esc(x.respuesta)}</p></details>`).join('')}</div>
</div></section>
<!-- ===== FIN Preguntas ===== -->`;

  const ct = inicio.contacto;
  const titCt = ct.titulo.split(' ');
  const contacto = `
<!-- ===== INICIO Contacto ===== -->
<section class="seccion contacto" id="contacto">
  <svg class="corte-sep" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw><line x1="-10" y1="104" x2="110" y2="66"/></svg>
  <div class="wrap">
    <span class="ceja" data-reveal>${tri()}${esc(ct.corto)}</span>
    <h2 class="display" data-reveal>${esc(titCt.slice(0, -2).join(' '))} <em>${esc(titCt.slice(-2).join(' '))}</em></h2>
    <p data-reveal>${esc(ct.texto)}</p>
    <div data-reveal>${botonPrincipal()}</div>
    <div class="contacto__datos" data-reveal><span>${esc(ct.quita_miedo)}</span><a href="mailto:${esc(sitio.contacto.email)}"><strong>${esc(sitio.contacto.email)}</strong></a><a href="${wa(sitio.mensaje_principal)}" target="_blank" rel="noopener"><strong>${esc(sitio.contacto.whatsapp_visible)}</strong></a></div>
  </div>
</section>
<!-- ===== FIN Contacto ===== -->`;

  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'ProfessionalService',
      name: `${sitio.nombre} · ${sitio.profesion}`, description: sitio.seo.descripcion, url: sitio.url,
      image: `${sitio.url}/img/og-imagen.jpg`, logo: `${sitio.url}/img/logo-ga.svg`,
      email: sitio.contacto.email, telephone: '+' + sitio.contacto.whatsapp,
      areaServed: [{ '@type': 'City', name: 'Barcelona' }, { '@type': 'Country', name: 'España' }],
      address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
      founder: { '@type': 'Person', name: sitio.nombre, jobTitle: 'Diseñador web y técnico SEO' },
      makesOffer: inicio.precios.planes.map((x) => ({ '@type': 'Offer', name: x.nombre, price: x.precio.replace(/[^\d]/g, ''), priceCurrency: 'EUR' })),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: fq.lista.map((x) => ({ '@type': 'Question', name: x.pregunta, acceptedAnswer: { '@type': 'Answer', text: x.respuesta } })) },
  ];
  return pagina({ titulo: sitio.seo.titulo, descripcion: sitio.seo.descripcion, ruta: '/', R, conPortada: true, schema,
    cuerpo: portada + sobre + servicios + incluye + proceso + precios + blog + faq + contacto });
}

function tarjeta(x, R, i = 0) {
  return `<a class="tarjeta-blog" href="${R}blog/${x.slug}/" data-reveal="${i}"><time datetime="${x.fecha}">${fechaBonita(x.fecha)}</time><h3>${esc(x.titulo)}</h3><p>${esc(x.descripcion)}</p><span class="enlace-wa">Leer artículo ${tri(' tri--der')}</span></a>`;
}

// ---------- blog ----------
function paginaBlog(posts) {
  const R = '../';
  const cuerpo = `<div class="wrap"><div class="blog-portada"><span class="ceja">${tri()}Blog</span><h1 class="display">${enLinea(inicio.blog.titulo)}</h1></div>
<div class="articulos" style="padding-bottom:96px">${posts.map((x, i) => tarjeta(x, R, i % 3)).join('')}</div></div>`;
  return pagina({ titulo: `Blog de diseño web y SEO local | ${sitio.nombre}`, descripcion: 'Artículos prácticos para que tu negocio local aparezca en Google: diseño web, SEO local, ficha de Google y precios.', ruta: '/blog/', R, cuerpo });
}

function paginaPost(x) {
  const R = '../../';
  const cuerpo = `<div class="wrap"><article class="articulo">
  <a class="ceja" href="${R}blog/">${tri()}Blog</a>
  <h1 class="display">${esc(x.titulo)}</h1>
  <p class="articulo__meta">Por ${esc(sitio.nombre)} · <time datetime="${x.fecha}">${fechaBonita(x.fecha)}</time></p>
  <div class="texto">${markdown(x.cuerpoMd, R)}</div>
  <aside class="articulo__cta"><h2 class="display">¿Lo hacemos para tu negocio?</h2><p>${esc(inicio.contacto.texto)}</p>${botonPrincipal('', `Hola Girma, he leído tu artículo "${x.titulo}" y quiero una web para mi negocio.`)}</aside>
</article></div>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: x.titulo, description: x.descripcion, datePublished: x.fecha, dateModified: x.fecha, inLanguage: 'es', keywords: x.palabra_clave, author: { '@type': 'Person', name: sitio.nombre, url: sitio.url }, image: `${sitio.url}/img/og-imagen.jpg`, mainEntityOfPage: `${sitio.url}/blog/${x.slug}/` }];
  return pagina({ titulo: `${x.titulo} | ${sitio.nombre}`, descripcion: x.descripcion, ruta: `/blog/${x.slug}/`, R, cuerpo, schema, tipo: 'article' });
}

// ---------- escribir todo ----------
function escribir(ruta, contenido) {
  const destino = path.join(SALIDA, ruta);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
}

fs.rmSync(SALIDA, { recursive: true, force: true });
const posts = leerPosts();
escribir('index.html', paginaInicio(posts));
escribir('blog/index.html', paginaBlog(posts));
posts.forEach((x) => escribir(`blog/${x.slug}/index.html`, paginaPost(x)));
fs.mkdirSync(path.join(SALIDA, 'css'), { recursive: true });
fs.mkdirSync(path.join(SALIDA, 'js'), { recursive: true });
fs.copyFileSync(path.join(RAIZ, 'diseno', 'estilos.css'), path.join(SALIDA, 'css', 'estilos.css'));
fs.copyFileSync(path.join(RAIZ, 'diseno', 'main.js'), path.join(SALIDA, 'js', 'main.js'));
fs.cpSync(path.join(RAIZ, 'img'), path.join(SALIDA, 'img'), { recursive: true });

const hoy = new Date().toISOString().slice(0, 10);
const urls = [{ loc: '/', fecha: hoy }, { loc: '/blog/', fecha: posts[0] ? posts[0].fecha : hoy }, ...posts.map((x) => ({ loc: `/blog/${x.slug}/`, fecha: x.fecha }))];
escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${sitio.url}${u.loc}</loc><lastmod>${u.fecha}</lastmod></url>`).join('\n')}\n</urlset>\n`);
escribir('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${sitio.url}/sitemap.xml\n`);

console.log(`✓ Web generada: ${urls.length} páginas en /publico`);
