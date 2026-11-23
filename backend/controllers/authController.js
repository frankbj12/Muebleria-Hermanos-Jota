import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtExpiresIn, getJwtSecret } from '../config/jwt.js';

const getPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user, secret) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, secret, {
    expiresIn: getJwtExpiresIn(),
  });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const register = async (req, res, next) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !isValidEmail(email.trim()) ||
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      error:
        'Ingresá nombre, email válido y una contraseña de entre 8 y 72 bytes.',
    });
  }

  try {
    const secret = getJwtSecret();
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    const token = createToken(user, secret);

    return res.status(201).json({ user: getPublicUser(user), token });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    return next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    !isValidEmail(email.trim()) ||
    typeof password !== 'string' ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: 'Ingresá un email válido y una contraseña.' });
  }

  try {
    const secret = getJwtSecret();
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = createToken(user, secret);

    return res.status(200).json({ user: getPublicUser(user), token });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/me
 *
 * Restaura la sesión del usuario a partir del token JWT ya verificado.
 * req.user es inyectado por el middleware verifyToken.
 *
 * Responde con los datos públicos del usuario (sin contraseña).
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};
