import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getMe } from '../controllers/authController.js';

const router = Router();

// GET /api/auth/me — restaura la sesión del usuario autenticado
router.get('/me', verifyToken, getMe);

export default router;
