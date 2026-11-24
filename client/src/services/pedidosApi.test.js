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

  it('crea un pedido con POST /api/pedidos enviando JWT e items normalizados', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'jwt-checkout-token', user: { id: 'u1' } })
    );

    const createdOrder = {
      _id: '6af24237e2cd1fbb5d6eb999',
      user: 'u1',
      items: [
        {
          productId: '6ace86682817cb7b9eb7a0e6',
          name: 'Butaca Mendoza',
          price: 890000,
          quantity: 2,
        },
      ],
      total: 1780000,
      status: 'pending',
      createdAt: '2026-11-17T18:00:00.000Z',
    };

    global.fetch.mockResolvedValue(jsonResponse({ order: createdOrder }, 201));

    const result = await pedidosApi.createOrder([
      {
        id: '6ace86682817cb7b9eb7a0e6',
        name: 'Butaca Mendoza',
        price: 890000,
        quantity: 2,
      },
    ]);

    expect(global.fetch).toHaveBeenCalledWith(PEDIDOS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer jwt-checkout-token',
      },
      body: JSON.stringify({
        items: [{ productId: '6ace86682817cb7b9eb7a0e6', quantity: 2 }],
      }),
    });
    expect(result).toEqual({
      ...createdOrder,
      id: '6af24237e2cd1fbb5d6eb999',
    });
  });

  it('propaga el error 400 de stock al crear un pedido', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(
        {
          error: 'Uno o más productos no existen o no tienen stock suficiente.',
        },
        400
      )
    );

    await expect(
      pedidosApi.createOrder([{ id: 'prod-1', quantity: 5 }])
    ).rejects.toMatchObject({
      message: 'Uno o más productos no existen o no tienen stock suficiente.',
      status: 400,
    });
  });

  it('obtiene todos los pedidos de todos los usuarios para admin [getAllOrders]', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'admin-jwt-token', user: { role: 'admin' } })
    );

    const apiOrders = [
      {
        _id: '6b04c008e5ae71044588986d',
        user: { name: 'Ramón', email: 'usuario@hermanosjota.com' },
        items: [
          { productId: 'p1', name: 'Aparador', price: 1890000, quantity: 1 },
        ],
        total: 1890000,
        status: 'pending',
        createdAt: '2026-11-23T22:36:56.844Z',
      },
    ];

    global.fetch.mockResolvedValue(jsonResponse(apiOrders));

    const orders = await pedidosApi.getAllOrders();

    expect(global.fetch).toHaveBeenCalledWith(`${PEDIDOS_URL}/admin/all`, {
      headers: {
        Authorization: 'Bearer admin-jwt-token',
      },
    });
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe('6b04c008e5ae71044588986d');
    expect(orders[0].user.name).toBe('Ramón');
  });

  it('actualiza el estado de un pedido como admin [updateOrderStatus]', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: 'admin-jwt-token', user: { role: 'admin' } })
    );

    const updatedOrder = {
      _id: '6b04c008e5ae71044588986d',
      user: { name: 'Ramón', email: 'usuario@hermanosjota.com' },
      items: [
        { productId: 'p1', name: 'Aparador', price: 1890000, quantity: 1 },
      ],
      total: 1890000,
      status: 'completed',
    };

    global.fetch.mockResolvedValue(jsonResponse(updatedOrder));

    const result = await pedidosApi.updateOrderStatus(
      '6b04c008e5ae71044588986d',
      'completed'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `${PEDIDOS_URL}/admin/6b04c008e5ae71044588986d/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-jwt-token',
        },
        body: JSON.stringify({ status: 'completed' }),
      }
    );
    expect(result.status).toBe('completed');
  });
});
