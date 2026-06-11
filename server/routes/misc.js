const router = require('express').Router();
const { db, uuidv4 } = require('../data/db');
const { auth, adminOnly, teacherOrAdmin } = require('../middleware/auth');

// SPORTS
router.get('/sports', auth, (req, res) => res.json(db.sports));
router.post('/sports', auth, teacherOrAdmin, (req, res) => {
  const id = 'SP' + String(db.sports.length + 1).padStart(3, '0');
  const newSport = { id, ...req.body, members: req.body.members || [], wins: 0, losses: 0 };
  db.sports.push(newSport);
  res.status(201).json(newSport);
});
router.put('/sports/:id', auth, teacherOrAdmin, (req, res) => {
  const idx = db.sports.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Sport not found' });
  db.sports[idx] = { ...db.sports[idx], ...req.body };
  res.json(db.sports[idx]);
});
router.delete('/sports/:id', auth, adminOnly, (req, res) => {
  const idx = db.sports.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Sport not found' });
  db.sports.splice(idx, 1);
  res.json({ message: 'Sport removed' });
});
router.post('/sports/:id/members', auth, teacherOrAdmin, (req, res) => {
  const sport = db.sports.find(s => s.id === req.params.id);
  if (!sport) return res.status(404).json({ message: 'Sport not found' });
  const { studentId } = req.body;
  if (!sport.members.includes(studentId)) sport.members.push(studentId);
  res.json(sport);
});

// SCHEMES OF WORK
router.get('/schemes', auth, (req, res) => res.json(db.schemes));
router.post('/schemes', auth, teacherOrAdmin, (req, res) => {
  const id = 'SCH' + String(db.schemes.length + 1).padStart(3, '0');
  const newScheme = { id, ...req.body, topics: req.body.topics || [] };
  db.schemes.push(newScheme);
  res.status(201).json(newScheme);
});
router.put('/schemes/:id', auth, teacherOrAdmin, (req, res) => {
  const idx = db.schemes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Scheme not found' });
  db.schemes[idx] = { ...db.schemes[idx], ...req.body };
  res.json(db.schemes[idx]);
});
router.delete('/schemes/:id', auth, teacherOrAdmin, (req, res) => {
  const idx = db.schemes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Scheme not found' });
  db.schemes.splice(idx, 1);
  res.json({ message: 'Scheme removed' });
});

// EVENTS
router.get('/events', auth, (req, res) => res.json(db.events));
router.post('/events', auth, teacherOrAdmin, (req, res) => {
  const id = 'EV' + String(db.events.length + 1).padStart(3, '0');
  db.events.push({ id, ...req.body });
  res.status(201).json(db.events[db.events.length - 1]);
});
router.put('/events/:id', auth, teacherOrAdmin, (req, res) => {
  const idx = db.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Event not found' });
  db.events[idx] = { ...db.events[idx], ...req.body };
  res.json(db.events[idx]);
});
router.delete('/events/:id', auth, adminOnly, (req, res) => {
  const idx = db.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Event not found' });
  db.events.splice(idx, 1);
  res.json({ message: 'Event removed' });
});

// ANNOUNCEMENTS
router.get('/announcements', auth, (req, res) => res.json(db.announcements));
router.post('/announcements', auth, teacherOrAdmin, (req, res) => {
  const id = 'ANN' + String(db.announcements.length + 1).padStart(3, '0');
  db.announcements.push({ id, ...req.body, date: new Date().toISOString().split('T')[0] });
  res.status(201).json(db.announcements[db.announcements.length - 1]);
});
router.delete('/announcements/:id', auth, adminOnly, (req, res) => {
  const idx = db.announcements.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Announcement not found' });
  db.announcements.splice(idx, 1);
  res.json({ message: 'Announcement removed' });
});

// DASHBOARD STATS
router.get('/dashboard', auth, (req, res) => {
  const totalStudents = db.students.length;
  const totalTeachers = db.teachers.length;
  const totalClasses = db.classes.length;
  const activeStudents = db.students.filter(s => s.status === 'Active').length;
  const gradeDistribution = { 9: 0, 10: 0, 11: 0, 12: 0 };
  db.students.forEach(s => { if (gradeDistribution[s.grade] !== undefined) gradeDistribution[s.grade]++; });
  const avgGPA = db.students.length ? (() => {
    const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };
    const total = db.grades.reduce((sum, g) => sum + (gradePoints[g.letterGrade] || 0), 0);
    return db.grades.length ? (total / db.grades.length).toFixed(2) : 0;
  })() : 0;
  const attendanceToday = db.attendance.filter(a => a.date === new Date().toISOString().split('T')[0]);
  res.json({ totalStudents, totalTeachers, totalClasses, activeStudents, gradeDistribution, avgGPA, sportsTeams: db.sports.length, upcomingEvents: db.events.filter(e => e.status === 'Upcoming').length });
});

module.exports = router;
