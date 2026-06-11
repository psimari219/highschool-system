const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

router.get('/', auth, (req, res) => {
  const teachers = db.teachers.map(t => ({
    ...t,
    class: db.classes.find(c => c.id === t.classId),
    subjectNames: t.subjects.map(sId => db.subjects.find(s => s.id === sId)?.name).filter(Boolean),
    studentCount: db.students.filter(s => s.classId === t.classId).length
  }));
  res.json(teachers);
});

router.get('/:id', auth, (req, res) => {
  const teacher = db.teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Not found' });
  const classes = db.classes.filter(c => c.teacherId === teacher.id);
  const timetable = db.timetable.filter(t => t.teacherId === teacher.id);
  res.json({ ...teacher, classes, timetable });
});

router.post('/', auth, async (req, res) => {
  const teacher = { id: uuidv4(), employeeId: `TCH${String(db.teachers.length + 1).padStart(3, '0')}`, ...req.body, status: 'active' };
  db.teachers.push(teacher);
  // Create user account
  const hashedPwd = await bcrypt.hash('teacher123', 10);
  db.users.push({ id: uuidv4(), username: teacher.email.split('@')[0], password: hashedPwd, role: 'teacher', name: `${teacher.firstName} ${teacher.lastName}`, email: teacher.email, teacherId: teacher.id });
  res.status(201).json(teacher);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.teachers[idx] = { ...db.teachers[idx], ...req.body };
  res.json(db.teachers[idx]);
});

router.delete('/:id', auth, (req, res) => {
  const idx = db.teachers.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.teachers[idx].status = 'inactive';
  res.json({ message: 'Deactivated' });
});

module.exports = router;
