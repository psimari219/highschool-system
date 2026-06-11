const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { getLetterGrade, getGPAPoints } = require('../db');

router.get('/', auth, (req, res) => {
  const { studentId, classId, subjectId, term, year } = req.query;
  let grades = [...db.grades];
  if (studentId) grades = grades.filter(g => g.studentId === studentId);
  if (classId) grades = grades.filter(g => g.classId === classId);
  if (subjectId) grades = grades.filter(g => g.subjectId === subjectId);
  if (term) grades = grades.filter(g => g.term === term);
  if (year) grades = grades.filter(g => g.year === parseInt(year));
  
  const enriched = grades.map(g => ({
    ...g,
    student: db.students.find(s => s.id === g.studentId),
    subject: db.subjects.find(s => s.id === g.subjectId),
  }));
  res.json(enriched);
});

router.post('/', auth, (req, res) => {
  const { ca1, ca2, exam } = req.body;
  const total = Math.min(100, (ca1 || 0) + (ca2 || 0) + (exam || 0));
  const grade = {
    id: uuidv4(),
    ...req.body,
    total,
    grade: getLetterGrade(total),
    gpaPoints: getGPAPoints(total),
  };
  // Remove existing grade for same student/subject/term
  const existingIdx = db.grades.findIndex(g => g.studentId === grade.studentId && g.subjectId === grade.subjectId && g.term === grade.term && g.year === grade.year);
  if (existingIdx !== -1) db.grades.splice(existingIdx, 1);
  db.grades.push(grade);
  res.status(201).json(grade);
});

router.put('/:id', auth, (req, res) => {
  const idx = db.grades.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { ca1, ca2, exam } = { ...db.grades[idx], ...req.body };
  const total = Math.min(100, (ca1 || 0) + (ca2 || 0) + (exam || 0));
  db.grades[idx] = { ...db.grades[idx], ...req.body, total, grade: getLetterGrade(total), gpaPoints: getGPAPoints(total) };
  res.json(db.grades[idx]);
});

// Class report card
router.get('/report/:classId', auth, (req, res) => {
  const { term, year } = req.query;
  const students = db.students.filter(s => s.classId === req.params.classId && s.status === 'active');
  const report = students.map(student => {
    const grades = db.grades.filter(g => g.studentId === student.id && (!term || g.term === term) && (!year || g.year === parseInt(year)));
    const totalPoints = grades.reduce((sum, g) => sum + g.gpaPoints, 0);
    const gpa = grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : '0.00';
    const avg = grades.length > 0 ? (grades.reduce((sum, g) => sum + g.total, 0) / grades.length).toFixed(1) : '0';
    return {
      student,
      grades: grades.map(g => ({ ...g, subject: db.subjects.find(s => s.id === g.subjectId) })),
      gpa: parseFloat(gpa),
      average: parseFloat(avg),
    };
  });
  report.sort((a, b) => b.gpa - a.gpa);
  report.forEach((r, i) => r.rank = i + 1);
  res.json(report);
});

module.exports = router;
