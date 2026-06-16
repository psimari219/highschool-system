const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, getLetterGrade, getGPAPoints } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { studentId, classId, subjectId, term, year } = req.query;
  const conditions = [];
  const params = [];

  let sql = `
    SELECT g.*, sub.name AS subject_name
    FROM grades g
    LEFT JOIN subjects sub ON g.subject_id = sub.id
    WHERE 1=1`;

  if (studentId) {
    params.push(studentId);
    conditions.push(`g.student_id = $${params.length}`);
  }
  if (classId) {
    params.push(classId);
    conditions.push(`g.class_id = $${params.length}`);
  }
  if (subjectId) {
    params.push(subjectId);
    conditions.push(`g.subject_id = $${params.length}`);
  }
  if (term) {
    params.push(term);
    conditions.push(`g.term = $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`g.year = $${params.length}`);
  }

  if (conditions.length) sql += ` AND ${conditions.join(' AND ')}`;
  sql += ' ORDER BY g.recorded_date DESC NULLS LAST';

  const { rows } = await query(sql, params);
  const enriched = rows.map(row => ({
    ...row,
    subject: row.subject_name || row.subject_name || row.subject || '',
  }));
  res.json(enriched);
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const score = Number(req.body.score) || 0;
  const maxScore = Number(req.body.maxScore) || 100;
  const total = Math.min(100, score);
  const gradeValue = getLetterGrade(total);
  const gpaPoints = getGPAPoints(total);
  const subjectName = req.body.subject || null;

  // Ensure duplicate grade does not exist for same student/subject/term/year
  await query(
    `DELETE FROM grades WHERE student_id = $1 AND subject_name = $2 AND term = $3 AND year = $4`,
    [req.body.studentId, subjectName, req.body.term, req.body.year]
  );

  const { rows } = await query(
    `INSERT INTO grades (id, student_id, class_id, subject_id, subject_name, score, grade, term, year, teacher_id, recorded_date, gpa_points, total, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW()) RETURNING *`,
    [
      id,
      req.body.studentId,
      req.body.classId || null,
      req.body.subjectId || null,
      subjectName,
      score,
      gradeValue,
      req.body.term || null,
      req.body.year ? Number(req.body.year) : null,
      req.body.teacherId || null,
      req.body.date || null,
      gpaPoints,
      total,
    ]
  );

  res.status(201).json({ ...rows[0], subject: rows[0].subject_name || subjectName });
});

router.put('/:id', auth, async (req, res) => {
  const score = Number(req.body.score) || 0;
  const maxScore = Number(req.body.maxScore) || 100;
  const total = Math.min(100, score);
  const gradeValue = getLetterGrade(total);
  const gpaPoints = getGPAPoints(total);

  const { rows } = await query(
    `UPDATE grades SET student_id = $1, class_id = $2, subject_id = $3, subject_name = $4, score = $5, grade = $6, term = $7, year = $8, teacher_id = $9, recorded_date = $10, gpa_points = $11, total = $12, updated_at = NOW()
     WHERE id = $13 RETURNING *`,
    [
      req.body.studentId,
      req.body.classId || null,
      req.body.subjectId || null,
      req.body.subject || null,
      score,
      gradeValue,
      req.body.term || null,
      req.body.year ? Number(req.body.year) : null,
      req.body.teacherId || null,
      req.body.date || null,
      gpaPoints,
      total,
      req.params.id,
    ]
  );

  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ ...rows[0], subject: rows[0].subject_name || req.body.subject });
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query('DELETE FROM grades WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

router.get('/report/:classId', auth, async (req, res) => {
  const { term, year } = req.query;
  const studentRows = await query(
    `SELECT * FROM students WHERE class_id = $1 AND enrollment_status = 'active' ORDER BY last_name, first_name`,
    [req.params.classId]
  );

  const report = [];
  for (const student of studentRows.rows) {
    const params = [student.id];
    let sql = `SELECT g.*, sub.name AS subject_name FROM grades g LEFT JOIN subjects sub ON g.subject_id = sub.id WHERE g.student_id = $1`;
    if (term) {
      params.push(term);
      sql += ` AND g.term = $${params.length}`;
    }
    if (year) {
      params.push(Number(year));
      sql += ` AND g.year = $${params.length}`;
    }
    const gradesResult = await query(sql, params);
    const grades = gradesResult.rows.map(g => ({ ...g, subject: g.subject_name || g.subject_name || g.subject || '' }));
    const totalPoints = grades.reduce((sum, g) => sum + (Number(g.gpa_points) || 0), 0);
    const gpa = grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : '0.00';
    const avg = grades.length > 0 ? (grades.reduce((sum, g) => sum + (Number(g.total) || 0), 0) / grades.length).toFixed(1) : '0';
    report.push({
      student,
      grades,
      gpa: parseFloat(gpa),
      average: parseFloat(avg),
    });
  }

  report.sort((a, b) => b.gpa - a.gpa);
  report.forEach((r, i) => { r.rank = i + 1; });
  res.json(report);
});

module.exports = router;
