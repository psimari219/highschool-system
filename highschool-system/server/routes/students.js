const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', auth, (req, res) => {
  const { classId, status, search } = req.query;
  let students = [...db.students];
  if (classId) students = students.filter(s => s.classId === classId);
  if (status) students = students.filter(s => s.status === status);
  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q)
    );
  }
  res.json(students);
});

router.get('/:id', auth, (req, res) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  const cls = db.classes.find(c => c.id === student.classId);
  const grades = db.grades.filter(g => g.studentId === student.id);
  const attendance = db.attendance.filter(a => a.studentId === student.id);
  const sports = db.sportMembers.filter(m => m.studentId === student.id).map(m => ({
    ...m, sport: db.sports.find(s => s.id === m.sportId)
  }));
  const fees = db.fees.filter(f => f.studentId === student.id);

  // Calculate GPA
  const gpaPoints = grades.reduce((sum, g) => sum + g.gpaPoints, 0);
  const gpa = grades.length > 0 ? (gpaPoints / grades.length).toFixed(2) : '0.00';

  // Attendance rate
  const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = attendance.length > 0 ? ((presentDays / attendance.length) * 100).toFixed(1) : '0';

  res.json({ ...student, class: cls, grades, attendance, sports, fees, gpa, attendanceRate });
});

router.post('/', auth, (req, res) => {
  const last = db.students.length;
  const student = {
    id: uuidv4(),
    studentId: `STU${String(last + 1).padStart(4, '0')}`,
    ...req.body,
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
  };
  db.students.push(student);
  res.status(201).json(student);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx] = { ...db.students[idx], ...req.body };
  res.json(db.students[idx]);
});

router.delete('/:id', auth, (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.students[idx].status = 'inactive';
  res.json({ message: 'Deactivated' });
});

module.exports = router;
