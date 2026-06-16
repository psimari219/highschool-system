const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, mapClassRow } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, t.first_name || ' ' || t.last_name AS teacher_name,
            COUNT(s.id) AS enrolled_count
     FROM classes c
     LEFT JOIN teachers t ON c.teacher_id = t.id
     LEFT JOIN students s ON s.class_id = c.id AND s.enrollment_status = 'active'
     GROUP BY c.id, t.first_name, t.last_name
     ORDER BY c.name`
  );
  res.json(rows.map(mapClassRow));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT c.*, t.first_name || ' ' || t.last_name AS teacher_name
     FROM classes c
     LEFT JOIN teachers t ON c.teacher_id = t.id
     WHERE c.id = $1 LIMIT 1`,
    [req.params.id]
  );
  const cls = rows[0];
  if (!cls) return res.status(404).json({ error: 'Not found' });

  const studentsResult = await query(
    `SELECT * FROM students WHERE class_id = $1 AND enrollment_status = 'active' ORDER BY last_name, first_name`,
    [req.params.id]
  );

  const timetableResult = await query(
    `SELECT tm.*, sub.name AS subject_name, t.first_name || ' ' || t.last_name AS teacher_name
     FROM timetable tm
     LEFT JOIN subjects sub ON tm.subject_id = sub.id
     LEFT JOIN teachers t ON tm.teacher_id = t.id
     WHERE tm.class_id = $1 ORDER BY tm.day, tm.period`,
    [req.params.id]
  );

  res.json({
    ...mapClassRow(cls),
    students: studentsResult.rows,
    teacher: cls.teacher_name ? { name: cls.teacher_name } : null,
    timetable: timetableResult.rows,
  });
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const { name, grade, stream, year, capacity, teacherId } = req.body;
  const { rows } = await query(
    `INSERT INTO classes (id, name, grade, stream, year, capacity, teacher_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
    [id, name, grade, stream, year || null, capacity || null, teacherId || null]
  );
  res.status(201).json(mapClassRow(rows[0]));
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    name: 'name',
    grade: 'grade',
    stream: 'stream',
    year: 'year',
    capacity: 'capacity',
    teacherId: 'teacher_id',
  };

  Object.entries(allowed).forEach(([key, column]) => {
    if (req.body[key] !== undefined) {
      params.push(req.body[key]);
      fields.push(`${column} = $${params.length}`);
    }
  });

  if (!fields.length) return res.status(400).json({ error: 'No class fields to update' });

  params.push(req.params.id);
  const { rows } = await query(
    `UPDATE classes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapClassRow(rows[0]));
});

module.exports = router;
