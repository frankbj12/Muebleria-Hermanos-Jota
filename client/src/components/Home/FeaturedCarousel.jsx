import React, { useState, useRef, useEffect, useCallback } from 'react';
import ProductCard from '../ProductCard/ProductCard';

/**
 * Componente FeaturedCarousel (Carrusel Infinito / Reel Continuo)
 * Carrusel continuo, interactivo y responsivo para las Piezas Destacadas de Hermanos Jota.
 * - Modo Desktop / Tablet (>= 768px):
 *   Avance automático paso a paso con flechas interactivas y dots de paginación.
 *   Se pausa al posar el cursor del mouse (hover) y se reanuda al retirarlo.
 * - Modo Celulares (< 768px):
 *   Desplazamiento horizontal fluido, continuo y constante (estilo reel / portfolio skills).
 *   Si el usuario arrastra o toca la pantalla, se pausa al instante y permite navegar manualmente con el dedo.
 *   Al soltar el dedo, se congela durante unos segundos para permitir observar la pieza y luego
 *   continúa el scrolleo continuo desde esa misma posición sin saltos.
 *
 * @param {Object} props
 * @param {Array} props.products - Lista de productos destacados
 * @param {boolean} [props.loading] - Estado de carga
 * @param {string|null} [props.error] - Estado de error
 * @param {boolean} [props.autoPlay=true] - Habilitar avance automático
 * @param {number} [props.autoPlayInterval=3800] - Intervalo en ms para desktop/tablet
 * @param {number} [props.mobileScrollSpeed=35] - Velocidad en px/seg para el scroll continuo en móviles
 * @param {number} [props.mobileFreezeDuration=4500] - Tiempo de congelamiento en ms tras tocar en celular
 */
