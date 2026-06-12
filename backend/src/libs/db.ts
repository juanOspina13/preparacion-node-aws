import { Pool } from 'pg';

// Initialized once per Lambda execution environment and reused across warm invocations.
// Keeping the pool outside the handler is the standard Lambda pattern to avoid
// creating a new TCP connection on every request.
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Lambda functions share one execution environment per concurrent invocation,
      // so a pool size of 1 prevents connection exhaustion on RDS.
      max: 1,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}
