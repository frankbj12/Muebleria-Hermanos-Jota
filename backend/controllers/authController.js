import User from '../models/User.js';

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
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};
