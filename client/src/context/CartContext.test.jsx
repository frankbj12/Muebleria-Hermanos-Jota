import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

function CartHarness() {
  const {
    cart,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const product = {
    id: 'product-1',
    name: 'Mesa Roble',
    price: 500000,
    stock: 4,
    quantity: 1,
  };

  return (
    <div>
      <output data-testid="cart">{JSON.stringify(cart)}</output>
      <output data-testid="cart-count">{cartCount}</output>
      <button type="button" onClick={() => addToCart(product)}>
        Agregar
      </button>
      <button type="button" onClick={() => updateQuantity('product-1', 1)}>
        Aumentar
      </button>
      <button type="button" onClick={() => removeFromCart('product-1')}>
        Eliminar
      </button>
      <button type="button" onClick={clearCart}>
        Vaciar
      </button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <CartHarness />
    </CartProvider>
  );
}

describe('CartContext persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores cart products and quantities after the provider remounts', () => {
    const firstRender = renderCart();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar' }));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    firstRender.unmount();

    renderCart();

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart')).toHaveTextContent(
      '"name":"Mesa Roble"'
    );
    expect(JSON.parse(localStorage.getItem('hermanos-jota-cart'))[0].quantity)
      .toBe(2);
  });

  it('persists item removal and clearing the cart', () => {
    const { unmount } = renderCart();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(JSON.parse(localStorage.getItem('hermanos-jota-cart'))).toEqual([]);
    unmount();

    renderCart();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar' }));

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(JSON.parse(localStorage.getItem('hermanos-jota-cart'))).toEqual([]);
  });
});
