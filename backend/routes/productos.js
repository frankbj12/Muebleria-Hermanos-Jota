import { Router } from 'express';
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/productosController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = Router();

// GET /api/productos: lista completa con soporte para filtros (público)
router.get('/', getProductos);

// GET /api/productos/:id: producto por su identificador único (_id) (público)
router.get('/:id', getProductoById);

// POST /api/productos: alta de un nuevo producto — requiere admin (responde 201)
router.post('/', verifyToken, requireAdmin, createProducto);

// PUT /api/productos/:id: edición de un producto existente — requiere admin
router.put('/:id', verifyToken, requireAdmin, updateProducto);

// DELETE /api/productos/:id: baja de un producto — requiere admin
router.delete('/:id', verifyToken, requireAdmin, deleteProducto);

export default router;
