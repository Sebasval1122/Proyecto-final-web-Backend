import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './AuthMiddleware';

export function requireRole(...allowedRoles: Array<'admin' | 'dealer' | 'user'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.userRole;
    if (!role) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}
