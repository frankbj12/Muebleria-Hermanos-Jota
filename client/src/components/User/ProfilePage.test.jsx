import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { CartContext } from '../../context/CartContext';

const mockLogout = jest.fn();
const mockAddToast = jest.fn();
let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

function LoginProbe() {
  const location = useLocation();
  return (
    <div data-testid="login-probe">
      Login — from:{location.state?.from?.pathname || 'none'}
    </div>
  );
}

function renderProfile({ cartCount = 0 } = {}) {
  return render(
    <MemoryRouter initialEntries={['/perfil']}>
      <CartContext.Provider value={{ cartCount }}>
        <Routes>
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/login" element={<LoginProbe />} />
          <Route path="/" element={<div>Inicio</div>} />
        </Routes>
      </CartContext.Provider>
    </MemoryRouter>
  );
}

describe('ProfilePage (/perfil)', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockAddToast.mockReset();
  });

  it('muestra estado de carga mientras verifica la sesión', () => {
    mockAuthState = {
      user: null,
      loading: true,
      isAuthenticated: false,
      logout: mockLogout,
    };

    renderProfile();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Verificando sesión...'
    );
  });

  it('redirige a /login preservando el origen si no hay sesión', () => {
    mockAuthState = {
      user: null,
      loading: false,
      isAuthenticated: false,
      logout: mockLogout,
    };

    renderProfile();

    expect(screen.getByTestId('login-probe')).toHaveTextContent(
      'Login — from:/perfil'
    );
  });

  it('muestra nombre, email, rol Cliente, contador del carrito y accesos rápidos', () => {
    mockAuthState = {
      user: {
        id: 'u-1',
        name: 'Camilo Desza',
        email: 'camilo@muebleria.com',
        role: 'user',
      },
      loading: false,
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderProfile({ cartCount: 2 });

    expect(
      screen.getByRole('heading', { name: 'Tu Perfil' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Camilo Desza')).toHaveLength(2);
    expect(screen.getByText('camilo@muebleria.com')).toBeInTheDocument();
    expect(screen.getAllByText('Cliente')).toHaveLength(2);
    expect(screen.getByText('CD')).toBeInTheDocument();
    expect(screen.getByText('2 ítems')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /mis pedidos/i })).toHaveAttribute(
      'href',
      '/mis-pedidos'
    );
    expect(screen.getByRole('link', { name: /mi carrito/i })).toHaveAttribute(
      'href',
      '/carrito'
    );
    expect(
      screen.queryByRole('link', { name: /panel de administración/i })
    ).not.toBeInTheDocument();
  });

  it('muestra el acceso al panel de administración cuando el rol es admin', () => {
    mockAuthState = {
      user: {
        id: 'u-admin',
        name: 'Laura Admin',
        email: 'admin@muebleria.com',
        role: 'admin',
      },
      loading: false,
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderProfile();

    expect(screen.getAllByText('Administrador')).toHaveLength(2);
    expect(
      screen.getByRole('link', { name: /panel de administración/i })
    ).toHaveAttribute('href', '/admin');
  });

  it('cierra sesión, muestra toast y redirige al inicio al pulsar Cerrar sesión', () => {
    mockAuthState = {
      user: {
        id: 'u-1',
        name: 'Camilo Desza',
        email: 'camilo@muebleria.com',
        role: 'user',
      },
      loading: false,
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      'Cerraste sesión correctamente.',
      'info'
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });
});
