const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => {
  const { classId, date, studentId } = req.query;
  let att = [...db.attendance];
  if (classId) att = att.filter(a => a.classId === classId);
  if (date) att = att.filter(a => a.date === date);
  if (studentId) att = att.filter(a => a.studentId === studentId);
  const enriched = att.map(a => ({ ...a, student: db.students.find(s => s.id === a.studentId) }));
  res.json(enriched);
});

router.post('/bulk', auth, (req, res) => {
  const { classId, date, records } = req.body;
  // Remove existing for this class/date
  db.attendance = db.attendance.filter(a => !(a.classId === classId && a.date === date));
  const newRecords = records.map(r => ({
    id: uuidv4(),
    classId,
    date,
    studentId: r.studentId,
    status: r.status,
    note: r.note || '',
  }));
  db.attendance.push(...newRecords);
  res.json({ saved: newRecords.length });
});

router.get('/summary/:classId', auth, (req, res) => {
  const students = db.students.filter(s => s.classId === req.params.classId && s.status === 'active');
  const summary = students.map(student => {
    const records = db.attendance.filter(a => a.studentId === student.id);
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    const total = records.length;
    return {
      student,
      present, absent, late, total,
      rate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0',
    };
  });
  res.json(summary);
});

module.exports = router;
