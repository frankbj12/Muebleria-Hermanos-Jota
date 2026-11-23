import { Router } from 'express';
import { loginRateLimiter } from '../middlewares/loginRateLimiter.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getMe, login, register } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, login);

// GET /api/auth/me — restaura la sesión del usuario autenticado
router.get('/me', verifyToken, getMe);

export default router;
