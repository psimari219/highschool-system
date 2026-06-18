const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const { pool, getDebugInfo } = require('./config/postgres');

// Initialize database schema on startup (Vercel: do this asynchronously, don't block)
const initializeDatabase = require('./db-init');
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // On Vercel, initialize DB in the background without blocking startup
  setImmediate(() => {
    initializeDatabase().catch(err => console.error('Database initialization failed:', err));
  });
} else if (process.env.NODE_ENV !== 'production') {
  // In local dev, wait for init
  initializeDatabase().catch(err => console.error('Database initialization failed:', err));
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), database: 'PostgreSQL' }));

// Database connection test endpoint
app.get('/api/db-status', async (req, res) => {
  const info = getDebugInfo();
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', timestamp: result.rows[0].now, host: info.host });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code || null,
      host: info.host,
      dbMode: info.mode,
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/sports', require('./routes/sports'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai-tools', require('./routes/ai-tools'));

// Serve client build in production when available (local deployment only)
if (process.env.NODE_ENV === 'production' && require.main === module) {
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not available' });
    }
  });
}

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`School Server running on port ${PORT} with PostgreSQL`));
}

module.exports = app;
