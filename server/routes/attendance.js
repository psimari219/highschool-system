const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, formatDate } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { classId, date, studentId } = req.query;
  const conditions = [];
  const params = [];

  let sql = `SELECT a.*, s.first_name || ' ' || s.last_name AS student_name FROM attendance a LEFT JOIN students s ON a.student_id = s.id WHERE 1=1`;

  if (classId) {
    params.push(classId);
    conditions.push(`a.class_id = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`a.attendance_date = $${params.length}`);
  }
  if (studentId) {
    params.push(studentId);
    conditions.push(`a.student_id = $${params.length}`);
  }

  if (conditions.length) sql += ` AND ${conditions.join(' AND ')}`;
  sql += ' ORDER BY a.attendance_date DESC';

  const { rows } = await query(sql, params);
  const enriched = rows.map(row => ({
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    date: formatDate(row.attendance_date),
    status: row.status,
    note: row.remarks || row.note || '',
    student: row.student_name,
  }));
  res.json(enriched);
});

router.post('/bulk', auth, async (req, res) => {
  const { classId, date, records } = req.body;
  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'classId, date, and records are required' });
  }

  await query('DELETE FROM attendance WHERE class_id = $1 AND attendance_date = $2', [classId, date]);

  const saved = [];
  for (const record of records) {
    const id = uuidv4();
    await query(
      `INSERT INTO attendance (id, student_id, class_id, attendance_date, status, remarks, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [id, record.studentId, classId, date, record.status, record.note || '']
    );
    saved.push(id);
  }

  res.json({ saved: saved.length });
});

router.get('/summary/:classId', auth, async (req, res) => {
  const { rows: students } = await query(
    `SELECT * FROM students WHERE class_id = $1 AND enrollment_status = 'active' ORDER BY last_name, first_name`,
    [req.params.classId]
  );

  const summary = [];
  for (const student of students) {
    const { rows: records } = await query('SELECT * FROM attendance WHERE student_id = $1', [student.id]);
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    const total = records.length;
    summary.push({
      student,
      present,
      absent,
      late,
      total,
      rate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0',
    });
  }

  res.json(summary);
});

module.exports = router;
