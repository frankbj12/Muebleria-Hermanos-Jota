/**
 * Middleware de autorización de rol administrador.
 *
 * Debe usarse DESPUÉS de verifyToken, que ya garantiza que req.user existe.
 * Verifica que el usuario autenticado tenga role === 'admin'.
 *
 * Respuestas posibles:
 *   403 — usuario autenticado pero sin rol administrador
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ error: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
};
