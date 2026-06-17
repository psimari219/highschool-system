require('dotenv').config();
const { Pool } = require('pg');

// Prefer discrete DB env vars when explicitly configured.
// Otherwise parse a single DATABASE_URL (e.g. Supabase).
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT?.trim();
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();
const dbFamily = Number.isInteger(Number(process.env.DB_FAMILY)) ? Number(process.env.DB_FAMILY) : null;
const connectionString = process.env.DATABASE_URL?.trim() || null;
const hasExplicitDbEnv = Boolean(dbHost && dbUser && dbPassword && dbName);

let poolConfig;

if (hasExplicitDbEnv) {
  poolConfig = {
    host: dbHost,
    port: dbPort || 5432,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
  };
} else if (connectionString) {
  // Parse CONNECTION_URL to extract components and avoid IPv6-only hostname issues
  try {
    const url = new URL(connectionString);
    poolConfig = {
      host: url.hostname,
      port: Number(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false },
    };
    // Force IPv4 for Supabase on Vercel
    poolConfig.family = 4;
    console.log('✓ Parsed DATABASE_URL into explicit connection parameters with family=4');
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
    poolConfig = {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }
} else {
  poolConfig = {
    host: dbHost || 'localhost',
    port: dbPort || 5432,
    database: dbName || 'highschool_system',
    user: dbUser || 'postgres',
    password: dbPassword || '',
  };
}

// Apply DB_FAMILY override if set
if ((dbFamily === 4 || dbFamily === 6) && !connectionString) {
  poolConfig.family = dbFamily;
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
    family: poolConfig.family || null,
    hasConnectionString: Boolean(connectionString),
    connectionString: connectionString ? maskConnectionString(connectionString) : null,
  };
}

module.exports = {
  pool,
  getDebugInfo,
};
