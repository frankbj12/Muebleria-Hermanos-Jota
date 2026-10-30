import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('react-router-dom', () => {
  const router = require('react-router');
  return {
    ...router,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { MemoryRouter } from 'react-router';
import FeaturedCarousel from './FeaturedCarousel';

describe('FeaturedCarousel Component', () => {
  const mockFeaturedProducts = [
    {
      id: 1,
      name: 'Butaca Mendoza',
      category: 'living',
      price: 890000,
      stock: 5,
      image: 'assets/products/butaca.png',
      featured: true,
    },
    {
      id: 2,
      name: 'Mesa Comedor Pampa',
      category: 'comedor',
      price: 1950000,
      stock: 10,
      image: 'assets/products/mesa.png',
      featured: true,
    },
    {
      id: 3,
      name: 'Sofá Patagonia',
      category: 'living',
      price: 2350000,
      stock: 10,
      image: 'assets/products/sofa.png',
      featured: true,
    },
    {
      id: 4,
      name: 'Sillón Copacabana',
      category: 'living',
      price: 1250000,
      stock: 3,
      image: 'assets/products/sillon.png',
      featured: true,
    },
    {
      id: 5,
      name: 'Mueble Bar Iguazú',
      category: 'almacenamiento',
      price: 2122003,
      stock: 2,
      image: 'assets/products/bar.png',
      featured: true,
    },
  ];

  test('renderiza todas las piezas destacadas en el bucle continuo sin filas desbalanceadas', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} />
      </MemoryRouter>
    );

    // Las tarjetas deben existir en el documento dentro del carrusel
    expect(screen.getAllByText('Butaca Mendoza').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mesa Comedor Pampa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sofá Patagonia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sillón Copacabana').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mueble Bar Iguazú').length).toBeGreaterThan(0);

    // Comprobar que hay slides en la pista continua (3 juegos de 5 productos = 15)
    const slides = document.querySelectorAll('.featured-carousel-slide');
    expect(slides.length).toBe(15);
  });

  test('muestra controles de navegación siempre activos para bucle infinito', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} />
      </MemoryRouter>
    );

    const prevBtn = screen.getByRole('button', { name: /Ver pieza destacada anterior/i });
    const nextBtn = screen.getByRole('button', { name: /Ver siguiente pieza destacada/i });

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();

    // En carrusel infinito las flechas nunca están deshabilitadas
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Se muestran exactamente 5 dots correspondientes a los 5 productos únicos
    const dots = document.querySelectorAll('.featured-carousel-dot');
    expect(dots.length).toBe(5);
  });

  test('permite navegar infinitamente haciendo clic en siguiente y anterior', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /Ver siguiente pieza destacada/i });
    const prevBtn = screen.getByRole('button', { name: /Ver pieza destacada anterior/i });

    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);

    // Ambas flechas siguen disponibles para continuar el ciclo
    expect(nextBtn).not.toBeDisabled();
    expect(prevBtn).not.toBeDisabled();
  });

  test('permite hacer clic en los dots para navegar a una pieza específica', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} />
      </MemoryRouter>
    );

    const dot5 = screen.getByRole('tab', { name: /Ir a pieza 5: Mueble Bar Iguazú/i });
    expect(dot5).toBeInTheDocument();

    fireEvent.click(dot5);
    expect(dot5).toHaveClass('featured-carousel-dot--active');
  });

  test('pausa el autoplay al posar el mouse y lo reanuda al quitarlo', () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} autoPlayInterval={3000} />
      </MemoryRouter>
    );

    const container = screen.getByRole('region', { name: /Piezas Destacadas/i });

    // Hover pausa
    fireEvent.mouseEnter(container);
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    // Leave reanuda
    fireEvent.mouseLeave(container);
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    jest.useRealTimers();
  });

  test('soporta gestos táctiles swipe a izquierda y derecha', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={mockFeaturedProducts} />
      </MemoryRouter>
    );

    const container = screen.getByRole('region', { name: /Piezas Destacadas/i });

    // Swipe izquierda (avance)
    fireEvent.touchStart(container, { touches: [{ clientX: 300 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(container);

    // Swipe derecha (retroceso)
    fireEvent.touchStart(container, { touches: [{ clientX: 200 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(container);
  });

  test('congela el autoplay temporalmente tras interacción táctil y luego se reanuda', () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <FeaturedCarousel
          products={mockFeaturedProducts}
          autoPlayInterval={3000}
          touchFreezeDuration={5000}
        />
      </MemoryRouter>
    );

    const container = screen.getByRole('region', { name: /Piezas Destacadas/i });

    // Inicia toque táctil y swipe
    fireEvent.touchStart(container, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(container);

    // Durante los primeros 4 segundos de congelamiento, el carrusel sigue en pausa táctil
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Se completan los 5 segundos y se reanuda el temporizador automático
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    jest.useRealTimers();
  });

  test('en modo celular (< 768px) activa reel continuo y permite arrastrar y congelar al soltar', () => {
    jest.useFakeTimers();

    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 390;

    render(
      <MemoryRouter>
        <FeaturedCarousel
          products={mockFeaturedProducts}
          mobileFreezeDuration={4000}
        />
      </MemoryRouter>
    );

    const container = screen.getByRole('region', { name: /Piezas Destacadas/i });
    expect(container).toHaveClass('featured-carousel--mobile');

    // Tocar y arrastrar horizontalmente
    fireEvent.touchStart(container, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 220, clientY: 100 }] });
    fireEvent.touchEnd(container);

    // Se congela durante 4 segundos tras soltar
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    // Pasan los 4 segundos y se reanuda
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    window.innerWidth = originalInnerWidth;
    jest.useRealTimers();
  });

  test('muestra estado de carga cuando loading es true', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={[]} loading={true} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando piezas destacadas.../i)).toBeInTheDocument();
  });

  test('muestra estado de error cuando error está presente', () => {
    render(
      <MemoryRouter>
        <FeaturedCarousel products={[]} error="Error al conectar" />
      </MemoryRouter>
    );

    expect(screen.getByText(/No se pudieron cargar los productos en este momento/i)).toBeInTheDocument();
  });
});
