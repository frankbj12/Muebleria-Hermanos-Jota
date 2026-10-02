import { Router } from 'express';
import {
  getProductos,
  getProductoById,
} from '../controllers/productosController.js';

const router = Router();

// GET /api/productos (o /productos): devuelve el listado completo de productos
router.get('/', getProductos);

// GET /api/productos/:id (o /productos/:id): busca y devuelve un producto por id
router.get('/:id', getProductoById);

export default router;
