import express from 'express';
import productosRouter from './routes/productos.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { loggerMiddleware } from './middlewares/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Configuración de CORS permisiva para desarrollo y respetando origen configurado
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    // Permitir el origen configurado o cualquier localhost en desarrollo
    if (
      origin === CLIENT_ORIGIN ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Rutas de productos: soporte para /api/productos y /productos según consignas y rúbrica
app.use('/api/productos', productosRouter);
app.use('/productos', productosRouter);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador centralizado de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});

export default app;
