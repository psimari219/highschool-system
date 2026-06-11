const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => {
  const sports = db.sports.map(s => ({
    ...s,
    coach: db.teachers.find(t => t.id === s.coach),
    memberCount: db.sportMembers.filter(m => m.sportId === s.id).length,
  }));
  res.json(sports);
});

router.get('/:id', auth, (req, res) => {
  const sport = db.sports.find(s => s.id === req.params.id);
  if (!sport) return res.status(404).json({ error: 'Not found' });
  const members = db.sportMembers.filter(m => m.sportId === sport.id).map(m => ({
    ...m, student: db.students.find(s => s.id === m.studentId)
  }));
  res.json({ ...sport, coach: db.teachers.find(t => t.id === sport.coach), members });
});

router.post('/', auth, (req, res) => {
  const sport = { id: uuidv4(), ...req.body };
  db.sports.push(sport);
  res.status(201).json(sport);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.sports.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.sports[idx] = { ...db.sports[idx], ...req.body };
  res.json(db.sports[idx]);
});

router.post('/:id/members', auth, (req, res) => {
  const { studentId, position } = req.body;
  if (db.sportMembers.find(m => m.sportId === req.params.id && m.studentId === studentId)) {
    return res.status(400).json({ error: 'Already a member' });
  }
  const member = { id: uuidv4(), sportId: req.params.id, studentId, position: position || 'Player', joinDate: new Date().toISOString().split('T')[0], status: 'active' };
  db.sportMembers.push(member);
  res.status(201).json(member);
});

router.delete('/:id/members/:memberId', auth, (req, res) => {
  db.sportMembers = db.sportMembers.filter(m => m.id !== req.params.memberId);
  res.json({ message: 'Removed' });
});

module.exports = router;
