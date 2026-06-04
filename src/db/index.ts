import postgres from 'postgres';
import { config } from '../config';

export const sql = postgres(config.databaseUrl, {
  ssl: { rejectUnauthorized: false }
});

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'dealer', 'user')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
}
