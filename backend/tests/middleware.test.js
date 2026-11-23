import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import Product from '../models/Product.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import {
  generateTestToken,
  mockUserId,
  mockAdminId,
  mockProductId,
} from './helpers.js';

describe('Middlewares de Autenticación y Autorización', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Unidad: verifyToken', () => {
    it('debe responder con HTTP 401 si falta el header Authorization', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token no proporcionado',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con HTTP 401 si el esquema no es Bearer', () => {
      const req = { headers: { authorization: 'Basic some-token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token no proporcionado',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con HTTP 401 si el token es inválido o está manipulado', () => {
      const req = { headers: { authorization: 'Bearer token-invalido' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con HTTP 401 si el token ha expirado', () => {
      const expiredToken = generateTestToken(
        { id: mockUserId, role: 'user' },
        '-1s'
      );
      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe llamar a next() y adjuntar el payload en req.user si el token es válido', () => {
      const validToken = generateTestToken({ id: mockUserId, role: 'user' });
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(mockUserId);
      expect(req.user.role).toBe('user');
    });
  });

  describe('Unidad: requireAdmin', () => {
    it('debe responder con HTTP 403 si el usuario tiene rol regular (user)', () => {
      const req = { user: { id: mockUserId, role: 'user' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado: se requiere rol administrador',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe responder con HTTP 403 si req.user no existe o no tiene rol', () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe llamar a next() si el usuario tiene rol admin', () => {
      const req = { user: { id: mockAdminId, role: 'admin' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integración HTTP: Protección de Rutas (verifyToken + requireAdmin)', () => {
    it('debe responder con HTTP 401 al intentar crear un producto sin token', async () => {
      const res = await request(app).post('/api/productos').send({
        name: 'Mesa Roble',
        price: 25000,
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token no proporcionado');
    });

    it('debe responder con HTTP 403 al intentar crear un producto con rol user (sin permisos)', async () => {
      const userToken = generateTestToken({ id: mockUserId, role: 'user' });

      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Mesa Roble',
          price: 25000,
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty(
        'error',
        'Acceso denegado: se requiere rol administrador'
      );
    });

    it('debe permitir el acceso (HTTP 201) al crear un producto con rol admin', async () => {
      const adminToken = generateTestToken({ id: mockAdminId, role: 'admin' });

      jest.spyOn(Product, 'create').mockResolvedValue({
        _id: mockProductId,
        name: 'Mesa Roble',
        price: 25000,
        stock: 5,
      });

      const res = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mesa Roble',
          price: 25000,
          stock: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'Mesa Roble');
    });
  });
});
