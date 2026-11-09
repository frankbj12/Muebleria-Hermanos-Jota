import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DevUserSwitcher from './DevUserSwitcher';
import { AuthContext } from '../../context/AuthContext';

describe('DevUserSwitcher Component', () => {
  const mockSwitchUser = jest.fn();

  const renderComponent = (authState) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ ...authState, switchUser: mockSwitchUser }}
        >
          <DevUserSwitcher />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    mockSwitchUser.mockClear();
  });

  test('renderiza el botón flotante minimizado con el rol actual', () => {
    renderComponent({
      isAuthenticated: false,
      user: null,
    });

    const trigger = screen.getByRole('button', { name: /abrir selector/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('Invitado')).toBeInTheDocument();
  });

  test('permite abrir el panel y cambiar al rol admin', () => {
    renderComponent({
      isAuthenticated: false,
      user: null,
    });

    const trigger = screen.getByRole('button', { name: /abrir selector/i });
    fireEvent.click(trigger);

    expect(screen.getByText('🛠️ Selector de Usuario')).toBeInTheDocument();

    const adminBtn = screen.getByRole('button', {
      name: /administrador \(role: 'admin'\)/i,
    });
    fireEvent.click(adminBtn);

    expect(mockSwitchUser).toHaveBeenCalledWith('admin');
  });

  test('permite cambiar a invitado (cerrar sesión)', () => {
    renderComponent({
      isAuthenticated: true,
      user: { name: 'Admin Test', role: 'admin' },
    });

    const trigger = screen.getByRole('button', { name: /abrir selector/i });
    fireEvent.click(trigger);

    const guestBtn = screen.getByRole('button', {
      name: /invitado \(desconectado\)/i,
    });
    fireEvent.click(guestBtn);

    expect(mockSwitchUser).toHaveBeenCalledWith('guest');
  });
});
