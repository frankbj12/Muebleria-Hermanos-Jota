import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminOrdersPage from './AdminOrdersPage';
import { useAuth } from '../../context/AuthContext';
import pedidosApi from '../../services/pedidosApi';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services/pedidosApi', () => ({
  getAllOrders: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

describe('AdminOrdersPage', () => {
  const mockOrders = [
    {
      id: '661b1a111111111111111111',
      user: { name: 'Admin User', email: 'admin@hermanosjota.com' },
      items: [{ name: 'Silla Windsor', quantity: 2, price: 15000 }],
      total: 30000,
      status: 'pending',
      createdAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: '661b1a222222222222222222',
      user: { name: 'Cliente Ejemplo', email: 'cliente@ejemplo.com' },
      items: [{ name: 'Mesa Roble', quantity: 1, price: 80000 }],
      total: 80000,
      status: 'completed',
      createdAt: '2026-04-02T12:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el banner y las métricas para usuario admin', async () => {
    useAuth.mockReturnValue({
      user: { role: 'admin', name: 'Admin' },
      loading: false,
      isAuthenticated: true,
    });
    pedidosApi.getAllOrders.mockResolvedValue(mockOrders);

    render(
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Administración de Pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/✦ GESTIÓN DE PEDIDOS/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Cliente Ejemplo/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
    });
  });

  test('muestra estado de carga cuando se cargan los pedidos', () => {
    useAuth.mockReturnValue({
      user: { role: 'admin', name: 'Admin' },
      loading: false,
      isAuthenticated: true,
    });
    pedidosApi.getAllOrders.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando pedidos.../i)).toBeInTheDocument();
  });
});
