import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import productosApi from '../services/productosApi';
import { ProductsProvider, useProducts } from './ProductsContext';

jest.mock('../services/productosApi', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

function ProductsHarness() {
  const { products, createProduct } = useProducts();
  const product = { nombre: 'Mesa nueva', precio: 100 };

  return (
    <>
      <output data-testid="product-count">{products.length}</output>
      <button type="button" onClick={() => createProduct(product)}>
        Crear producto
      </button>
    </>
  );
}

describe('ProductsProvider', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('carga productos y refresca la lista después de crear uno', async () => {
    const createdProduct = { _id: 'product-1', nombre: 'Mesa nueva' };
    productosApi.getAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createdProduct]);
    productosApi.create.mockResolvedValue(createdProduct);

    render(
      <ProductsProvider>
        <ProductsHarness />
      </ProductsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-count').textContent).toBe('0');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => {
      expect(screen.getByTestId('product-count').textContent).toBe('1');
    });
    expect(productosApi.create).toHaveBeenCalledWith({
      nombre: 'Mesa nueva',
      precio: 100,
    });
    expect(productosApi.getAll).toHaveBeenCalledTimes(2);
  });
});
