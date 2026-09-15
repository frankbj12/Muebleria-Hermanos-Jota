import { Router } from 'express';
import PRODUCTS from '../data/products.js';

const router = Router();

// GET /api/productos: devuelve el array completo de productos en formato JSON
router.get('/', (req, res, next) => {
  try {
    res.json(PRODUCTS);
  } catch (error) {
    next(error);
  }
});

// GET /api/productos/:id: busca el producto por id. Si existe, lo devuelve en JSON; si no, responde 404 con JSON de error
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = PRODUCTS.find((p) => p.id === Number(id));

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    next(error);
  }
});

export default router;
