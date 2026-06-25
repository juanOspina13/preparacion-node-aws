import mysql from 'mysql2/promise';

// Initialized once per Lambda execution environment and reused across warm invocations.
// Keeping the pool outside the handler is the standard Lambda pattern to avoid
// creating a new TCP connection on every request.
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Lambda: pool size of 1 prevents connection exhaustion on RDS.
      connectionLimit: 1,
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    });
  }
  return pool;
}
