import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById, User } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me';
const TOKEN_EXPIRES_IN = '7d';

export async function register(email: string, password: string, name?: string, role: 'admin' | 'dealer' | 'user' = 'user'): Promise<User> {
  const existing = findUserByEmail(email);
  if (existing) throw new Error('User already exists');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return createUser(email, hash, name, role);
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = findUserByEmail(email);
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

export function getUserById(id: string): User | undefined {
  return findUserById(id);
}
