import express from 'express';
import productosRouter from './routes/productos.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { loggerMiddleware } from './middlewares/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(loggerMiddleware);

app.use('/api/productos', productosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});
