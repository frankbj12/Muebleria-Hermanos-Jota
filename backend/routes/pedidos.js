import { Router } from 'express';
import {
  createPedido,
  getMisPedidos,
  getAllPedidos,
  updatePedidoStatus,
} from '../controllers/pedidosController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = Router();

router.post('/', verifyToken, createPedido);
router.get('/mis-pedidos', verifyToken, getMisPedidos);

// Rutas de administrador
router.get('/admin/all', verifyToken, requireAdmin, getAllPedidos);
router.patch(
  '/admin/:id/status',
  verifyToken,
  requireAdmin,
  updatePedidoStatus
);

export default router;
