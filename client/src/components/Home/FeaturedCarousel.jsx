import React, { useState, useRef, useEffect, useCallback } from 'react';
import ProductCard from '../ProductCard/ProductCard';

/**
 * Componente FeaturedCarousel (Piezas Destacadas Responsivo)
 *
 * Comportamiento adaptable y sin cortes de tarjetas:
 * - Desktop (>= 992px): Muestra 4 tarjetas completas que ocupan exactamente el ancho del contenedor.
 * - Tablet grande (768px - 991px): Muestra 3 tarjetas completas.
 * - Tablet / Móvil ancho (480px - 767px): Muestra 2 tarjetas completas.
 * - Móvil (< 480px): Muestra 1 tarjeta completa.
 *
 * Regla de activación del carrusel:
 * - El carrusel interactivo y automático SOLO se activa si la cantidad de productos
 *   excede el límite visible para el tamaño de pantalla actual (`products.length > visibleCount`).
 * - Si entran todos los productos (ej. 4 productos en pantalla de 4), se muestran completos
 *   en grilla estática sin flechas ni desplazamiento innecesario.
 * - Si exceden el límite, se activa el carrusel infinito paso a paso: siempre aterrizando en
 *   tarjetas completas alineadas de borde a borde, sin cortes laterales.
 *
 * @param {Object} props
 * @param {Array} props.products - Lista de productos destacados
 * @param {boolean} [props.loading] - Estado de carga
 * @param {string|null} [props.error] - Estado de error
 * @param {boolean} [props.autoPlay=true] - Habilitar avance automático cuando hay overflow
 * @param {number} [props.autoPlayInterval=3800] - Intervalo en ms para autoplay
 */
