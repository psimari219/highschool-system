require('dotenv').config();
const dns = require('dns');
const { Pool } = require('pg');

// Prefer discrete DB env vars when explicitly configured.
// Otherwise parse a single DATABASE_URL.
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT?.trim();
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD?.trim();
const dbSslEnv = process.env.DB_SSL?.trim()?.toLowerCase();
const connectionString = process.env.NEON_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || null;
const connectionSource = process.env.NEON_DATABASE_URL ? 'NEON_DATABASE_URL' : 'DATABASE_URL';
const dbFamilyEnv = process.env.DB_FAMILY?.trim();
let dbFamily = null;
if (dbFamilyEnv === '4' || dbFamilyEnv === '6') {
  dbFamily = Number(dbFamilyEnv);
}

const isNeonHost = Boolean(connectionString?.includes('.neon.tech') || dbHost?.includes('.neon.tech'));
if (isNeonHost && dbFamily !== 4) {
  dbFamily = 4;
  if (dbFamilyEnv === '6') {
    console.log('Neon host detected: overriding DB_FAMILY=6 to 4 because Vercel does not support outbound IPv6.');
  } else {
    console.log('Neon host detected: forcing DB_FAMILY=4 to prefer IPv4 on Vercel.');
  }
}

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

function createDnsLookupOverride(family) {
  if (!family) return undefined;

  if (family === 6) {
    return function(hostname, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      dns.resolve6(hostname, (err, addresses) => {
        if (err) return callback(err);
        if (!addresses || !addresses.length) {
          return callback(new Error('No IPv6 address found'));
        }
        callback(null, addresses[0], 6);
      });
    };
  }

  if (family === 4) {
    return function(hostname, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      dns.resolve4(hostname, (err, addresses) => {
        if (err) return callback(err);
        if (!addresses || !addresses.length) {
          return callback(new Error('No IPv4 address found'));
        }
        callback(null, addresses[0], 4);
      });
    };
  }

  return undefined;
}

function getEndpointIdFromHost(host) {
  if (!host) return null;
  return host.split('.')[0];
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

  const config = {
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: makeSslConfig(useSsl),
    connectionString: urlString,
  };

  if (Boolean(url.hostname?.includes('.neon.tech'))) {
    const endpointId = getEndpointIdFromHost(url.hostname);
    if (endpointId) {
      config.options = `endpoint=${endpointId}`;
      console.log(`Neon endpoint ID added to connection config: ${endpointId}`);
    }
  }

  return config;
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
      ssl: makeSslConfig(shouldUseSslFromEnv() ?? true),
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

if (dbFamily) {
  poolConfig.family = dbFamily;
}

async function resolveHostForFamily(config) {
  if (!config.host || !dbFamily) {
    return dbFamily ? { ...config, family: dbFamily } : config;
  }
  if (dbFamily !== 4 && dbFamily !== 6) return config;

  try {
    const lookupFunc = dbFamily === 6 ? dns.resolve6 : dns.resolve4;
    const addresses = await new Promise((resolve, reject) => {
      lookupFunc(config.host, (err, addrs) => {
        if (err) return reject(err);
        resolve(addrs);
      });
    });
    if (!addresses || !addresses.length) {
      throw new Error(`No IPv${dbFamily} address found for ${config.host}`);
    }
    const resolvedHost = addresses[0];
    console.log(`Resolved ${config.host} to ${resolvedHost} using IPv${dbFamily}`);
    return { ...config, host: resolvedHost, family: dbFamily };
  } catch (err) {
    console.error('DNS resolution for DB_FAMILY failed:', err.message);
    return { ...config, family: dbFamily };
  }
}

const debugConfig = {
  connectionSource,
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  family: poolConfig.family || dbFamily,
  isNeonHost,
  connectionString: connectionString ? connectionString.replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@.*)/, '$1***$3') : null,
};
console.log('Postgres configuration:', debugConfig);

const poolPromise = (async () => {
  const finalConfig = await resolveHostForFamily(poolConfig);
  console.log('Final pool config host:', finalConfig.host, 'family:', finalConfig.family);
  return new Pool(finalConfig);
})();

let pool;

poolPromise.then((p) => {
  pool = p;
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL');
  });
}).catch((err) => {
  console.error('Failed to initialize PostgreSQL pool', err);
});

async function getPool() {
  if (pool) return pool;
  return poolPromise;
}

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
    family: poolConfig.family || dbFamily || null,
    connectionSource,
    hasConnectionString: Boolean(connectionString),
    connectionString: connectionString ? maskConnectionString(connectionString) : null,
  };
}

module.exports = {
  getPool,
  getDebugInfo,
  poolPromise,
};
