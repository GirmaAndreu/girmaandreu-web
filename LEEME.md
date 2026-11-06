# Web de Girma Andreu · LEEME

## Qué es cada carpeta

| Carpeta / archivo | Qué contiene | ¿La tocas? |
|---|---|---|
| `contenido/sitio.json` | Nombre, colores, SEO general, WhatsApp, email, menú, texto del botón | Sí |
| `contenido/inicio.json` | Todos los textos de la página de inicio, sección por sección | Sí |
| `contenido/blog/*.md` | Un archivo por artículo. El nombre del archivo es la URL | Sí |
| `img/` | Foto, logo, favicon, imagen para compartir | A veces |
| `diseno/estilos.css` | El diseño (colores de apoyo, letras, formas) | Casi nunca |
| `diseno/main.js` | El movimiento | Casi nunca |
| `construir.js` | El "motor" que genera la web | No |
| `publico/` | La web final. Se crea sola al construir | No |

## Cómo hacer cambios

**Lo normal: pídeselo a Claude.** Por ejemplo:
- "Escribe un artículo para posicionar 'diseño web Terrassa'"
- "Cambia el precio del plan Esencial a 450 €"
- "Añade mi Instagram al pie"

**A mano:** abre el archivo de `contenido/`, cambia el texto entre comillas y guarda. En los titulares, `*palabra*` pinta esa palabra en lima. Un texto entre corchetes y en mayúsculas, como `[TESTIMONIO REAL DE CLIENTE]`, sale en amarillo para que no se publique sin rellenar.

Para ver los cambios en tu ordenador: `node construir.js` y abre `publico/index.html`.

## Añadir un artículo al blog

Crea `contenido/blog/diseno-web-terrassa.md`:

```
---
titulo: Título que saldrá en Google (unos 60 caracteres)
descripcion: Frase de 140-160 caracteres que saldrá debajo en Google
fecha: 2026-11-20
palabra_clave: diseño web terrassa
---

Texto. **Negrita**, [enlace a precios](/#precios).

## Subtítulo

- Punto de lista
1. Paso numerado
```

Aparece solo en la portada (los 3 más recientes), en `/blog/` y en el sitemap.

## Publicar en Vercel (una sola vez)

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: Add New → Project → elige el repositorio → Deploy. La configuración ya está en `vercel.json`.
3. Settings → Domains → añade tu dominio y sigue los pasos de DNS (los registros que le dicen a internet dónde vive tu web).
4. Cambia `url` en `contenido/sitio.json` por tu dominio real.
5. En Google Search Console, añade el dominio y envía `https://tudominio.com/sitemap.xml`.

Cada cambio que se guarde en GitHub se publica solo en 1-2 minutos. El CSS y el JS llevan un `?v=` nuevo en cada construcción para que nadie vea la versión vieja guardada en caché (la copia que guarda el navegador).

## SEO que ya viene hecho

- Título y descripción por página, URL canónica (la dirección "oficial" de cada página)
- Sitemap y robots.txt automáticos
- Datos estructurados para Google: servicio profesional, preguntas frecuentes y cada artículo
- Imagen y textos para compartir en WhatsApp y redes (Open Graph)
- Favicon e icono para iPhone
- Web estática y sin librerías: carga muy rápido
- Foto en WebP (formato de imagen ligero) con respaldo en JPG

---

## Dirección de arte aprobada: "El corte"

La línea lima que cruza el logo GA es el gesto de toda la web: abre la portada, recorta la foto, une los pasos, separa el cierre y arma el logo del pie.

**Colores** (en `sitio.json`):
| Papel | HEX | Uso |
|---|---|---|
| Fondo | `#0A0A0B` | Toda la web |
| Principal y acción | `#DEFC31` | Botón, corte, palabra clave, plan destacado |
| Texto del botón | `#0A0A0B` | Sobre lima (contraste muy alto, cumple AA) |
| Titulares | `#F4F4F1` | Blanco de la G |
| Texto secundario | `#A3A3AB` | Sobre el fondo, cumple AA |
| Tarjetas | `#141416` / `#1C1C1F` | Superficies |
| Marcador pendiente | `#FFD84D` | Solo para datos que faltan |

**Letras:** Saira (Google Fonts), cursiva, grosor 800, ancho 75 %, en mayúsculas para titulares. Inter 400-700 para textos.

**Formas:** botones en paralelogramo con lados cortados (14 px), tarjetas con esquina cortada (22 px), triángulo de la A como viñeta y flecha, números en contorno lima.

**Movimiento** (ficha): rápido, afilado, preciso. Sin rebote.
- Curva de entrada `cubic-bezier(.16,1,.3,1)`, cortinas `cubic-bezier(.87,0,.13,1)`
- Duración base 0,8 s, recorrido 40 px, escalonado 0,06 s
- Firma (portada, unos 1,6 s): el corte se dibuja → la foto se abre siguiendo la diagonal → el titular sube por renglones → textos y botones → el triángulo del botón aparece con un destello. Un toque la salta. Rescate a los 4 s si algo falla.
- Rima: separador del contacto, línea del proceso y logo del pie que se arma.
- Etiquetas de la foto: flotan despacio (7-9,5 s).
- Con "Reducir movimiento" todo se ve quieto; sin JavaScript todo se ve completo.
- Nivel ligero: sin GSAP ni Lenis, todo con Web Animations API e IntersectionObserver.

**Estructura:** tomada de la referencia de Alex Morgan (saludo personal, foto con etiquetas, sobre mí con ficha, servicios, qué incluye, proceso, contacto). Sin barras de porcentaje, sin testimonios ni proyectos inventados.

---

## De dónde sale cada dato (6 de noviembre de 2026)

- WhatsApp +34 683 104 004, email, foto, logo, colores y precios: los dio Girma en el chat.
- ESERP y Metacom: confirmado por Girma que se pueden nombrar.
- Zona "Barcelona": confirmada por Girma.
- Textos de las secciones y los 3 artículos: escritos por Claude, revisar.

## Por validar (lo decidió Claude)

1. Titular "Hola, soy Girma." (opción 1 de las tres propuestas).
2. Sin librerías de animación: carga más rápida, sin scroll "suave".
3. Foto en blanco y negro con la diagonal del logo.
4. Saira para titulares e Inter para textos.
5. Logo redibujado en vector a partir del PNG (`img/logo-ga.svg`). Compáralo con el original.
6. "Te respondo en menos de 24 horas" en el proceso y en el contacto: publícalo solo si lo vas a cumplir.
7. "Acepto nuevos proyectos" en la ficha.
8. Textos de "Qué incluye": el dominio se paga aparte y el hosting está incluido.
9. Los 3 artículos del blog, escritos por Claude.
10. El brillo lima solo en el corte y en los botones.

## Pendientes

- [ ] `[TESTIMONIO REAL DE CLIENTE]` en Sobre mí (sale en amarillo).
- [ ] Dominio: cambiar `url` en `sitio.json` (ahora es `https://www.girmaandreu.com` de ejemplo).
- [ ] 2onBike como trabajo, cuando esté rehecha (añadir sección de trabajos).
- [ ] Redes (Instagram, LinkedIn), si quieres que salgan.
- [ ] Revisar la web en tu móvil: las capturas de Claude salieron con una letra sustituta.
