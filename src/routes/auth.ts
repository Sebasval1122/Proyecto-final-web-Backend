import { Router, Request, Response } from 'express';
import { register, verifyCredentials, generateToken, getUserById } from '../services/authService';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    // Nota: permitir role desde registro es inseguro en producción.
    const user = await register(email, password, name, role);
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name });
});

export default router;
