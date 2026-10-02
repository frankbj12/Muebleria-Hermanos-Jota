/**
 * Middleware centralizado para el manejo de errores.
 * Captura excepciones y envía una respuesta JSON coherente con el código de estado adecuado.
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Registrar error en servidor
  console.error(`[Error ${status}] ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    error: message,
  });
};
