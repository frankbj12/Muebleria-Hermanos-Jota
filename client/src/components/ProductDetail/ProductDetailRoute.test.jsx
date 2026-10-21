import React from 'react';
import { render, screen } from '@testing-library/react';

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import productosApi from '../../services/productosApi';
import ProductDetailRoute from './ProductDetailRoute';

jest.mock('../../services/productosApi', () => ({
  __esModule: true,
  default: {
    getById: jest.fn(),
  },
}));

jest.mock(
  './ProductDetail',
  () =>
    function MockProductDetail({ product }) {
      return <h1>{product.name}</h1>;
    }
);

describe('ProductDetailRoute', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  function renderRoute(path) {
    return render(
      <MemoryRouter
        initialEntries={[path]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/productos/:id" element={<ProductDetailRoute />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('obtiene el producto usando el ID de la ruta', async () => {
    productosApi.getById.mockResolvedValue({
      id: 'mongo-id',
      name: 'Mesa Recoleta',
    });

    renderRoute('/productos/mongo-id');

    expect(
      await screen.findByRole('heading', { name: 'Mesa Recoleta' })
    ).toBeTruthy();
    expect(productosApi.getById).toHaveBeenCalledWith(
      'mongo-id',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('muestra una vista específica si la API responde 404', async () => {
    productosApi.getById.mockRejectedValue(
      Object.assign(new Error('Producto no encontrado'), { status: 404 })
    );

    renderRoute('/productos/unknown-id');

    expect(
      await screen.findByRole('heading', { name: 'Producto no encontrado' })
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Volver al catálogo' })
        .getAttribute('href')
    ).toBe('/productos');
  });
});
