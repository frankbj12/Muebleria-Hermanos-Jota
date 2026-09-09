// TODO (Sprint 03-04): Implementar manejador de errores centralizado y manejador de 404
export const errorHandler = (err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Error interno del servidor' });
};
