const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => {
  const classes = db.classes.map(c => ({
    ...c,
    teacher: db.teachers.find(t => t.id === c.teacherId),
    studentCount: db.students.filter(s => s.classId === c.id && s.status === 'active').length,
  }));
  res.json(classes);
});

router.get('/:id', auth, (req, res) => {
  const cls = db.classes.find(c => c.id === req.params.id);
  if (!cls) return res.status(404).json({ error: 'Not found' });
  const students = db.students.filter(s => s.classId === req.params.id && s.status === 'active');
  const teacher = db.teachers.find(t => t.id === cls.teacherId);
  const timetable = db.timetable.filter(t => t.classId === req.params.id);
  res.json({ ...cls, students, teacher, timetable });
});

router.post('/', auth, (req, res) => {
  const cls = { id: uuidv4(), ...req.body };
  db.classes.push(cls);
  res.status(201).json(cls);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.classes.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  res.json(db.classes[idx]);
});

module.exports = router;
