const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/sports', require('./routes/sports'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/fees', require('./routes/fees'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`School Server running on port ${PORT}`));
