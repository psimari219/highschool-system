require('dotenv').config();
const { Pool } = require('pg');

// Prefer a single DATABASE_URL (e.g. Supabase) if provided.
// Fallback to individual env vars for local development.
const connectionString = process.env.DATABASE_URL || null;

let poolConfig;
if (connectionString) {
  // For hosted Postgres providers (Supabase) SSL is required.
  poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'highschool_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL');
});

module.exports = pool;
