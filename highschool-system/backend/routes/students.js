const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { Grade } = require('../models/models');
const { protect } = require('../middleware/auth');

// Helper: generate student ID
const generateStudentId = () => `STU${Date.now().toString().slice(-6)}`;

// GET all students
router.get('/', protect, async (req, res) => {
  try {
    const { grade, status, search, class: classId } = req.query;
    let query = {};
    if (grade)   query.grade = grade;
    if (status)  query.status = status;
    if (classId) query.class = classId;
    if (search)  query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
    const students = await Student.find(query).populate('class', 'name grade section').sort({ lastName: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single student
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class', 'name grade section').populate('sports', 'name');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create student
router.post('/', protect, async (req, res) => {
  try {
    req.body.studentId = generateStudentId();
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update student
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE student
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET student GPA
router.get('/:id/gpa', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.id }).populate('subject', 'name creditHours');
    if (!grades.length) return res.json({ success: true, gpa: 0, grades: [] });
    let totalPoints = 0, totalCredits = 0;
    grades.forEach(g => {
      const credits = g.subject?.creditHours || 1;
      totalPoints += g.gradePoints * credits;
      totalCredits += credits;
    });
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    await Student.findByIdAndUpdate(req.params.id, { gpa });
    res.json({ success: true, gpa: parseFloat(gpa), grades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET student report card
router.get('/:id/report/:term/:year', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class');
    const grades = await Grade.find({
      student: req.params.id,
      term: req.params.term,
      academicYear: req.params.year
    }).populate('subject', 'name code');
    res.json({ success: true, data: { student, grades, term: req.params.term, year: req.params.year } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
