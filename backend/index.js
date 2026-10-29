import 'dotenv/config'; // Primera línea para garantizar carga de variables
import express from 'express';
import { connectDB } from './config/db.js';
import productosRouter from './routes/productos.js';
import uploadRouter from './routes/upload.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { loggerMiddleware } from './middlewares/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;
const rawClientOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const CLIENT_ORIGIN = rawClientOrigin.replace(/\/$/, ''); // Normalizar quitando trailing slash

// Conectar a la base de datos
connectDB();

// Middlewares globales
app.use(express.json());
app.use(loggerMiddleware);

// Middleware de CORS robustecido
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      normalizedOrigin === CLIENT_ORIGIN ||
      /^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin) ||
      /\.vercel\.app$/.test(normalizedOrigin) // Permite previsualizaciones de Vercel
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

// Ruta de comprobación de salud (Healthcheck)
app.use('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Rutas de subida de imágenes a la nube (Vercel Blob)
app.use('/api/upload', uploadRouter);

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
