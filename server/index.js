const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = require('./config/postgres');

// Initialize database schema on startup
const initializeDatabase = require('./db-init');
initializeDatabase().catch(err => console.error('Database initialization failed:', err));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), database: 'PostgreSQL' }));

// Database connection test endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
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
// TODO: Add enrollment, dashboard, timetable, and fees routes
// app.use('/api/enrollment', require('./routes/enrollment'));
// app.use('/api/dashboard', require('./routes/dashboard'));
// app.use('/api/timetable', require('./routes/timetable'));
// app.use('/api/fees', require('./routes/fees'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`School Server running on port ${PORT} with PostgreSQL`));
