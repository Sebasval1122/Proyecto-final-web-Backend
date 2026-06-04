import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';
import authRoutes from './auth';
import protectedRoutes from './protected';

const router = Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);

export default router;
