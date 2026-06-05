import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/AuthMiddleware';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/schemas';

const router = Router();
const authController = new AuthController();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
