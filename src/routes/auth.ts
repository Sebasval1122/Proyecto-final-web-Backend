import { Router, Request, Response } from 'express';
import { register, verifyCredentials, generateToken, getUserById } from '../services/authService';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validation/schemas';

const router = Router();

router.post('/register', validate({ body: registerSchema }), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await register(email, password, name, role);
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', validate({ body: loginSchema }), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await verifyCredentials(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

export default router;
