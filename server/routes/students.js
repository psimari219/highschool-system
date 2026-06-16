const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, mapStudentRow, formatDate } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { classId, status, search } = req.query;
  const filters = [];
  const params = [];

  let sql = `
    SELECT s.*, c.name AS class_name, c.grade, c.stream
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE 1=1`;

  if (classId) {
    params.push(classId);
    filters.push(`s.class_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    filters.push(`s.enrollment_status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    filters.push(`(LOWER(s.first_name) LIKE $${params.length} OR LOWER(s.last_name) LIKE $${params.length} OR LOWER(s.id) LIKE $${params.length})`);
  }

  if (filters.length) sql += ` AND ${filters.join(' AND ')}`;
  sql += ' ORDER BY s.last_name, s.first_name';

  const { rows } = await query(sql, params);
  res.json(rows.map(row => mapStudentRow(row)));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT s.*, c.name AS class_name, c.grade, c.stream
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE s.id = $1 LIMIT 1`,
    [req.params.id]
  );

  const student = rows[0];
  if (!student) return res.status(404).json({ error: 'Not found' });

  const gradeResult = await query(
    `SELECT g.*, sub.name AS subject_name
     FROM grades g
     LEFT JOIN subjects sub ON g.subject_id = sub.id
     WHERE g.student_id = $1
     ORDER BY g.recorded_date DESC`,
    [req.params.id]
  );

  const attendanceResult = await query(
    `SELECT a.*, s.first_name || ' ' || s.last_name AS student_name
     FROM attendance a
     LEFT JOIN students s ON a.student_id = s.id
     WHERE a.student_id = $1
     ORDER BY a.attendance_date DESC`,
    [req.params.id]
  );

  const sportsResult = await query(
    `SELECT sm.*, sp.name AS sport_name
     FROM sport_members sm
     LEFT JOIN sports sp ON sm.sport_id = sp.id
     WHERE sm.student_id = $1`,
    [req.params.id]
  );

  const feesResult = await query(
    `SELECT fp.*, fs.name AS fee_name
     FROM fee_payments fp
     LEFT JOIN fee_structure fs ON fp.fee_id = fs.id
     WHERE fp.student_id = $1`,
    [req.params.id]
  );

  const grades = gradeResult.rows.map(row => ({
    ...row,
    subject: row.subject_name || row.subject_name || row.subject || '',
    date: formatDate(row.recorded_date || row.created_at),
  }));

  const attendance = attendanceResult.rows.map(row => ({
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    date: formatDate(row.attendance_date),
    status: row.status,
    note: row.remarks || row.note || '',
    student: row.student_name,
  }));

  const sports = sportsResult.rows.map(row => ({
    id: row.id,
    sportId: row.sport_id,
    studentId: row.student_id,
    position: row.position,
    joinDate: formatDate(row.joined_date),
    status: row.status,
    sport: { id: row.sport_id, name: row.sport_name },
  }));

  const fees = feesResult.rows;
  const gpaPoints = grades.reduce((sum, g) => sum + (Number(g.gpa_points) || 0), 0);
  const gpa = grades.length > 0 ? (gpaPoints / grades.length).toFixed(2) : '0.00';
  const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = attendance.length > 0 ? ((presentDays / attendance.length) * 100).toFixed(1) : '0';

  res.json({ ...mapStudentRow(student), class: { name: student.class_name, grade: student.grade, section: student.stream }, grades, attendance, sports, fees, gpa, attendanceRate });
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    gender,
    dob,
    parentName,
    parentPhone,
  } = req.body;

  await query(
    `INSERT INTO students (id, user_id, first_name, last_name, email, phone, address, gender, date_of_birth, enrollment_status, admission_date, parent_name, parent_phone, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',NOW(),$10,$11,NOW(),NOW())`,
    [id, id, firstName || '', lastName || '', email || null, phone || null, address || null, gender || null, dob || null, parentName || null, parentPhone || null]
  );

  const { rows } = await query('SELECT * FROM students WHERE id = $1 LIMIT 1', [id]);
  res.status(201).json(mapStudentRow(rows[0]));
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    gender: 'gender',
    dob: 'date_of_birth',
    enrollmentStatus: 'enrollment_status',
    parentName: 'parent_name',
    parentPhone: 'parent_phone',
  };

  Object.entries(allowed).forEach(([key, column]) => {
    if (req.body[key] !== undefined) {
      params.push(req.body[key]);
      fields.push(`${column} = $${params.length}`);
    }
  });

  if (!fields.length) return res.status(400).json({ error: 'No student fields to update' });

  params.push(req.params.id);
  const sql = `UPDATE students SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
  const { rows } = await query(sql, params);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapStudentRow(rows[0]));
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query(
    `UPDATE students SET enrollment_status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING id`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deactivated' });
});

module.exports = router;
