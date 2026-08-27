export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'please-change-me-in-production',
  databaseUrl: process.env.DATABASE_URL || buildDatabaseUrl(),

  get isProduction() {
    return this.nodeEnv === 'production';
  },

  get dbHost() {
    // Extraer host de DATABASE_URL o construir desde componentes individuales
    try {
      const url = new URL(this.databaseUrl);
      return url.hostname;
    } catch {
      return process.env.DB_HOST || 'unknown';
    }
  }
};

function buildDatabaseUrl(): string {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '5432';
  const name = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !name || !user || !password) {
    console.warn('⚠️  Falta configuración de base de datos. Usa DATABASE_URL completa o define DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.');
    return '';
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
}
