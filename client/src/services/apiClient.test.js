import {
  AUTH_STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  apiRequest,
  getApiBaseUrl,
} from './apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the shared API base URL', () => {
    const configuredUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
    expect(getApiBaseUrl()).toBe(configuredUrl || 'http://localhost:5000');
  });

  it('adds the stored Bearer token to protected requests', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'session-token', user: { id: '1' } })
    );
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    });

    await apiRequest('/api/pedidos');

    expect(fetch).toHaveBeenCalledWith(
      `${getApiBaseUrl()}/api/pedidos`,
      { headers: { Authorization: 'Bearer session-token' } }
    );
  });

  it('dispatches the unauthorized event for a 401 response', async () => {
    const listener = jest.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Token inválido' }),
    });

    await expect(apiRequest('/api/auth/me')).rejects.toMatchObject({
      status: 401,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});
