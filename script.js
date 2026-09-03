/* ============================================================
   Hermanos Jota — Script principal
   ============================================================ */
/* ---------- Fade-in al hacer scroll (IntersectionObserver) ---------- */
const observador = new IntersectionObserver(
    (entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
            } else {
                entrada.target.classList.remove('visible');
            }
        });
    },
    {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    }
);

const elementosFade = document.querySelectorAll('.fade-in');
let ultimaPosicionScroll = window.scrollY;
let ultimaMarcaScroll = performance.now();
let frameVelocidadPendiente = false;
let reinicioDuracionPendiente;

function actualizarDuracionFade() {
    const ahora = performance.now();
    const posicionActual = window.scrollY;
    const tiempoTranscurrido = Math.max(ahora - ultimaMarcaScroll, 16);
    const velocidadScroll = Math.abs(posicionActual - ultimaPosicionScroll) / tiempoTranscurrido * 1000;
    const intensidad = Math.min(velocidadScroll / 2400, 1);
    const duracion = 1.8 - (intensidad * 1.45);

    elementosFade.forEach((elemento) => {
        const duracionBase = elemento.classList.contains('footer') ? 0.9 : 1.8;
        const duracionAcelerada = Math.max(duracionBase * 0.35, duracion * (duracionBase / 1.8));
        elemento.style.setProperty('--fade-active-duration', `${duracionAcelerada.toFixed(2)}s`);
    });

    ultimaPosicionScroll = posicionActual;
    ultimaMarcaScroll = ahora;
    frameVelocidadPendiente = false;

    window.clearTimeout(reinicioDuracionPendiente);
    reinicioDuracionPendiente = window.setTimeout(() => {
        elementosFade.forEach((elemento) => {
            elemento.style.setProperty('--fade-active-duration', 'var(--fade-duration)');
        });
    }, 180);
}

window.addEventListener('scroll', () => {
    if (!frameVelocidadPendiente) {
        frameVelocidadPendiente = true;
        window.requestAnimationFrame(actualizarDuracionFade);
    }
}, { passive: true });

elementosFade.forEach((elemento) => {
    observador.observe(elemento);
});

const buscadorProductos = document.querySelector('#busqueda');
const tarjetasCatalogo = document.querySelectorAll('.catalogo-collage__tarjeta');

if (buscadorProductos && tarjetasCatalogo.length) {
    const normalizarTexto = (texto) => texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const mensajeSinResultados = document.createElement('p');
    mensajeSinResultados.className = 'catalogo__sin-resultados';
    mensajeSinResultados.textContent = 'No encontramos productos con ese nombre.';
    mensajeSinResultados.hidden = true;
    buscadorProductos.closest('.buscador').after(mensajeSinResultados);

    buscadorProductos.addEventListener('input', () => {
        const consulta = normalizarTexto(buscadorProductos.value.trim());
        let productosVisibles = 0;

        tarjetasCatalogo.forEach((tarjeta) => {
            const nombre = normalizarTexto(tarjeta.getAttribute('aria-label'));
            const coincide = nombre.includes(consulta);
            tarjeta.hidden = !coincide;
            productosVisibles += coincide ? 1 : 0;
        });

        mensajeSinResultados.hidden = productosVisibles > 0;
    });
}