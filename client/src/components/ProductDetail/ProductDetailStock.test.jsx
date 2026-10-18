import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import { CartProvider, useCart } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';

describe('ProductDetail - Disponibilidad y Control de Stock', () => {
  const baseProduct = {
    id: 20,
    name: 'Silla Córdoba',
    category: 'comedor',
    description: 'Silla artesanal de nogal',
    price: 150000,
    image: 'assets/products/silla.png',
    specs: { madera: 'Nogal' },
  };

  test('con stock disponible permite agregar al carrito', () => {
    const product = { ...baseProduct, stock: 5 };

    render(
      <MemoryRouter>
        <ToastProvider>
          <CartProvider>
            <ProductDetail product={product} />
          </CartProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    const stockBadge = screen.getByTestId('product-detail-stock');
    expect(stockBadge).toHaveTextContent('5 unidades disponibles');
    expect(stockBadge).toHaveClass('stock-badge--in');

    const button = screen.getByRole('button', { name: /añadir al carrito/i });
    expect(button).toBeEnabled();
  });

  test('con stock === 0 deshabilita el botón y muestra alerta de agotado', () => {
    const product = { ...baseProduct, stock: 0 };

    render(
      <MemoryRouter>
        <ToastProvider>
          <CartProvider>
            <ProductDetail product={product} />
          </CartProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    const stockBadge = screen.getByTestId('product-detail-stock');
    expect(stockBadge).toHaveTextContent('Sin stock');
    expect(stockBadge).toHaveClass('stock-badge--out');

    // Botón deshabilitado
    const button = screen.getByRole('button', { name: /sin stock/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-disabled');

    // Alerta visual informativa
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/temporalmente agotado/i);
  });

  test('deshabilita el botón cuando se agrega al carrito todo el stock disponible', () => {
    const product = { ...baseProduct, stock: 2 };

    render(
      <MemoryRouter>
        <ToastProvider>
          <CartProvider>
            <ProductDetail product={product} />
          </CartProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /añadir al carrito/i });
    expect(button).toBeEnabled();

    // Agrega la primera unidad
    fireEvent.click(button);
    expect(screen.getByTestId('product-detail-stock')).toHaveTextContent(
      '1 disponibles (1 en carrito)'
    );

    // Agrega la segunda unidad (alcanza el límite de 2)
    fireEvent.click(button);

    // Ahora el botón debe quedar deshabilitado y cambiar texto
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Máximo en carrito');

    // Muestra alerta de límite alcanzado
    expect(screen.getByText(/Stock máximo alcanzado/i)).toBeInTheDocument();
  });
});

describe('CartContext - Restricción de stock agotado', () => {
  function TestCartComponent({ productToAdd }) {
    const { cart, addToCart } = useCart();
    return (
      <div>
        <button onClick={() => addToCart(productToAdd)}>Agregar</button>
        <span data-testid="cart-count">{cart.length}</span>
        {cart[0] && <span data-testid="item-qty">{cart[0].quantity}</span>}
      </div>
    );
  }

  test('no agrega al carrito un producto con stock 0', () => {
    const outOfStockProduct = { id: 99, name: 'Banco Sin Stock', stock: 0, price: 500 };

    render(
      <CartProvider>
        <TestCartComponent productToAdd={outOfStockProduct} />
      </CartProvider>
    );

    const button = screen.getByText('Agregar');
    fireEvent.click(button);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  test('no permite superar la cantidad de stock disponible al agregar repetidamente', () => {
    const limitedProduct = { id: 88, name: 'Lámpara Exclusiva', stock: 2, price: 1000 };

    render(
      <CartProvider>
        <TestCartComponent productToAdd={limitedProduct} />
      </CartProvider>
    );

    const button = screen.getByText('Agregar');
    fireEvent.click(button); // qty 1
    fireEvent.click(button); // qty 2
    fireEvent.click(button); // intenta qty 3, pero el límite es 2

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-qty')).toHaveTextContent('2');
  });
});
