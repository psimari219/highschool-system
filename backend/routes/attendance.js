const express = require('express');
const router = express.Router();
const { Attendance } = require('../models/models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { class: cls, date, student, term, academicYear } = req.query;
    let query = {};
    if (cls)  query.class = cls;
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }
    const attendance = await Attendance.find(query)
      .populate('class', 'name grade')
      .populate('subject', 'name')
      .populate('teacher', 'firstName lastName')
      .populate('records.student', 'firstName lastName studentId')
      .sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const att = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: att });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Student attendance summary
router.get('/summary/:studentId', protect, async (req, res) => {
  try {
    const all = await Attendance.find({ 'records.student': req.params.studentId });
    let present = 0, absent = 0, late = 0, excused = 0;
    all.forEach(a => {
      const rec = a.records.find(r => r.student.toString() === req.params.studentId);
      if (rec) {
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Late') late++;
        else if (rec.status === 'Excused') excused++;
      }
    });
    const total = present + absent + late + excused;
    res.json({ success: true, data: { total, present, absent, late, excused, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
