import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

const connectionString = process.env.DATABASE_URL || (() => {
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT || '5432'
  const database = process.env.DB_NAME
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD

  if (!host || !database || !user || password === undefined) {
    throw new Error('Missing database connection environment variables')
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
})()

const sql = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false
  }
})

export default sql