function FeaturedCarousel({
  products = [],
  loading = false,
  error = null,
  autoPlay = true,
  autoPlayInterval = 3800,
  mobileScrollSpeed = 35,
  mobileFreezeDuration = 4500,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isSlidingRef = useRef(false);

  const n = products.length;

  // Triplicamos la lista para crear un bucle infinito continuo [Set 0, Set 1 (original), Set 2]
  const extendedProducts = n > 1 ? [...products, ...products, ...products] : products;

  // Estado para modo desktop / tablet
  const [currentIndex, setCurrentIndex] = useState(n > 1 ? n : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Estados de pausa
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);

  // Estados y referencias para el scroll continuo en celulares (< 768px)
  const [isMobileTouchFrozen, setIsMobileTouchFrozen] = useState(false);
  const scrollPosRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const lastTouchXRef = useRef(0);
  const isHorizontalDragRef = useRef(null);
  const mobileFreezeTimerRef = useRef(null);

  // Medición reactiva del ancho disponible del contenedor
  useEffect(() => {
    const measure = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      } else if (typeof window !== 'undefined' && window.innerWidth > 0) {
        setContainerWidth(window.innerWidth);
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

  // Determinar si nos encontramos en tamaño celular (< 768px)
  const isMobile = containerWidth > 0 && containerWidth < 768;

  // Actualizar índice inicial de desktop si cambia la cantidad de productos
  useEffect(() => {
    if (n > 1 && !isMobile) {
      setIsTransitioning(false);
      setCurrentIndex(n);
    }
  }, [n, isMobile]);

  // Cálculo de columnas y anchos según viewport
  const getVisibleCount = (width) => {
    if (width >= 1150) return 4;
    if (width >= 850) return 3;
    if (width >= 560) return 2;
    return 1;
  };

  const visibleCount = getVisibleCount(containerWidth);
  const gap = isMobile ? 16 : (containerWidth < 600 ? 16 : 24);

  let cardWidth = 280;
  if (containerWidth > 0) {
    if (isMobile) {
      // En celulares (< 768px), ancho tipo tarjeta reel continuo
      cardWidth = Math.min(320, Math.max(260, Math.floor(containerWidth * 0.78)));
    } else {
      cardWidth = Math.floor(
        (containerWidth - (visibleCount - 1) * gap) / visibleCount
      );
    }
  }

  // Ancho de un conjunto completo de productos originales
  const singleSetWidth = n * (cardWidth + gap);

  // Sincronizar posición continua al pasar a modo móvil
  useEffect(() => {
    if (isMobile && n > 1 && singleSetWidth > 0) {
      let initialPos = (currentIndex % n) * (cardWidth + gap);
      if (initialPos >= singleSetWidth) initialPos -= singleSetWidth;
      scrollPosRef.current = initialPos;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${initialPos}px, 0px, 0px)`;
      }
    }
  }, [isMobile, n, cardWidth, gap, currentIndex, singleSetWidth]);

  // Limpieza de temporizadores en desmontaje
  useEffect(() => {
    return () => {
      if (mobileFreezeTimerRef.current) {
        clearTimeout(mobileFreezeTimerRef.current);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Pausar si la pestaña del navegador no está visible
  useEffect(() => {
    const handleVisibility = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  /* =========================================================================
     MODO CELULAR: Scrolleo continuo fluido y constante (rAF / Ticker estilo Reel)
     ========================================================================= */
  useEffect(() => {
    if (!isMobile || n <= 1 || !autoPlay) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const step = (now) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Avanzar de manera constante y lineal si no está arrastrando, ni congelado, ni pestaña oculta
      if (!isDraggingRef.current && !isMobileTouchFrozen && !isDocumentHidden && singleSetWidth > 0) {
        scrollPosRef.current += mobileScrollSpeed * dt;
        if (scrollPosRef.current >= singleSetWidth) {
          scrollPosRef.current -= singleSetWidth;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${scrollPosRef.current}px, 0px, 0px)`;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [isMobile, n, autoPlay, mobileScrollSpeed, singleSetWidth, isMobileTouchFrozen, isDocumentHidden]);

  // Gestos táctiles en celulares (< 768px)
  const handleTouchStart = (e) => {
    if (!isMobile) return;

    if (mobileFreezeTimerRef.current) {
      clearTimeout(mobileFreezeTimerRef.current);
      mobileFreezeTimerRef.current = null;
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    setIsMobileTouchFrozen(true);

    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    lastTouchXRef.current = touch.clientX;
    isHorizontalDragRef.current = null;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDraggingRef.current) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    // Diferenciar deslizamiento horizontal vs scroll vertical de página
    if (isHorizontalDragRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalDragRef.current = Math.abs(diffX) >= Math.abs(diffY);
      }
    }

    if (isHorizontalDragRef.current) {
      const delta = touch.clientX - lastTouchXRef.current;
      lastTouchXRef.current = touch.clientX;

      if (Math.abs(diffX) > 10) {
        hasDraggedRef.current = true;
      }

      scrollPosRef.current -= delta;

      // Wrap suave bidireccional
      if (singleSetWidth > 0) {
        while (scrollPosRef.current < 0) {
          scrollPosRef.current += singleSetWidth;
        }
        while (scrollPosRef.current >= singleSetWidth) {
          scrollPosRef.current -= singleSetWidth;
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${scrollPosRef.current}px, 0px, 0px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    isDraggingRef.current = false;

    // Al soltar el dedo, se congela unos segundos para observar la pieza
    // y luego continúa scrolleando automáticamente desde la misma posición
    if (mobileFreezeTimerRef.current) {
      clearTimeout(mobileFreezeTimerRef.current);
    }
    mobileFreezeTimerRef.current = setTimeout(() => {
      lastTimeRef.current = performance.now();
      setIsMobileTouchFrozen(false);
      mobileFreezeTimerRef.current = null;
    }, mobileFreezeDuration);
  };

  // Prevenir clics accidentales al arrastrar con el dedo
  const handleCardClickCapture = (e) => {
    if (isMobile && hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  /* =========================================================================
     MODO DESKTOP / TABLET: Avance por pasos y controles interactivos
     ========================================================================= */
  const handleNext = useCallback(() => {
    if (n <= 1 || isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [n]);

  const handlePrev = useCallback(() => {
    if (n <= 1 || isSlidingRef.current) return;
    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [n]);

  const handleDotClick = (targetDotIndex) => {
    if (n <= 1 || isSlidingRef.current) return;
    const currentDot = ((currentIndex % n) + n) % n;
    const diff = targetDotIndex - currentDot;
    if (diff === 0) return;

    isSlidingRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + diff);
  };

  const handleTransitionEnd = () => {
    isSlidingRef.current = false;
    if (n <= 1) return;

    if (currentIndex >= 2 * n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - n);
    } else if (currentIndex < n) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + n);
    }
  };

  // Re-activar la transición luego del salto silencioso
  useEffect(() => {
    if (!isTransitioning && !isMobile) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning, isMobile]);

  useEffect(() => {
    if (isTransitioning && !isMobile) {
      const timer = setTimeout(() => {
        isSlidingRef.current = false;
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex, isMobile]);

  // Autoplay para desktop / tablet (pausa con hover o pestaña oculta)
  useEffect(() => {
    if (isMobile || !autoPlay || n <= 1 || isHovered || isDocumentHidden) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isMobile, autoPlay, autoPlayInterval, n, isHovered, isDocumentHidden, handleNext]);

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

  const currentDotIndex = n > 0 ? ((currentIndex % n) + n) % n : 0;
  const offset = currentIndex * (cardWidth + gap);

  return (
    <div
      ref={containerRef}
      className={`featured-carousel-container ${isMobile ? 'featured-carousel--mobile' : ''}`}
      role="region"
      aria-roledescription={isMobile ? 'reel continuo' : 'carrusel infinito'}
      aria-label="Piezas Destacadas"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Flecha Anterior (visible solo en desktop/tablet >= 768px) */}
      {n > 1 && !isMobile && (
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
      )}

      {/* Viewport del Carrusel */}
      <div className="featured-carousel-viewport">
        <div
          ref={trackRef}
          className="featured-carousel-track"
          style={
            isMobile
              ? {
                  transform: `translate3d(-${scrollPosRef.current}px, 0px, 0px)`,
                  transition: 'none',
                  gap: `${gap}px`,
                }
              : {
                  transform: `translateX(-${offset}px)`,
                  transition: isTransitioning
                    ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)'
                    : 'none',
                  gap: `${gap}px`,
                }
          }
          onTransitionEnd={isMobile ? undefined : handleTransitionEnd}
          onClickCapture={handleCardClickCapture}
        >
          {extendedProducts.map((product, idx) => (
            <div
              key={`slide-${product.id ?? product._id}-${idx}`}
              className="featured-carousel-slide"
              style={{ width: `${cardWidth}px`, flex: `0 0 ${cardWidth}px` }}
              aria-hidden={!isMobile && (idx < currentIndex || idx >= currentIndex + visibleCount)}
            >
              <ProductCard product={product} index={idx % n} />
            </div>
          ))}
        </div>
      </div>

      {/* Flecha Siguiente (visible solo en desktop/tablet >= 768px) */}
      {n > 1 && !isMobile && (
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
      )}

      {/* Puntos de Paginación (visibles solo en desktop/tablet >= 768px) */}
      {n > 1 && !isMobile && (
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
      )}
    </div>
  );
}

export default FeaturedCarousel;