function FeaturedCarousel({
  products = [],
  loading = false,
  error = null,
  autoPlay = true,
  autoPlayInterval = 3800,
}) {
  const containerRef = useRef(null);
  const isSlidingRef = useRef(false);

  const n = products.length;

  // Medición reactiva del ancho disponible del contenedor
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      } else if (typeof window !== 'undefined' && window.innerWidth > 0) {
        // Descontar padding aproximado del contenedor si clientWidth aún no está listo
        const padding = window.innerWidth >= 1024 ? 80 : 32;
        setContainerWidth(Math.min(1200, window.innerWidth) - padding);
      }
    };
    measure();

    let ro;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(containerRef.current);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, []);

  // Cálculo exacto de cuántas tarjetas completas caben según el ancho disponible
  const getVisibleCount = (width) => {
    if (width >= 960) return 4;
    if (width >= 720) return 3;
    if (width >= 480) return 2;
    return 1;
  };

  const visibleCount = getVisibleCount(containerWidth);
  const gap = containerWidth < 720 ? 16 : 24;

  // Ancho exacto para que visibleCount tarjetas llenen el 100% del contenedor sin sobrante ni corte
  const cardWidth = containerWidth > 0
    ? Math.floor((containerWidth - (visibleCount - 1) * gap) / visibleCount)
    : 280;

  // El carrusel solo se activa si los productos exceden el límite visible
  const hasOverflow = n > visibleCount;

  // Triplicamos la lista para crear un bucle infinito continuo [Set 0, Set 1 (original), Set 2]
  const extendedProducts = hasOverflow ? [...products, ...products, ...products] : products;

  // Iniciar centrado en el Set 1 (los originales)
  const [currentIndex, setCurrentIndex] = useState(hasOverflow ? n : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Estados de pausa (hover, táctil, pestaña oculta)
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchFrozen, setIsTouchFrozen] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  // Swipe táctil
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const touchDeltaYRef = useRef(0);
  const touchFreezeTimerRef = useRef(null);

  // Reajustar índice si cambia la cantidad o el overflow
  useEffect(() => {
    if (hasOverflow) {
      setIsTransitioning(false);
      setCurrentIndex(n);
    } else {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  }, [n, hasOverflow]);

  // Limpieza de timer de congelamiento
  useEffect(() => {
    return () => {
      if (touchFreezeTimerRef.current) {
        clearTimeout(touchFreezeTimerRef.current);
      }
    };
  }, []);

  // Detección de pestaña oculta para pausar autoplay
  useEffect(() => {
    const handleVisibility = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Navegación siguiente
  const handleNext = useCallback(() => {
    if (!hasOverflow || isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [hasOverflow]);

  // Navegación anterior
  const handlePrev = useCallback(() => {
    if (!hasOverflow || isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [hasOverflow]);

  // Salto directo por clic en dots
  const handleDotClick = (targetDotIndex) => {
    if (!hasOverflow || isSlidingRef.current) return;
    const currentDot = ((currentIndex % n) + n) % n;
    const diff = targetDotIndex - currentDot;
    if (diff === 0) return;

    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + diff);
  };

  // Reacomodar posición silenciosamente al terminar transición CSS para ciclo infinito
  const handleTransitionEnd = () => {
    isSlidingRef.current = false;
    if (!hasOverflow) return;

    if (currentIndex >= 2 * n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - n);
    } else if (currentIndex < n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + n);
    }
  };

  useEffect(() => {
    if (!isTransitioning && hasOverflow) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning, hasOverflow]);

  useEffect(() => {
    if (isTransitioning && hasOverflow) {
      const timer = setTimeout(() => {
        isSlidingRef.current = false;
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex, hasOverflow]);

  // Autoplay continuo cuando hay overflow y no está pausado
  const isPaused = isHovered || isTouchFrozen || isDocumentHidden;

  useEffect(() => {
    if (!hasOverflow || !autoPlay || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [hasOverflow, autoPlay, autoPlayInterval, isPaused, handleNext]);

  // Gestos táctiles (Swipe)
  const handleTouchStart = (e) => {
    if (!hasOverflow) return;
    if (touchFreezeTimerRef.current) {
      clearTimeout(touchFreezeTimerRef.current);
      touchFreezeTimerRef.current = null;
    }
    setIsTouchFrozen(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDeltaXRef.current = 0;
    touchDeltaYRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!hasOverflow) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
    touchDeltaYRef.current = e.touches[0].clientY - touchStartYRef.current;
  };

  const handleTouchEnd = () => {
    if (!hasOverflow) return;
    const diffX = touchDeltaXRef.current;
    const diffY = touchDeltaYRef.current;

    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    if (touchFreezeTimerRef.current) {
      clearTimeout(touchFreezeTimerRef.current);
    }
    touchFreezeTimerRef.current = setTimeout(() => {
      setIsTouchFrozen(false);
      touchFreezeTimerRef.current = null;
    }, 4500);
  };

  if (loading) {
    return (
      <div className="featured-carousel-loading" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p className="products-loading">Cargando piezas destacadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="featured-carousel-error" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#7a3d1f' }}>
        <p>No se pudieron cargar los productos en este momento.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Si los productos NO exceden la capacidad de la pantalla, mostrar grilla completa estática sin carrusel
  if (!hasOverflow) {
    return (
      <div
        ref={containerRef}
        className="featured-carousel-container"
        role="region"
        aria-label="Piezas Destacadas"
      >
        <div
          className="featured-carousel-track"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
            gap: `${gap}px`,
            width: '100%',
          }}
        >
          {products.map((product, idx) => (
            <div
              key={`static-${product.id ?? product._id ?? idx}`}
              className="featured-carousel-slide"
              style={{ width: '100%' }}
            >
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si los productos EXCEDEN la capacidad visible, activar carrusel infinito sin cortes
  const currentDotIndex = n > 0 ? ((currentIndex % n) + n) % n : 0;
  const offset = currentIndex * (cardWidth + gap);

  return (
    <div
      ref={containerRef}
      className="featured-carousel-container"
      role="region"
      aria-roledescription="carrusel infinito"
      aria-label="Piezas Destacadas"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Flecha Anterior (visible en desktop/tablet >= 768px) */}
      <button
        type="button"
        className="featured-carousel-btn featured-carousel-btn--prev"
        onClick={handlePrev}
        aria-label="Ver pieza destacada anterior"
        title="Pieza anterior"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Viewport del Carrusel */}
      <div className="featured-carousel-viewport">
        <div
          className="featured-carousel-track"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: isTransitioning
              ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
            gap: `${gap}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedProducts.map((product, idx) => (
            <div
              key={`slide-${product.id ?? product._id}-${idx}`}
              className="featured-carousel-slide"
              style={{ width: `${cardWidth}px`, flex: `0 0 ${cardWidth}px` }}
              aria-hidden={idx < currentIndex || idx >= currentIndex + visibleCount}
            >
              <ProductCard product={product} index={idx % n} />
            </div>
          ))}
        </div>
      </div>

      {/* Flecha Siguiente (visible en desktop/tablet >= 768px) */}
      <button
        type="button"
        className="featured-carousel-btn featured-carousel-btn--next"
        onClick={handleNext}
        aria-label="Ver siguiente pieza destacada"
        title="Siguiente pieza"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Paginación con Puntos (Dots) */}
      <div
        className="featured-carousel-dots"
        role="tablist"
        aria-label="Paginación de piezas destacadas"
      >
        {products.map((p, idx) => (
          <button
            key={`dot-${p.id ?? p._id ?? idx}`}
            type="button"
            className={`featured-carousel-dot ${
              idx === currentDotIndex ? 'featured-carousel-dot--active' : ''
            }`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Ir a pieza ${idx + 1}: ${p.name}`}
            aria-selected={idx === currentDotIndex}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}

export default FeaturedCarousel;
