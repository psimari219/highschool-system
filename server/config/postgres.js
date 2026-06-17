require('dotenv').config();
const { Pool } = require('pg');

// Prefer discrete DB env vars when explicitly configured.
// Otherwise use a single DATABASE_URL (e.g. Supabase).
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT?.trim();
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();
const connectionString = process.env.DATABASE_URL?.trim() || null;
const hasExplicitDbEnv = dbHost && dbUser && dbPassword && dbName;

let poolConfig;
if (hasExplicitDbEnv) {
  poolConfig = {
    host: dbHost,
    port: dbPort || 5432,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else if (connectionString) {
  // For hosted Postgres providers (Supabase) SSL is required.
  poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  poolConfig = {
    host: dbHost || 'localhost',
    port: dbPort || 5432,
    database: dbName || 'highschool_system',
    user: dbUser || 'postgres',
    password: dbPassword || '',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL');
});

function maskConnectionString(conn) {
  return conn.replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@.*)/, '$1***$3');
}

function getDebugInfo() {
  const explicit = hasExplicitDbEnv;
  const mode = explicit ? 'explicit' : connectionString ? 'connectionString' : 'defaults';
  return {
    mode,
    host: poolConfig.host || null,
    port: poolConfig.port || null,
    database: poolConfig.database || null,
    user: poolConfig.user || null,
    hasConnectionString: Boolean(connectionString),
    connectionString: connectionString ? maskConnectionString(connectionString) : null,
  };
}

module.exports = {
  pool,
  getDebugInfo,
};
