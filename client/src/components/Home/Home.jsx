import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from './FeaturedCarousel';

/**
 * Componente Home
 * Migración fidedigna de la página de inicio legacy (Sprint 01-02).
 * Incluye:
 * 1. Hero con video institucional de fondo y control interactivo de audio.
 * 2. Sección Nuestra Esencia (Artesanía, Sustentabilidad, Diseño Atemporal).
 * 3. Sección Piezas Destacadas (muestra productos destacados del catálogo).
 * 4. Sección Comunidad & Redes Sociales (Publicación interactiva de Instagram).
 * 5. Sección Compromiso — Programa Herencia Viva (Métricas sustentables).
 *
 * @param {Object} props
 * @param {Array} [props.products] - Array de productos del catálogo (se filtran los destacados)
 * @param {boolean} [props.loading] - Estado de carga de productos
 * @param {string|null} [props.error] - Estado de error de productos
 */
function Home({ products = [], loading = false, error = null }) {
  // Referencias para el video del Hero y la sección Hero
  const heroVideoRef = useRef(null);
  const heroSectionRef = useRef(null);

  // Estado del audio del video del Hero
  const [isAudioActive, setIsAudioActive] = useState(false);
  const userWantsSoundRef = useRef(false);

  // Estados interactivos para la Card de Instagram
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Filtrar productos destacados (featured: true)
  const featuredProducts = products.filter((prod) => prod.featured);

  // Manejo del toggle de audio en el Hero
  const toggleHeroAudio = () => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (video.muted) {
      userWantsSoundRef.current = true;
      video.muted = false;
      video
        .play()
        .then(() => {
          setIsAudioActive(true);
        })
        .catch((err) => {
          console.warn('Error al activar audio del video:', err);
        });
    } else {
      userWantsSoundRef.current = false;
      video.muted = true;
      setIsAudioActive(false);
    }
  };

  // Efecto para mutear automáticamente cuando el Hero sale de pantalla
  useEffect(() => {
    const video = heroVideoRef.current;
    const heroSection = heroSectionRef.current;
    if (!video || !heroSection || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (userWantsSoundRef.current) {
              video.muted = false;
              video.play().catch(() => {});
              setIsAudioActive(true);
            }
          } else {
            video.muted = true;
            setIsAudioActive(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(heroSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* ========== 1. HERO ========== */}
      <section className="hero" id="hero" ref={heroSectionRef}>
        <video
          ref={heroVideoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            src="/assets/videos/Video institucional Hermanos Jota.mp4"
            type="video/mp4"
          />
          Tu navegador no soporta la reproducción de video HTML5.
        </video>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1 className="hero-title">Redescubrí el arte de vivir</h1>
          <p className="hero-subtitle">
            Muebles artesanales que honran la tradición y abrazan el futuro.
            Madera noble, diseño atemporal, compromiso sustentable.
          </p>
          <Link to="/productos" className="btn btn-primary">
            Explorar colección
          </Link>
        </div>

        {/* Botón flotante para el audio del Hero */}
        <button
          id="video-volume-toggle"
          type="button"
          className={`hero-volume-btn ${isAudioActive ? 'is-unmuted' : ''}`}
          aria-label={
            isAudioActive
              ? 'Silenciar sonido del video'
              : 'Activar sonido del video'
          }
          aria-pressed={isAudioActive}
          onClick={toggleHeroAudio}
        >
          <span className="hero-volume-icon" aria-hidden="true">
            {/* Ícono Muted / Sin sonido */}
            <svg
              className="icon-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            {/* Ícono Sound / Con sonido */}
            <svg
              className="icon-sound"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </span>
          <span className="hero-volume-text">Audio</span>
        </button>

        <a
          href="#essence"
          className="hero-scroll"
          aria-label="Descubrir más sobre Hermanos Jota"
        >
          <span>Descubrí más</span>
          <span className="hero-scroll-line" aria-hidden="true"></span>
        </a>
      </section>

      {/* ========== 2. ESENCIA DE MARCA ========== */}
      <section className="essence" id="essence" aria-labelledby="essence-title">
        <div className="essence-ambient-glow" aria-hidden="true" />

        <div className="container">
          <header className="essence-header fade-in visible">
            <div className="essence-badge-wrapper">
              <span className="essence-badge">
                <svg
                  className="essence-badge-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  width="13"
                  height="13"
                >
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
                </svg>
                · Hermanos Jota ·
              </span>
            </div>

            <h2 id="essence-title" className="section-title essence-title">
              Nuestra <span className="title-accent">Esencia</span>
            </h2>

            <p className="section-intro essence-subtitle">
              Cada pieza cuenta la historia de manos expertas, maderas vivas y
              un diálogo honesto entre tradición e innovación contemporánea.
            </p>
          </header>

          <div className="essence-grid">
            <article className="essence-card fade-in visible fade-in-delay-1">
              <span className="essence-card-accent" aria-hidden="true"></span>
              <div className="essence-card-header">
                <div
                  className="essence-icon-box essence-icon-box--artesania"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="22"
                    height="22"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
              </div>
              <span className="essence-card-tag">Oficio Tradicional</span>
              <h3>Artesanía & Precisión</h3>
              <p>
                Técnicas heredadas de generaciones se encuentran con la
                precisión contemporánea en cada unión, cada curva y cada
                ensamble sin tornillos a la vista.
              </p>
              <div className="essence-card-pill">
                <span>Encastres manuales · Cepillado fino</span>
              </div>
            </article>

            <article className="essence-card fade-in visible fade-in-delay-2">
              <span className="essence-card-accent" aria-hidden="true"></span>
              <div className="essence-card-header">
                <div
                  className="essence-icon-box essence-icon-box--sustentabilidad"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="22"
                    height="22"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
              </div>
              <span className="essence-card-tag">Compromiso Vivo</span>
              <h3>Sustentabilidad</h3>
              <p>
                Maderas de bosques argentinos gestionados con certificación
                FSC®, acabados a base de aceites vegetales orgánicos y huella
                mínima en cada etapa del taller.
              </p>
              <div className="essence-card-pill">
                <span>100% FSC® · Aceite natural sin COV</span>
              </div>
            </article>

            <article className="essence-card fade-in visible fade-in-delay-3">
              <span className="essence-card-accent" aria-hidden="true"></span>
              <div className="essence-card-header">
                <div
                  className="essence-icon-box essence-icon-box--diseno"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="22"
                    height="22"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
              </div>
              <span className="essence-card-tag">Líneas 1960–2026</span>
              <h3>Diseño Atemporal</h3>
              <p>
                Inspirados en el optimismo y la solidez del mid-century modern,
                diseñamos piezas que trascienden modas efímeras y envejecen con
                la gracia de lo auténtico.
              </p>
              <div className="essence-card-pill">
                <span>Proporción armónica · Durabilidad</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ========== 3. PRODUCTOS DESTACADOS ========== */}
      <section
        className="featured-products"
        id="featured-products"
        aria-labelledby="featured-title"
      >
        {/* Iluminación ambiental cálida de fondo */}
        <div className="featured-ambient-glow" aria-hidden="true" />

        <div className="container">
          {/* Encabezado Profesional con Jerarquía y Curaduría */}
          <header className="featured-header fade-in visible">
            <div className="featured-header-main">
              <h2 id="featured-title" className="section-title featured-title">
                Piezas <span className="featured-title-accent">Destacadas</span>
              </h2>

              {/* Pilares de valor comercial y artesanal */}
              <div className="featured-highlights-list" role="list">
                <div className="featured-highlight-item" role="listitem">
                  <svg
                    className="featured-highlight-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Garantía estructural de 5 años</span>
                </div>

                <div className="featured-highlight-item" role="listitem">
                  <svg
                    className="featured-highlight-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span>Hasta 3 cuotas fijas sin interés</span>
                </div>

                <div className="featured-highlight-item" role="listitem">
                  <svg
                    className="featured-highlight-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Maderas 100% certificadas FSC®</span>
                </div>
              </div>
            </div>

            {/* Acceso rápido a colección completa en desktop */}
            <div className="featured-header-action">
              <Link to="/productos" className="featured-quick-link">
                <span>Ver catálogo completo</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  width="16"
                  height="16"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Carrusel de Productos Destacados (INTACTO) */}
          <div className="featured-carousel-wrapper">
            <FeaturedCarousel
              products={
                featuredProducts.length > 0
                  ? featuredProducts
                  : products.slice(0, 4)
              }
              loading={loading}
              error={error}
            />
          </div>

          {/* Cierre de sección: Bloque de confianza y CTA comercial */}
          <footer className="featured-footer fade-in visible">
            <div className="featured-guarantee-card">
              <div className="featured-guarantee-content">
                <div className="featured-guarantee-stamp" aria-hidden="true">
                  <img
                    src="/assets/logo.svg"
                    alt="Logo de Mueblería Hermanos Jota"
                    className="ig-card__avatar"
                  />
                  <div className="featured-stamp-text">
                    <strong>Oficio & Calidad</strong>
                    <span>Taller Colegiales · CABA</span>
                  </div>
                </div>
                <p className="featured-guarantee-desc">
                  Producimos cada serie con maderas nobles seleccionadas por
                  veta y densidad. Encastres de ebanistería oculta, terminación
                  a mano y embalaje acolchado para envíos seguros a todo el
                  país.
                </p>
              </div>

              <div className="featured-cta-container">
                <Link
                  to="/productos"
                  className="btn btn-primary featured-main-cta"
                >
                  <span>Ver toda la colección</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    width="16"
                    height="16"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </section>

      {/* ========== 4. COMUNIDAD & REDES SOCIALES ========== */}
      <section
        className="redes-sociales"
        id="redes"
        aria-labelledby="titulo-redes"
      >
        <div className="container">
          <div className="redes-layout">
            <div className="redes-info fade-in visible">
              <span className="redes-badge">Comunidad & Experiencias</span>
              <h2 id="titulo-redes" className="section-title">
                Hermanos Jota en tu hogar
              </h2>
              <p className="section-intro">
                Nos apasiona ver cómo nuestras piezas cobran vida en los
                espacios de quienes nos eligen. Seguinos para inspirarte con
                proyectos de diseño de interiores, procesos en el taller y
                nuevas colecciones.
              </p>
              <div className="redes-cta-group">
                <a
                  href="https://instagram.com/hermanosjota_ba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  aria-label="Seguir a Hermanos Jota en Instagram"
                >
                  Seguir en @hermanosjota_ba
                </a>
              </div>
            </div>

            <div className="redes-card-wrapper fade-in visible fade-in-delay-2">
              <article className="ig-card">
                {/* Header de la publicación */}
                <header className="ig-card__header">
                  <img
                    src="/assets/logo.svg"
                    alt="Logo de Mueblería Hermanos Jota"
                    className="ig-card__avatar"
                  />
                  <div className="ig-card__usuario">
                    <span className="ig-card__username">
                      muebleria_hnos_jota
                    </span>
                    <span className="ig-card__location">
                      Buenos Aires, Argentina
                    </span>
                  </div>
                  <a
                    href="https://instagram.com/hermanosjota_ba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ig-card__follow-link"
                  >
                    Seguir
                  </a>
                </header>

                {/* Media (Video de la publicidad) */}
                <div className="ig-card__media">
                  <video
                    className="ig-card__video"
                    autoPlay
                    muted
                    controls
                    loop
                    playsInline
                    poster="/assets/logo.svg"
                  >
                    <source
                      src="/assets/videos/publicidad IG.mp4"
                      type="video/mp4"
                    />
                    Tu navegador no soporta la reproducción de este video.
                  </video>
                </div>

                {/* Barra de acciones */}
                <div className="ig-card__actions">
                  <div className="ig-card__actions-left">
                    <button
                      type="button"
                      className="ig-card__action-btn"
                      aria-label={isLiked ? 'Ya no me gusta' : 'Me gusta'}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill={isLiked ? '#e74c3c' : 'none'}
                        stroke={isLiked ? '#e74c3c' : 'currentColor'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ig-card__action-btn"
                      aria-label="Comentar"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ig-card__action-btn"
                      aria-label="Compartir"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="ig-card__action-btn"
                    aria-label={isSaved ? 'Quitar de guardados' : 'Guardar'}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill={isSaved ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                </div>

                {/* Detalle y leyenda */}
                <div className="ig-card__body">
                  <p className="ig-card__likes">
                    {isLiked ? '12.386 Me gusta' : '12.385 Me gusta'}
                  </p>
                  <p className="ig-card__caption">
                    <span className="ig-card__user-bold">
                      muebleria_hnos_jota
                    </span>{' '}
                    ¡Renová tu hogar con estilo! ✨ Descubrí nuestra nueva
                    colección de muebles artesanales.🏠
                    <br />
                    <br />
                    ¡Gracias @carolo_!
                  </p>
                  <p className="ig-card__hashtags">
                    #muebles #artesanal #diseñodeinteriores #hogar #sustentable
                  </p>
                  <time className="ig-card__time" dateTime="2026-08-28">
                    HACE 2 DÍAS
                  </time>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. COMPROMISO — HERENCIA VIVA ========== */}
      <section className="commitment" id="commitment">
        <div className="container">
          <h2 className="section-title fade-in visible">
            Programa Herencia Viva
          </h2>
          <p className="section-intro fade-in visible">
            Nuestro compromiso va más allá de la venta
          </p>

          <div className="commitment-grid">
            <div className="commitment-stat fade-in visible fade-in-delay-1">
              <span className="stat-number">10</span>
              <span className="stat-label">años de garantía en estructura</span>
            </div>
            <div className="commitment-stat fade-in visible fade-in-delay-2">
              <span className="stat-number">30%</span>
              <span className="stat-label">
                materiales recuperados o reciclados
              </span>
            </div>
            <div className="commitment-stat fade-in visible fade-in-delay-3">
              <span className="stat-number">FSC®</span>
              <span className="stat-label">
                certificación en todas nuestras maderas
              </span>
            </div>
            <div className="commitment-stat fade-in visible fade-in-delay-4">
              <span className="stat-number">0</span>
              <span className="stat-label">plásticos de un solo uso</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
