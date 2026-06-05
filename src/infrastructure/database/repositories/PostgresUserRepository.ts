import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { sql } from '../postgres';

export class PostgresUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const [createdUser] = await sql<User[]>`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.name || null}, ${user.role})
      RETURNING id, email, password_hash AS "passwordHash", name, role
    `;
    return createdUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT id, email, password_hash AS "passwordHash", name, role
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT id, email, password_hash AS "passwordHash", name, role
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return user || null;
  }
}
