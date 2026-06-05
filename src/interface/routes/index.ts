import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import authRoutes from './AuthRoutes';
import protectedRoutes from './ProtectedRoutes';

const router = Router();
const healthController = new HealthController();

router.get('/health', healthController.check);
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);

export default router;
