const express = require('express');
const router = express.Router();
const { Class } = require('../models/models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('classTeacher', 'firstName lastName')
      .populate('students', 'firstName lastName studentId')
      .populate('subjects', 'name code');
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('classTeacher', 'firstName lastName email phone')
      .populate('students')
      .populate('subjects');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Class deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
