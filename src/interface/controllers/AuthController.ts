import { Request, Response } from 'express';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { GetUserById } from '../../application/use-cases/GetUserById';
import { PostgresUserRepository } from '../../infrastructure/database/repositories/PostgresUserRepository';
import { BcryptHasher } from '../../infrastructure/security/BcryptHasher';
import { JwtService } from '../../infrastructure/security/JwtService';
import { AuthRequest } from '../middleware/AuthMiddleware';
import { toUserDTO } from '../../application/dtos/UserDTO';

const userRepository = new PostgresUserRepository();
const passwordHasher = new BcryptHasher();
const tokenService = new JwtService();

const registerUser = new RegisterUser(userRepository, passwordHasher);
const loginUser = new LoginUser(userRepository, passwordHasher, tokenService);
const getUserById = new GetUserById(userRepository);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      const user = await registerUser.execute({ email, password, name, role });
      const token = tokenService.generate({ sub: user.id, email: user.email, role: user.role });
      res.status(201).json({ token, user: toUserDTO(user) });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await loginUser.execute(email, password);
      if (!result) return res.status(401).json({ error: 'Invalid credentials' });
      res.json(result);
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async me(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const user = await getUserById.execute(req.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}
