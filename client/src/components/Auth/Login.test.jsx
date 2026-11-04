import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';

const mockLogin = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    loading: false,
  }),
}));

function LocationOutput() {
  const location = useLocation();
  return <div>{`${location.pathname}${location.search}${location.hash}`}</div>;
}

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockLogin.mockResolvedValue({});
  });

  it('vuelve a la ruta protegida solicitada después de ingresar', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/login',
            state: {
              from: {
                pathname: '/admin/crear-producto',
                search: '?origen=prueba',
                hash: '',
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/crear-producto" element={<LocationOutput />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'franco@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'franco@test.com',
        password: '123456',
      });
    });
    expect(await screen.findByText('/admin/crear-producto?origen=prueba')).toBeInTheDocument();
  });
});
