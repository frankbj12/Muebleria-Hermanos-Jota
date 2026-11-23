import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import User from '../models/User.js';
import { generateTestToken, mockUserId } from './helpers.js';

describe('Auth Endpoints (/api/auth)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un usuario exitosamente y responder con HTTP 201 y un token', async () => {
      const mockCreatedUser = {
        _id: { toString: () => mockUserId },
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
      };

      jest.spyOn(User, 'create').mockResolvedValue(mockCreatedUser);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toEqual({
        id: mockUserId,
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
      });
      expect(User.create).toHaveBeenCalledWith({
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        password: 'Password123!',
      });
    });

    it('debe responder con HTTP 409 cuando el email ya está registrado', async () => {
      const duplicateError = new Error('E11000 duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { email: 1 };

      jest.spyOn(User, 'create').mockRejectedValue(duplicateError);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Carlos Gomez',
        email: 'carlos.existente@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error', 'El email ya está registrado.');
    });

    it('debe responder con HTTP 400 ante datos faltantes o inválidos', async () => {
      // Contraseña demasiado corta (< 8 caracteres)
      const resCorta = await request(app).post('/api/auth/register').send({
        name: 'Carlos',
        email: 'carlos@example.com',
        password: '123',
      });
      expect(resCorta.status).toBe(400);
      expect(resCorta.body).toHaveProperty('error');

      // Email inválido
      const resEmailInvalido = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos',
          email: 'email-invalido',
          password: 'Password123!',
        });
      expect(resEmailInvalido.status).toBe(400);

      // Nombre faltante o vacío
      const resSinNombre = await request(app).post('/api/auth/register').send({
        name: '   ',
        email: 'carlos@example.com',
        password: 'Password123!',
      });
      expect(resSinNombre.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas y responder con HTTP 200', async () => {
      const mockFoundUser = {
        _id: { toString: () => mockUserId },
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
        password: '$2a$12$hashedPasswordExample',
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockFoundUser),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send({
        email: 'carlos@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: mockUserId,
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
      });
    });

    it('debe responder con HTTP 401 ante una contraseña incorrecta', async () => {
      const mockFoundUser = {
        _id: { toString: () => mockUserId },
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
        password: '$2a$12$hashedPasswordExample',
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockFoundUser),
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app).post('/api/auth/login').send({
        email: 'carlos@example.com',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas.');
    });

    it('debe responder con HTTP 401 si el usuario no existe', async () => {
      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'noexiste@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas.');
    });

    it('debe responder con HTTP 400 si no se envían credenciales o son inválidas', async () => {
      const resSinPass = await request(app).post('/api/auth/login').send({
        email: 'carlos@example.com',
      });
      expect(resSinPass.status).toBe(400);
      expect(resSinPass.body).toHaveProperty(
        'error',
        'Ingresá un email válido y una contraseña.'
      );

      const resSinEmail = await request(app).post('/api/auth/login').send({
        password: 'Password123!',
      });
      expect(resSinEmail.status).toBe(400);

      const resEmailInvalido = await request(app).post('/api/auth/login').send({
        email: 'correo-invalido',
        password: 'Password123!',
      });
      expect(resEmailInvalido.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe responder con HTTP 200 y los datos del usuario cuando el token es válido', async () => {
      const validToken = generateTestToken({ id: mockUserId, role: 'user' });

      const mockDbUser = {
        _id: { toString: () => mockUserId },
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
      };

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDbUser),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: mockUserId,
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'user',
      });
    });

    it('debe responder con HTTP 401 si no se envía token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token no proporcionado');
    });

    it('debe responder con HTTP 401 si el token es inválido o no tiene formato Bearer', async () => {
      const resFormatoInvalido = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Basic invalid-token');

      expect(resFormatoInvalido.status).toBe(401);
      expect(resFormatoInvalido.body).toHaveProperty(
        'error',
        'Token no proporcionado'
      );

      const resTokenCorrupto = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token.invalido.123');

      expect(resTokenCorrupto.status).toBe(401);
      expect(resTokenCorrupto.body).toHaveProperty(
        'error',
        'Token inválido o expirado'
      );
    });
  });
});
