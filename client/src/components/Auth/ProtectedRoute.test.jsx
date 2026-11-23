import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

describe('ProtectedRoute adminOnly', () => {
  it('redirige a login preservando la ruta, query y fragmento solicitados', () => {
    mockAuthState = {
      isAuthenticated: false,
      loading: false,
      user: null,
    };

    function LoginLocation() {
      const location = useLocation();

      return (
        <output data-testid="requested-location">
          {JSON.stringify(location.state?.from)}
        </output>
      );
    }

    render(
      <MemoryRouter initialEntries={['/mis-pedidos?estado=pendiente#reciente']}>
        <Routes>
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <div>Mis pedidos</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginLocation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      JSON.parse(screen.getByTestId('requested-location').textContent)
    ).toMatchObject({
      pathname: '/mis-pedidos',
      search: '?estado=pendiente',
      hash: '#reciente',
    });
  });

  it('mantiene la ruta protegida mientras verifica una sesión guardada', () => {
    mockAuthState = {
      isAuthenticated: false,
      loading: true,
      user: null,
    };

    render(
      <MemoryRouter initialEntries={['/mis-pedidos']}>
        <Routes>
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <div>Mis pedidos</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Verificando sesión...'
    );
  });

  it('redirige al inicio a un usuario común', () => {
    mockAuthState = {
      isAuthenticated: true,
      loading: false,
      user: { role: 'user' },
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Panel administrador</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Inicio</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('permite el acceso a un administrador', () => {
    mockAuthState = {
      isAuthenticated: true,
      loading: false,
      user: { role: 'admin' },
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Panel administrador</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel administrador')).toBeInTheDocument();
  });
});
