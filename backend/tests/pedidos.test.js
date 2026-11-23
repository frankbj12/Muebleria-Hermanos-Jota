import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import {
  generateTestToken,
  mockUserId,
  mockProductId,
  mockProductId2,
  createMockSession,
} from './helpers.js';

describe('Pedidos Endpoints (/api/pedidos)', () => {
  let mockSession;

  beforeEach(() => {
    mockSession = createMockSession();
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/pedidos (Creación de pedidos)', () => {
    const validToken = generateTestToken({ id: mockUserId, role: 'user' });

    it('debe responder con HTTP 401 si no se envía token de autenticación', async () => {
      const res = await request(app)
        .post('/api/pedidos')
        .send({
          items: [{ productId: mockProductId, quantity: 1 }],
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token no proporcionado');
      expect(mongoose.startSession).not.toHaveBeenCalled();
    });

    it('debe responder con HTTP 400 si el body no contiene items o la lista está vacía', async () => {
      const resSinItems = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(resSinItems.status).toBe(400);
      expect(resSinItems.body).toHaveProperty(
        'error',
        'El pedido debe contener productos válidos.'
      );

      const resArrayVacio = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ items: [] });

      expect(resArrayVacio.status).toBe(400);
      expect(resArrayVacio.body).toHaveProperty(
        'error',
        'El pedido debe contener productos válidos.'
      );
    });

    it('debe responder con HTTP 400 ante items con productId inválido o cantidad no permitida', async () => {
      // ProductId no tiene formato ObjectId de 24 hex
      const resIdInvalido = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [{ productId: 'id-invalido', quantity: 2 }],
        });

      expect(resIdInvalido.status).toBe(400);
      expect(resIdInvalido.body).toHaveProperty(
        'error',
        'Cada producto debe tener un productId válido y una cantidad entera mayor a cero.'
      );

      // Cantidad menor a 1
      const resCantidadCero = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [{ productId: mockProductId, quantity: 0 }],
        });

      expect(resCantidadCero.status).toBe(400);

      // Cantidad no entera
      const resCantidadDecimal = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [{ productId: mockProductId, quantity: 2.5 }],
        });

      expect(resCantidadDecimal.status).toBe(400);
    });

    it('debe responder con HTTP 401 si el usuario autenticado no existe en la base de datos', async () => {
      jest.spyOn(User, 'exists').mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [{ productId: mockProductId, quantity: 1 }],
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado.');
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('debe rechazar el pedido (HTTP 400) cuando no hay stock suficiente y no crear la orden', async () => {
      jest.spyOn(User, 'exists').mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: mockUserId }),
      });

      // Product.findOneAndUpdate devuelve null porque stock < quantity
      jest.spyOn(Product, 'findOneAndUpdate').mockResolvedValue(null);
      const orderCreateSpy = jest.spyOn(Order, 'create');

      const res = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [{ productId: mockProductId, quantity: 99 }],
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        'error',
        'Uno o más productos no existen o no tienen stock suficiente.'
      );
      // Verifica que no se haya llamado a crear la orden
      expect(orderCreateSpy).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('debe crear el pedido exitosamente (HTTP 201), descontar stock y calcular el total', async () => {
      jest.spyOn(User, 'exists').mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: mockUserId }),
      });

      const mockProduct1 = {
        _id: mockProductId,
        name: 'Mesa Comedor Roble',
        price: 15000,
        stock: 8, // stock después del descuento
      };
      const mockProduct2 = {
        _id: mockProductId2,
        name: 'Silla Tapizada',
        price: 5000,
        stock: 3,
      };

      jest
        .spyOn(Product, 'findOneAndUpdate')
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);

      const mockCreatedOrder = {
        _id: '507f1f77bcf86cd799439099',
        user: mockUserId,
        items: [
          {
            productId: mockProductId,
            name: 'Mesa Comedor Roble',
            price: 15000,
            quantity: 1,
          },
          {
            productId: mockProductId2,
            name: 'Silla Tapizada',
            price: 5000,
            quantity: 2,
          },
        ],
        total: 25000, // 15000*1 + 5000*2
        status: 'pending',
      };

      const orderCreateSpy = jest
        .spyOn(Order, 'create')
        .mockResolvedValue([mockCreatedOrder]);

      const res = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [
            { productId: mockProductId, quantity: 1 },
            { productId: mockProductId2, quantity: 2 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('order');
      expect(res.body.order.total).toBe(25000);
      expect(res.body.order.items).toHaveLength(2);

      // Verificar que se invocó Order.create con el total y items calculados
      expect(orderCreateSpy).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            total: 25000,
            items: expect.arrayContaining([
              expect.objectContaining({
                productId: mockProductId,
                quantity: 1,
                price: 15000,
              }),
              expect.objectContaining({
                productId: mockProductId2,
                quantity: 2,
                price: 5000,
              }),
            ]),
          }),
        ],
        expect.any(Object)
      );

      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('debe combinar cantidades de items repetidos con el mismo productId', async () => {
      jest.spyOn(User, 'exists').mockReturnValue({
        session: jest.fn().mockResolvedValue({ _id: mockUserId }),
      });

      const mockProduct = {
        _id: mockProductId,
        name: 'Mesa Comedor Roble',
        price: 15000,
        stock: 5,
      };

      const findOneAndUpdateSpy = jest
        .spyOn(Product, 'findOneAndUpdate')
        .mockResolvedValue(mockProduct);

      const mockCreatedOrder = {
        _id: '507f1f77bcf86cd799439099',
        user: mockUserId,
        items: [
          {
            productId: mockProductId,
            name: 'Mesa Comedor Roble',
            price: 15000,
            quantity: 3, // 1 + 2 combinados
          },
        ],
        total: 45000,
        status: 'pending',
      };

      jest.spyOn(Order, 'create').mockResolvedValue([mockCreatedOrder]);

      const res = await request(app)
        .post('/api/pedidos')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          items: [
            { productId: mockProductId, quantity: 1 },
            { productId: mockProductId, quantity: 2 },
          ],
        });

      expect(res.status).toBe(201);
      // findOneAndUpdate debe llamarse una sola vez con cantidad consolidada 3
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { _id: mockProductId, stock: { $gte: 3 } },
        { $inc: { stock: -3 } },
        expect.any(Object)
      );
    });
  });

  describe('GET /api/pedidos/mis-pedidos (Historial de pedidos)', () => {
    const validToken = generateTestToken({ id: mockUserId, role: 'user' });

    it('debe responder con HTTP 401 si no se envía token', async () => {
      const res = await request(app).get('/api/pedidos/mis-pedidos');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token no proporcionado');
    });

    it('debe responder con HTTP 200 y la lista de pedidos del usuario autenticado', async () => {
      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439088',
          user: mockUserId,
          items: [
            {
              productId: mockProductId,
              name: 'Mesa Roble',
              price: 15000,
              quantity: 1,
            },
          ],
          total: 15000,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ];

      jest.spyOn(Order, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      const res = await request(app)
        .get('/api/pedidos/mis-pedidos')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].total).toBe(15000);
    });
  });
});
