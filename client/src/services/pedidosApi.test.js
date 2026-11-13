import pedidosApi from './pedidosApi';
import { AUTH_STORAGE_KEY } from './apiClient';

const configuredApiUrl = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
const BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/productos$/, '')
  : 'http://localhost:5000';
const PEDIDOS_URL = `${BASE_URL}/api/pedidos`;

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 401 ? 'Unauthorized' : 'OK',
  headers: { get: () => 'application/json' },
  json: jest.fn().mockResolvedValue(body),
});

describe('pedidosApi', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('obtiene los pedidos del usuario autenticado y normaliza sus campos', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'jwt-secret-token', user: { id: 'u1' } })
    );

    const apiOrders = [
      {
        _id: '6af24237e2cd1fbb5d6eb639',
        user: 'u1',
        items: [
          {
            productId: 'prod-1',
            name: 'Aparador Uspallata',
            price: 1890000,
            quantity: 1,
          },
        ],
        total: 1890000,
        status: 'pending',
        createdAt: '2026-11-09T21:59:19.766Z',
      },
    ];
    global.fetch.mockResolvedValue(jsonResponse(apiOrders));

    const controller = new AbortController();
    const result = await pedidosApi.getMyOrders({ signal: controller.signal });

    expect(global.fetch).toHaveBeenCalledWith(`${PEDIDOS_URL}/mis-pedidos`, {
      signal: controller.signal,
      headers: { Authorization: 'Bearer jwt-secret-token' },
    });
    expect(result).toEqual([
      {
        ...apiOrders[0],
        id: '6af24237e2cd1fbb5d6eb639',
      },
    ]);
  });

  it('soporta respuestas envueltas en { orders } y devuelve lista vacía si no hay datos', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({
        orders: [
          {
            id: 'ord-2',
            items: [],
            total: 50000,
            status: 'completed',
          },
        ],
      })
    );

    const result = await pedidosApi.getMyOrders();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ord-2');
    expect(result[0].status).toBe('completed');
  });

  it('propaga el error del servidor si la API rechaza la consulta', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({ error: 'Token inválido o expirado' }, 401)
    );

    await expect(pedidosApi.getMyOrders()).rejects.toThrow(
      'Token inválido o expirado'
    );
  });
});
