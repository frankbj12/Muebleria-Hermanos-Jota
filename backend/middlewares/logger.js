// TODO (Sprint 03-04): Implementar middleware personalizado de logging (método HTTP y URL)
export const loggerMiddleware = (req, res, next) => {
  next();
};
