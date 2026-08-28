import postgres from 'postgres';
import { config } from '../../config';

export const sql = postgres(config.databaseUrl, {
  ssl: { rejectUnauthorized: false }
});

const requiredTables = [
  'users',
  'vehicles',
  'vehicle_images',
  'locations',
  'rentals',
  'bookings',
  'booking_status_history',
  'payments',
  'reviews',
  'favorites',
  'notifications',
  'availability_blocks'
];

export async function initDb() {
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  `;

  const existingTables = rows.map((row) => (row as { table_name: string }).table_name);
  const missingTables = requiredTables.filter(
    (table) => !existingTables.includes(table)
  );

  if (missingTables.length > 0) {
    throw new Error(
      `Faltan tablas en Supabase: ${missingTables.join(', ')}`
    );
  }

  console.log('Todas las tablas requeridas existen en Supabase.');
}
