require('dotenv').config();
const { Pool } = require('pg');

// Prefer discrete DB env vars when explicitly configured.
// Otherwise parse a single DATABASE_URL.
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT?.trim();
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();
const dbFamily = Number.isInteger(Number(process.env.DB_FAMILY)) ? Number(process.env.DB_FAMILY) : null;
const dbSslEnv = process.env.DB_SSL?.trim()?.toLowerCase();
const connectionString = process.env.DATABASE_URL?.trim() || null;
const hasExplicitDbEnv = Boolean(dbHost && dbUser && dbPassword && dbName);

function shouldUseSslFromEnv() {
  if (dbSslEnv === 'false' || dbSslEnv === '0' || dbSslEnv === 'no') return false;
  if (dbSslEnv === 'true' || dbSslEnv === '1' || dbSslEnv === 'yes') return true;
  return undefined;
}

function makeSslConfig(useSsl) {
  if (useSsl === false) return false;
  return { rejectUnauthorized: false };
}

function isLocalHost(host) {
  return ['localhost', '127.0.0.1', '::1'].includes(host);
}

function parseDatabaseUrl(urlString) {
  const url = new URL(urlString);
  const sslmode = url.searchParams.get('sslmode')?.toLowerCase();
  const local = isLocalHost(url.hostname);
  let useSsl;

  if (sslmode === 'disable' || sslmode === 'false') useSsl = false;
  else if (sslmode === 'require' || sslmode === 'true') useSsl = true;
  else if (local) useSsl = false;
  else useSsl = true;

  return {
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: makeSslConfig(useSsl),
  };
}

let poolConfig;

if (hasExplicitDbEnv) {
  const specifiedSsl = shouldUseSslFromEnv();
  poolConfig = {
    host: dbHost,
    port: dbPort || 5432,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    ssl: makeSslConfig(specifiedSsl ?? !isLocalHost(dbHost)),
  };
} else if (connectionString) {
  try {
    poolConfig = parseDatabaseUrl(connectionString);
  } catch (err) {
    console.error('Failed to parse DATABASE_URL:', err.message);
    poolConfig = {
      connectionString,
      ssl: makeSslConfig(shouldUseSslFromEnv() ?? false),
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
