import { Router } from 'express';
import {
  createPedido,
  getMisPedidos,
} from '../controllers/pedidosController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.post('/', verifyToken, createPedido);
router.get('/mis-pedidos', verifyToken, getMisPedidos);

export default router;
