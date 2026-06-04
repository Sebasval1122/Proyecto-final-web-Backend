import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  role: 'admin' | 'dealer' | 'user';
}

const users: User[] = [];

export function createUser(email: string, passwordHash: string, name?: string, role: 'admin' | 'dealer' | 'user' = 'user'): User {
  const user: User = { id: uuidv4(), email, passwordHash, name, role };
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}
