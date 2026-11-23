export const loggerMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
};
