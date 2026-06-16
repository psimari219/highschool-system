const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4 } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM subjects ORDER BY name');
  res.json(rows.map(row => ({
    id: row.id,
    name: row.name,
    code: row.code,
    department: row.department,
    creditHours: row.credit_hours,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })));
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const { name, code, department, creditHours } = req.body;
  const { rows } = await query(
    `INSERT INTO subjects (id, name, code, department, credit_hours, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
    [id, name, code, department || null, creditHours || null]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    name: 'name',
    code: 'code',
    department: 'department',
    creditHours: 'credit_hours',
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
    `UPDATE subjects SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query('DELETE FROM subjects WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
