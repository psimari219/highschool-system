const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => res.json(db.subjects));
router.post('/', auth, (req, res) => {
  const subj = { id: uuidv4(), ...req.body };
  db.subjects.push(subj);
  res.status(201).json(subj);
});
router.put('/:id', auth, (req, res) => {
  const idx = db.subjects.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.subjects[idx] = { ...db.subjects[idx], ...req.body };
  res.json(db.subjects[idx]);
});
router.delete('/:id', auth, (req, res) => {
  db.subjects = db.subjects.filter(s => s.id !== req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
