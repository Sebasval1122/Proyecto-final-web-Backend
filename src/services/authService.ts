import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById, User } from '../models/user';
import { config } from '../config';

const JWT_SECRET = config.jwtSecret;
const TOKEN_EXPIRES_IN = '7d';

export async function register(email: string, password: string, name?: string, role: 'admin' | 'dealer' | 'user' = 'user'): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('User already exists');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return createUser(email, hash, name, role);
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function generateToken(user: User): string {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): { sub: string; email: string; role?: string } {
  return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role?: string };
}

export async function getUserById(id: string): Promise<User | null> {
  return findUserById(id);
}
