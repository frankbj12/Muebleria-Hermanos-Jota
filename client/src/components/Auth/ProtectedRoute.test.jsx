import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

describe('ProtectedRoute adminOnly', () => {
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
