const express = require('express');
const router = express.Router();
const { Grade } = require('../models/models');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { student, subject, class: cls, term, academicYear } = req.query;
    let query = {};
    if (student)     query.student = student;
    if (subject)     query.subject = subject;
    if (cls)         query.class = cls;
    if (term)        query.term = term;
    if (academicYear) query.academicYear = academicYear;
    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('subject', 'name code creditHours')
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: grades.length, data: grades });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const existing = await Grade.findOne({ student: req.body.student, subject: req.body.subject, term: req.body.term, academicYear: req.body.academicYear });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.json({ success: true, data: existing });
    }
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    Object.assign(grade, req.body);
    await grade.save();
    res.json({ success: true, data: grade });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Grade deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Bulk upload grades for a class
router.post('/bulk', protect, async (req, res) => {
  try {
    const { grades } = req.body;
    const results = [];
    for (const g of grades) {
      const existing = await Grade.findOne({ student: g.student, subject: g.subject, term: g.term, academicYear: g.academicYear });
      if (existing) { Object.assign(existing, g); await existing.save(); results.push(existing); }
      else { const created = await Grade.create(g); results.push(created); }
    }
    res.json({ success: true, count: results.length, data: results });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Class ranking
router.get('/ranking/:classId/:term/:year', protect, async (req, res) => {
  try {
    const { classId, term, year } = req.params;
    const grades = await Grade.find({ class: classId, term, academicYear: year })
      .populate('student', 'firstName lastName studentId')
      .populate('subject', 'name');
    
    const studentMap = {};
    grades.forEach(g => {
      const id = g.student._id.toString();
      if (!studentMap[id]) studentMap[id] = { student: g.student, totalScore: 0, count: 0, grades: [] };
      studentMap[id].totalScore += g.totalScore;
      studentMap[id].count++;
      studentMap[id].grades.push(g);
    });

    const ranking = Object.values(studentMap)
      .map(s => ({ ...s, average: s.count > 0 ? (s.totalScore / s.count).toFixed(2) : 0 }))
      .sort((a, b) => b.average - a.average)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    res.json({ success: true, data: ranking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
