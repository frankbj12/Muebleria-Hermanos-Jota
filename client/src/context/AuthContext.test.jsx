import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  AuthProvider,
  AUTH_STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  useAuth,
} from './AuthContext';

function AuthHarness() {
  const { user, token, loading, login, register, logout, isAuthenticated } =
    useAuth();

  return (
    <div>
      <output data-testid="user">{user?.name || ''}</output>
      <output data-testid="token">{token || ''}</output>
      <output data-testid="loading">{String(loading)}</output>
      <output data-testid="authenticated">{String(isAuthenticated)}</output>
      <button
        type="button"
        onClick={() => login({ email: 'franco@test.com', password: '123456' })}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          register({
            name: 'Franco',
            email: 'franco@test.com',
            password: '123456',
          })
        }
      >
        Register
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
        }
      >
        Expire
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('restores a stored session through /api/auth/me', async () => {
    const apiBaseUrl = (
      process.env.REACT_APP_API_URL || 'http://localhost:5000'
    ).replace(/\/+$/, '');
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'valid-token',
        user: { id: '1', name: 'Usuario guardado', role: 'user' },
      })
    );
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user: { id: '1', name: 'Franco', email: 'f@test.com', role: 'user' },
      }),
    });

    renderAuth();

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('Franco');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/auth/me`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer valid-token' },
      })
    );
  });

  it('stores the user and token after login and clears them on logout', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user: { id: '1', name: 'Franco', email: 'f@test.com', role: 'user' },
        token: 'new-token',
      }),
    });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Franco'));
    expect(screen.getByTestId('token')).toHaveTextContent('new-token');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)).token).toBe(
      'new-token'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('registers a user through the public endpoint', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user: { id: '1', name: 'Franco', email: 'f@test.com', role: 'user' },
        token: 'registered-token',
      }),
    });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('registered-token')
    );
  });

  it('clears an expired token restored from localStorage', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'expired-token',
        user: { id: '1', name: 'Franco', role: 'user' },
      })
    );
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Token inválido o expirado' }),
    });

    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
