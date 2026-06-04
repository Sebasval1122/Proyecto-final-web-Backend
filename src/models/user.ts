import { v4 as uuidv4 } from 'uuid';
import { sql } from '../db';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: 'admin' | 'dealer' | 'user';
}

export async function createUser(email: string, passwordHash: string, name?: string, role: 'admin' | 'dealer' | 'user' = 'user'): Promise<User> {
  const id = uuidv4();
  const [user] = await sql<User[]>`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (${id}, ${email}, ${passwordHash}, ${name || null}, ${role})
    RETURNING id, email, password_hash AS "passwordHash", name, role
  `;
  return user as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql<User[]>`
    SELECT id, email, password_hash AS "passwordHash", name, role
    FROM users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;
  return (user as User) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const [user] = await sql<User[]>`
    SELECT id, email, password_hash AS "passwordHash", name, role
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return (user as User) ?? null;
}
