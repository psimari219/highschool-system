const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/teachers',    require('./routes/teachers'));
app.use('/api/classes',     require('./routes/classes'));
app.use('/api/subjects',    require('./routes/subjects'));
app.use('/api/grades',      require('./routes/grades'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/sports',      require('./routes/sports'));
app.use('/api/schemes',     require('./routes/schemes'));
app.use('/api/timetable',   require('./routes/timetable'));
app.use('/api/enrollment',  require('./routes/enrollment'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/fees',        require('./routes/fees'));
app.use('/api/events',      require('./routes/events'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'High School System API Running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
