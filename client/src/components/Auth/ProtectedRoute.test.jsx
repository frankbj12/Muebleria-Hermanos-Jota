import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

describe('ProtectedRoute', () => {
  it('redirige a login cuando no hay sesión', () => {
    mockAuthState = { isAuthenticated: false, loading: false };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Contenido protegido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('permite el acceso con una sesión activa', () => {
    mockAuthState = { isAuthenticated: true, loading: false };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Contenido protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('espera mientras se restaura la sesión', () => {
    mockAuthState = { isAuthenticated: false, loading: true };

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Verificando sesión');
  });
});
