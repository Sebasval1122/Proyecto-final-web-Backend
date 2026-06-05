import { Router } from 'express';
import { requireAuth } from '../middleware/AuthMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Solo admin
router.get('/admin', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ message: 'Hola admin' });
});

// Admin o dealer
router.get('/dealer-area', requireAuth, requireRole('admin', 'dealer'), (_req, res) => {
  res.json({ message: 'Zona de dealer' });
});

// Cualquier usuario autenticado
router.get('/profile', requireAuth, requireRole('admin', 'dealer', 'user'), (_req, res) => {
  res.json({ message: 'Perfil disponible' });
});

export default router;
