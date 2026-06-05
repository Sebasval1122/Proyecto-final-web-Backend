import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const tokenService = new JwtService();

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = tokenService.verify(token);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
