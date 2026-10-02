import express from 'express';
import productosRouter from './routes/productos.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { loggerMiddleware } from './middlewares/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(express.json());
app.use(loggerMiddleware);
app.use((req, res, next) => {
  if (req.headers.origin === CLIENT_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    return res.sendStatus(204);
  }

  next();
});

app.use('/api/productos', productosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});
