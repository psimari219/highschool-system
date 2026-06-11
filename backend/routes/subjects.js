const express = require('express');
const router = express.Router();
const { Subject } = require('../models/models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).populate('teacher', 'firstName lastName');
    res.json({ success: true, data: subjects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const sub = await Subject.findById(req.params.id).populate('teacher');
    if (!sub) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const sub = await Subject.create(req.body);
    res.status(201).json({ success: true, data: sub });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const sub = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: sub });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
