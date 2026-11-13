import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import OrdersPage from './OrdersPage';
import pedidosApi from '../../services/pedidosApi';
import { ProductsContext } from '../../context/ProductsContext';
import { FALLBACK_PRODUCT_IMAGE } from '../../utils/imageUrl';

let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../../services/pedidosApi', () => ({
  __esModule: true,
  default: {
    getMyOrders: jest.fn(),
  },
}));

function LoginProbe() {
  const location = useLocation();
  return (
    <div data-testid="login-probe">
      Login — from:{location.state?.from?.pathname || 'none'}
    </div>
  );
}

function renderOrdersPage({ products = [], catalogLoading = false } = {}) {
  return render(
    <ProductsContext.Provider value={{ products, loading: catalogLoading }}>
      <MemoryRouter initialEntries={['/mis-pedidos']}>
        <Routes>
          <Route path="/mis-pedidos" element={<OrdersPage />} />
          <Route path="/login" element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>
    </ProductsContext.Provider>
  );
}

describe('OrdersPage (/mis-pedidos)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      user: { id: 'u1', name: 'Camilo Desza', role: 'user' },
      loading: false,
      isAuthenticated: true,
    };
  });

  it('muestra estado de verificación mientras carga la sesión', () => {
    mockAuthState = {
      user: null,
      loading: true,
      isAuthenticated: false,
    };

    renderOrdersPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Verificando sesión...'
    );
    expect(pedidosApi.getMyOrders).not.toHaveBeenCalled();
  });

  it('redirige a /login si el usuario no está autenticado', () => {
    mockAuthState = {
      user: null,
      loading: false,
      isAuthenticated: false,
    };

    renderOrdersPage();

    expect(screen.getByTestId('login-probe')).toHaveTextContent(
      'Login — from:/mis-pedidos'
    );
    expect(pedidosApi.getMyOrders).not.toHaveBeenCalled();
  });

  it('muestra estado vacío con enlaces al catálogo cuando no hay pedidos', async () => {
    pedidosApi.getMyOrders.mockResolvedValue([]);

    renderOrdersPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando tus pedidos...'
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Todavía no realizaste ningún pedido',
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Explorar catálogo' })
    ).toHaveAttribute('href', '/productos');
    expect(screen.getByRole('link', { name: 'Ver carrito' })).toHaveAttribute(
      'href',
      '/carrito'
    );
  });

  it('renderiza la lista de pedidos con imágenes del catálogo, estado, filtros y total', async () => {
    pedidosApi.getMyOrders.mockResolvedValue([
      {
        id: '6af24237e2cd1fbb5d6eb639',
        status: 'pending',
        total: 3230000,
        createdAt: '2026-11-09T21:59:19.766Z',
        items: [
          {
            productId: 'prod-1',
            name: 'Biblioteca Recoleta',
            price: 1450000,
            quantity: 1,
          },
          {
            productId: 'prod-2',
            name: 'Butaca Mendoza',
            price: 890000,
            quantity: 2,
          },
        ],
      },
      {
        id: '6af1111111111111116eb123',
        status: 'completed',
        total: 420000,
        createdAt: '2026-10-15T15:30:00.000Z',
        items: [
          {
            productId: 'prod-missing',
            name: 'Mesa de Noche Aconcagua',
            price: 420000,
            quantity: 1,
          },
        ],
      },
    ]);

    renderOrdersPage({
      products: [
        {
          id: 'prod-1',
          name: 'Biblioteca Recoleta',
          category: 'almacenamiento',
          image: 'assets/products/Biblioteca Recoleta.png',
        },
        {
          id: 'prod-2',
          name: 'Butaca Mendoza',
          category: 'living',
          image: 'assets/products/Butaca Mendoza.png',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Biblioteca Recoleta')).toBeInTheDocument();
    });

    expect(screen.getByText('2 pedidos registrados')).toBeInTheDocument();
    expect(screen.getByText('Pedido #6EB639')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText('Butaca Mendoza')).toHaveAttribute(
      'href',
      '/productos/prod-2'
    );
    expect(screen.getByText('Almacenamiento')).toBeInTheDocument();
    expect(screen.getByText('Living')).toBeInTheDocument();
    expect(screen.getByAltText('Biblioteca Recoleta')).toHaveAttribute(
      'src',
      '/assets/products/Biblioteca Recoleta.png'
    );
    expect(screen.getByAltText('Mesa de Noche Aconcagua')).toHaveAttribute(
      'src',
      FALLBACK_PRODUCT_IMAGE
    );
    expect(screen.getByText('3 piezas')).toBeInTheDocument();
    expect(screen.getByText('$ 3.230.000')).toBeInTheDocument();
    expect(screen.getByText('$ 1.780.000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Completados (1)' }));
    expect(screen.queryByText('Biblioteca Recoleta')).not.toBeInTheDocument();
    expect(screen.getByText('Mesa de Noche Aconcagua')).toBeInTheDocument();
  });

  it('muestra alerta de error y permite reintentar la carga', async () => {
    pedidosApi.getMyOrders
      .mockRejectedValueOnce(new Error('Error de conexión con el servidor'))
      .mockResolvedValueOnce([]);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error de conexión con el servidor'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Todavía no realizaste ningún pedido',
        })
      ).toBeInTheDocument();
    });
    expect(pedidosApi.getMyOrders).toHaveBeenCalledTimes(2);
  });
});
