const router = require('express').Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { query, uuidv4 } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT t.*, u.name AS user_name, u.email AS user_email, c.name AS class_name
     FROM teachers t
     LEFT JOIN users u ON t.user_id = u.id
     LEFT JOIN classes c ON c.teacher_id = t.id
     ORDER BY t.last_name, t.first_name`
  );
  res.json(rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.user_email || row.email || '',
    phone: row.phone || '',
    department: row.department || '',
    qualification: row.qualification || '',
    hireDate: row.hire_date ? row.hire_date.toISOString().split('T')[0] : null,
    status: row.status || 'active',
    className: row.class_name || null,
  })));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT t.*, u.name AS user_name, u.email AS user_email
     FROM teachers t
     LEFT JOIN users u ON t.user_id = u.id
     WHERE t.id = $1 LIMIT 1`,
    [req.params.id]
  );
  const teacher = rows[0];
  if (!teacher) return res.status(404).json({ error: 'Not found' });

  const classesResult = await query('SELECT * FROM classes WHERE teacher_id = $1 ORDER BY name', [req.params.id]);
  const timetableResult = await query(
    `SELECT tm.*, sub.name AS subject_name
     FROM timetable tm
     LEFT JOIN subjects sub ON tm.subject_id = sub.id
     WHERE tm.teacher_id = $1
     ORDER BY tm.day, tm.period`,
    [req.params.id]
  );

  res.json({
    id: teacher.id,
    firstName: teacher.first_name,
    lastName: teacher.last_name,
    email: teacher.user_email || teacher.email || '',
    phone: teacher.phone || '',
    department: teacher.department || '',
    qualification: teacher.qualification || '',
    hireDate: teacher.hire_date ? teacher.hire_date.toISOString().split('T')[0] : null,
    status: teacher.status || 'active',
    user: {
      id: teacher.user_id,
      name: teacher.user_name,
      email: teacher.user_email,
    },
    classes: classesResult.rows,
    timetable: timetableResult.rows,
  });
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const userId = uuidv4();
  const { firstName, lastName, email, phone, department, qualification, hireDate, status } = req.body;
  const username = email ? email.split('@')[0] : `teacher_${id.slice(0, 8)}`;
  const password = req.body.password || 'teacher123';
  const hashedPwd = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO users (id, username, password, role, name, email, linked_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
    [userId, username, hashedPwd, 'teacher', `${firstName} ${lastName}`, email || null, id]
  );

  const { rows } = await query(
    `INSERT INTO teachers (id, user_id, first_name, last_name, department, qualification, hire_date, phone, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING *`,
    [id, userId, firstName, lastName, department || null, qualification || null, hireDate || null, phone || null, status || 'active']
  );

  res.status(201).json(rows[0]);
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phone: 'phone',
    department: 'department',
    qualification: 'qualification',
    hireDate: 'hire_date',
    status: 'status',
  };

  Object.entries(allowed).forEach(([key, column]) => {
    if (req.body[key] !== undefined) {
      params.push(req.body[key]);
      fields.push(`${column} = $${params.length}`);
    }
  });

  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);

  const { rows } = await query(
    `UPDATE teachers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `UPDATE teachers SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING id`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deactivated' });
});

module.exports = router;
