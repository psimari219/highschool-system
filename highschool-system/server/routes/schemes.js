const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => {
  const { teacherId, subjectId, classId } = req.query;
  let schemes = [...db.schemes];
  if (teacherId) schemes = schemes.filter(s => s.teacherId === teacherId);
  if (subjectId) schemes = schemes.filter(s => s.subjectId === subjectId);
  if (classId) schemes = schemes.filter(s => s.classId === classId);
  const enriched = schemes.map(s => ({
    ...s,
    subject: db.subjects.find(sub => sub.id === s.subjectId),
    teacher: db.teachers.find(t => t.id === s.teacherId),
    class: db.classes.find(c => c.id === s.classId),
  }));
  res.json(enriched);
});

router.get('/:id', auth, (req, res) => {
  const scheme = db.schemes.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...scheme,
    subject: db.subjects.find(s => s.id === scheme.subjectId),
    teacher: db.teachers.find(t => t.id === scheme.teacherId),
    class: db.classes.find(c => c.id === scheme.classId),
  });
});

router.post('/', auth, (req, res) => {
  const scheme = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  db.schemes.push(scheme);
  res.status(201).json(scheme);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.schemes.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.schemes[idx] = { ...db.schemes[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json(db.schemes[idx]);
});

router.delete('/:id', auth, (req, res) => {
  db.schemes = db.schemes.filter(s => s.id !== req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
