import React from 'react';
import { render, screen } from '@testing-library/react';

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
import ProductCard from './ProductCard';

describe('ProductCard - Visualización de Stock', () => {
  const baseProduct = {
    id: 10,
    name: 'Mesa Roble',
    category: 'comedor',
    description: 'Mesa de comedor artesanal',
    price: 500000,
    image: 'assets/products/mesa.png',
  };

  test('muestra badge de stock disponible cuando stock > 3', () => {
    const product = { ...baseProduct, stock: 8 };

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

    const badge = screen.getByTestId('stock-badge-10');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('8 disponibles');
    expect(badge).toHaveClass('stock-badge--in');
  });

  test('muestra badge de últimas unidades cuando stock <= 3 y stock > 0', () => {
    const product = { ...baseProduct, stock: 2 };

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

    const badge = screen.getByTestId('stock-badge-10');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('¡Últimas 2!');
    expect(badge).toHaveClass('stock-badge--low');
  });

  test('muestra badge de Sin stock cuando stock es 0', () => {
    const product = { ...baseProduct, stock: 0 };

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

    const badge = screen.getByTestId('stock-badge-10');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Sin stock');
    expect(badge).toHaveClass('stock-badge--out');

    // Comprobar aviso sobre imagen y clase en artículo
    expect(screen.getAllByText('Sin stock').length).toBeGreaterThanOrEqual(1);
    const card = document.getElementById('product-card-10');
    expect(card).toHaveClass('product-card--out-of-stock');
  });
});
