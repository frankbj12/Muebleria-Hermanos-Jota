import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import CartPage from './CartPage';
import { CartProvider } from '../../context/CartContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { ProductsContext } from '../../context/ProductsContext';
import pedidosApi from '../../services/pedidosApi';

jest.mock('../../services/pedidosApi', () => ({
  __esModule: true,
  default: {
    getMyOrders: jest.fn(),
    createOrder: jest.fn(),
  },
}));

const CART_STORAGE_KEY = 'hermanos-jota-cart';

function LoginProbe() {
  const location = useLocation();
  return (
    <div data-testid="login-probe">
      Login — from:{location.state?.from?.pathname || 'none'}
    </div>
  );
}

function renderCartPage({
  cart = [],
  authValue = {
    isAuthenticated: false,
    loading: false,
    user: null,
  },
  productsValue = {
    products: [],
    loading: false,
    refreshProducts: jest.fn().mockResolvedValue([]),
  },
} = {}) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  return {
    refreshProducts: productsValue.refreshProducts,
    ...render(
      <MemoryRouter initialEntries={['/carrito']}>
        <AuthContext.Provider value={authValue}>
          <ProductsContext.Provider value={productsValue}>
            <ToastProvider>
              <CartProvider>
                <Routes>
                  <Route path="/carrito" element={<CartPage />} />
                  <Route path="/login" element={<LoginProbe />} />
                  <Route path="/mis-pedidos" element={<div>Mis pedidos</div>} />
                </Routes>
              </CartProvider>
            </ToastProvider>
          </ProductsContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  };
}

describe('CartPage checkout (F8)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redirige a /login preservando /carrito y conserva los ítems si no hay sesión', () => {
    renderCartPage({
      cart: [
        {
          id: '6ace86682817cb7b9eb7a0e6',
          name: 'Butaca Mendoza',
          price: 890000,
          quantity: 1,
          stock: 5,
        },
      ],
      authValue: {
        isAuthenticated: false,
        loading: false,
        user: null,
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar compra' }));

    expect(screen.getByTestId('login-probe')).toHaveTextContent(
      'Login — from:/carrito'
    );
    expect(pedidosApi.createOrder).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toHaveLength(1);
  });

  it('confirma el pedido con POST /api/pedidos, vacía el carrito y muestra confirmación', async () => {
    const sampleCart = [
      {
        id: '6ace86682817cb7b9eb7a0e6',
        name: 'Butaca Mendoza',
        price: 890000,
        quantity: 2,
        stock: 5,
        image: 'assets/products/Butaca Mendoza.png',
      },
    ];

    pedidosApi.createOrder.mockResolvedValue({
      id: '6af24237e2cd1fbb5d6eb777',
      items: [
        {
          productId: '6ace86682817cb7b9eb7a0e6',
          name: 'Butaca Mendoza',
          price: 890000,
          quantity: 2,
        },
      ],
      total: 1780000,
      status: 'pending',
    });

    const { refreshProducts } = renderCartPage({
      cart: sampleCart,
      authValue: {
        isAuthenticated: true,
        loading: false,
        user: {
          id: 'u1',
          name: 'Camilo Desza',
          email: 'camilo@muebleria.com',
          role: 'user',
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar compra' }));

    expect(
      screen.getByRole('dialog', { name: 'Revisá tu pedido' })
    ).toBeInTheDocument();
    expect(screen.getByText('Camilo Desza')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '¡Pedido confirmado!' })
      ).toBeInTheDocument();
    });

    expect(pedidosApi.createOrder).toHaveBeenCalledWith(sampleCart);
    expect(refreshProducts).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual([]);
    expect(screen.getByText('#6EB777')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ver mis pedidos' })
    ).toHaveAttribute('href', '/mis-pedidos');
  });

  it('muestra el error de stock del servidor sin vaciar el carrito cuando responde 400', async () => {
    const stockError = new Error(
      'Uno o más productos no existen o no tienen stock suficiente.'
    );
    stockError.status = 400;
    pedidosApi.createOrder.mockRejectedValue(stockError);

    const { refreshProducts } = renderCartPage({
      cart: [
        {
          id: '6ace86682817cb7b9eb7a0e6',
          name: 'Butaca Mendoza',
          price: 890000,
          quantity: 2,
          stock: 5,
        },
      ],
      authValue: {
        isAuthenticated: true,
        loading: false,
        user: { id: 'u1', name: 'Camilo Desza', email: 'camilo@muebleria.com' },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar compra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    await waitFor(() => {
      expect(
        within(screen.getByRole('dialog')).getByRole('alert')
      ).toHaveTextContent(
        'Uno o más productos no existen o no tienen stock suficiente.'
      );
    });

    expect(refreshProducts).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toHaveLength(1);
  });

  it('deshabilita la compra y explica cuando un producto no tiene stock', () => {
    renderCartPage({
      cart: [
        {
          id: 'chair-1',
          name: 'Silla agotada',
          price: 25000,
          quantity: 1,
          stock: 0,
        },
      ],
      authValue: {
        isAuthenticated: true,
        loading: false,
        user: { id: 'u1', name: 'Camilo Desza' },
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Hay productos en tu carrito que ya no tienen stock disponible.'
    );
    expect(
      screen.getByRole('button', { name: 'Iniciar compra' })
    ).toBeDisabled();
  });

  it('muestra el acceso al catálogo cuando el carrito está vacío', () => {
    renderCartPage({ cart: [] });

    expect(
      screen.getByRole('link', { name: 'Explorar catálogo' })
    ).toHaveAttribute('href', '/productos');
    expect(
      screen.queryByRole('button', { name: 'Iniciar compra' })
    ).not.toBeInTheDocument();
  });
});
