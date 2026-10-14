/**
 * Middleware centralizado para el manejo de errores.
 * Captura excepciones y envía una respuesta JSON coherente con el código de estado adecuado.
 */
export const errorHandler = (err, req, res, next) => {
  // Manejo de CastError de Mongoose (ej: ID con formato ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Identificador inválido: ${err.value}`,
    });
  }

  // Manejo de ValidationError de Mongoose (campos obligatorios o validaciones de esquema)
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({
      error: `Error de validación: ${mensajes}`,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Registrar error en servidor
  console.error(`[Error ${status}] ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    error: message,
  });
};
