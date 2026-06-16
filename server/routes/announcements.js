const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4, mapAnnouncementRow } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM announcements ORDER BY date DESC, created_at DESC');
  res.json(rows.map(mapAnnouncementRow));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM announcements WHERE id = $1 LIMIT 1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapAnnouncementRow(rows[0]));
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const { title, content, priority, author, date } = req.body;
  const { rows } = await query(
    `INSERT INTO announcements (id, title, content, priority, author, date, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING *`,
    [id, title, content, priority || 'Normal', author || 'System', date || null]
  );
  res.status(201).json(mapAnnouncementRow(rows[0]));
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    title: 'title',
    content: 'content',
    priority: 'priority',
    author: 'author',
    date: 'date',
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
    `UPDATE announcements SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(mapAnnouncementRow(rows[0]));
});

router.delete('/:id', auth, async (req, res) => {
  const { rows } = await query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
