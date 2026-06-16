const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, mapEventRow } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM events ORDER BY date ASC, created_at DESC');
  res.json(rows.map(mapEventRow));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM events WHERE id = $1 LIMIT 1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapEventRow(rows[0]));
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const { title, type, status, date, time, venue, description } = req.body;
  const { rows } = await query(
    `INSERT INTO events (id, title, type, status, date, time, venue, description, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING *`,
    [id, title, type || 'General', status || 'Upcoming', date || null, time || null, venue || null, description || null]
  );
  res.status(201).json(mapEventRow(rows[0]));
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    title: 'title',
    type: 'type',
    status: 'status',
    date: 'date',
    time: 'time',
    venue: 'venue',
    description: 'description',
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
    `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapEventRow(rows[0]));
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
