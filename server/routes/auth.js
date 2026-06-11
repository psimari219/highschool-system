const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'hs-system-secret-2024';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username || u.email === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

router.post('/change-password', require('../middleware/auth'), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong current password' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password changed' });
});

module.exports = router;
