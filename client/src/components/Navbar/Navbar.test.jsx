import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { CartContext } from '../../context/CartContext';

const mockLogout = jest.fn();
let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderNavbar = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <CartContext.Provider value={{ cartCount: 0 }}>
        <Navbar />
      </CartContext.Provider>
    </MemoryRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  it('muestra ingresar cuando no existe una sesion', () => {
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    };

    renderNavbar();

    expect(screen.getByRole('link', { name: /ingresar/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cerrar sesión' })
    ).not.toBeInTheDocument();
  });

  it('muestra el usuario y permite cerrar sesion', () => {
    mockAuthState = {
      user: { name: 'Franco Alegre' },
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderNavbar();

    expect(screen.getByText('Franco Alegre')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
  it('oculta Administración a un usuario común', () => {
    mockAuthState = {
      user: { name: 'Franco', role: 'user' },
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderNavbar();

    expect(
      screen.queryByRole('link', { name: 'Administración' })
    ).not.toBeInTheDocument();
  });

  it('muestra Administración a un administrador', () => {
    mockAuthState = {
      user: { name: 'Admin', role: 'admin' },
      isAuthenticated: true,
      logout: mockLogout,
    };

    renderNavbar();

    expect(
      screen.getByRole('link', { name: 'Administración' })
    ).toBeInTheDocument();
  });
});
