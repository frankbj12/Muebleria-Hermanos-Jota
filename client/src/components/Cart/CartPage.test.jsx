import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from './CartPage';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';

const CART_STORAGE_KEY = 'hermanos-jota-cart';

function renderCartPage(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  return render(
    <MemoryRouter>
      <ToastProvider>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('CartPage checkout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('muestra el checkout placeholder y conserva el carrito', () => {
    renderCartPage([
      {
        id: 'chair-1',
        name: 'Silla de madera',
        price: 25000,
        quantity: 2,
        stock: 5,
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar compra' }));

    expect(
      screen.getByText(/la funcionalidad de pago estará disponible próximamente/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Silla de madera')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toHaveLength(1);
  });

  it('deshabilita la compra y explica cuando un producto no tiene stock', () => {
    renderCartPage([
      {
        id: 'chair-1',
        name: 'Silla agotada',
        price: 25000,
        quantity: 1,
        stock: 0,
      },
    ]);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Hay productos en tu carrito que ya no tienen stock disponible.'
    );
    expect(screen.getByRole('button', { name: 'Iniciar compra' })).toBeDisabled();
  });

  it('muestra el acceso al catálogo cuando el carrito está vacío', () => {
    renderCartPage([]);

    expect(
      screen.getByRole('link', { name: 'Explorar catálogo' })
    ).toHaveAttribute('href', '/productos');
    expect(
      screen.queryByRole('button', { name: 'Iniciar compra' })
    ).not.toBeInTheDocument();
  });
});
