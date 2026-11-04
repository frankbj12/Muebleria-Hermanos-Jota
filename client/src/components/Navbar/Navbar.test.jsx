import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { CartContext } from '../../context/CartContext';

let mockAuthState;

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <CartContext.Provider value={{ cartCount: 0 }}>
        <Navbar />
      </CartContext.Provider>
    </MemoryRouter>
  );

describe('Navbar admin link', () => {
  it('oculta Administración a un usuario común', () => {
    mockAuthState = {
      isAuthenticated: true,
      user: { name: 'Franco', role: 'user' },
      logout: jest.fn(),
    };
    renderNavbar();
    expect(screen.queryByRole('link', { name: 'Administración' })).not.toBeInTheDocument();
  });

  it('muestra Administración a un administrador', () => {
    mockAuthState = {
      isAuthenticated: true,
      user: { name: 'Admin', role: 'admin' },
      logout: jest.fn(),
    };
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Administración' })).toBeInTheDocument();
  });
});
