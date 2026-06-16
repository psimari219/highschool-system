const router = require('express').Router();
const auth = require('../middleware/auth');
const { query, uuidv4 } = require('../models/data');

router.get('/', auth, async (req, res) => {
  const { rows } = await query(
    `SELECT s.*, t.first_name || ' ' || t.last_name AS coach_name,
            COUNT(sm.id)::int AS member_count
     FROM sports s
     LEFT JOIN teachers t ON s.coach_id = t.id
     LEFT JOIN sport_members sm ON sm.sport_id = s.id AND sm.status = 'active'
     GROUP BY s.id, t.first_name, t.last_name
     ORDER BY s.name`
  );
  res.json(rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    coachId: row.coach_id,
    coachName: row.coach_name || '',
    season: row.season || '',
    year: row.year || null,
    status: row.status || 'active',
    memberCount: Number(row.member_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })));
});

router.get('/:id', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM sports WHERE id = $1 LIMIT 1', [req.params.id]);
  const sport = rows[0];
  if (!sport) return res.status(404).json({ error: 'Not found' });

  const membersResult = await query(
    `SELECT sm.*, s.first_name || ' ' || s.last_name AS student_name
     FROM sport_members sm
     LEFT JOIN students s ON sm.student_id = s.id
     WHERE sm.sport_id = $1 AND sm.status = 'active'`,
    [req.params.id]
  );

  res.json({
    id: sport.id,
    name: sport.name,
    description: sport.description || '',
    coachId: sport.coach_id,
    season: sport.season || '',
    year: sport.year || null,
    status: sport.status || 'active',
    members: membersResult.rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.student_name,
      position: row.position,
      jerseyNumber: row.jersey_number,
      joinedDate: row.joined_date ? row.joined_date.toISOString().split('T')[0] : null,
      status: row.status,
    })),
  });
});

router.post('/', auth, async (req, res) => {
  const id = uuidv4();
  const { name, description, coachId, season, year, status } = req.body;

  const { rows } = await query(
    `INSERT INTO sports (id, name, description, coach_id, season, year, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
    [id, name, description || null, coachId || null, season || null, year || null, status || 'active']
  );

  res.status(201).json(rows[0]);
});

router.put('/:id', auth, async (req, res) => {
  const fields = [];
  const params = [];
  const allowed = {
    name: 'name',
    description: 'description',
    coachId: 'coach_id',
    season: 'season',
    year: 'year',
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
    `UPDATE sports SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/:id/members', auth, async (req, res) => {
  const { studentId, position, jerseyNumber } = req.body;
  if (!studentId) return res.status(400).json({ error: 'studentId is required' });

  const { rows: existing } = await query(
    'SELECT id FROM sport_members WHERE sport_id = $1 AND student_id = $2 AND status = $3',
    [req.params.id, studentId, 'active']
  );
  if (existing.length) return res.status(400).json({ error: 'Already a member' });

  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO sport_members (id, sport_id, student_id, position, jersey_number, joined_date, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
    [id, req.params.id, studentId, position || 'Player', jerseyNumber || null, new Date().toISOString().split('T')[0], 'active']
  );

  res.status(201).json(rows[0]);
});

router.delete('/:id/members/:memberId', auth, async (req, res) => {
  const { rows } = await query(
    'DELETE FROM sport_members WHERE id = $1 RETURNING id',
    [req.params.memberId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Removed' });
});

module.exports = router;
