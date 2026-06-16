const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../models/data');

const JWT_SECRET = process.env.JWT_SECRET || 'hs-system-secret-2024';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const { rows } = await query(
    'SELECT id, username, password, role, name, email FROM users WHERE username = $1 OR email = $1 LIMIT 1',
    [username]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

router.post('/change-password', require('../middleware/auth'), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });

  const { rows } = await query('SELECT password FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong current password' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, req.user.id]);
  res.json({ message: 'Password changed' });
});

module.exports = router;
