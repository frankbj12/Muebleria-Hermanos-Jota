import jwt from 'jsonwebtoken';

/**
 * Middleware de verificación de JWT (Bearer).
 *
 * Extrae el token del header Authorization, lo verifica con JWT_SECRET
 * y adjunta el payload decodificado en req.user para que esté disponible
 * en los controladores que sigan en la cadena.
 *
 * Respuestas posibles:
 *   401 — falta el header / formato incorrecto / token inválido / token expirado
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7); // quitar "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
