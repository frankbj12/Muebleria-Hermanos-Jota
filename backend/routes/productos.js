import { Router } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/productosController.js';

const router = Router();

// GET /api/productos: lista completa con soporte para filtros
router.get('/', getProductos);

// GET /api/productos/:id: producto por su identificador único (_id)
router.get('/:id', getProductoById);

// POST /api/productos: alta de un nuevo producto (responde 201)
router.post('/', createProducto);

// PUT /api/productos/:id: edición de un producto existente por su _id
router.put('/:id', updateProducto);

// DELETE /api/productos/:id: baja de un producto por su _id
router.delete('/:id', deleteProducto);

export default router;
