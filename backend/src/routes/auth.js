import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, virtual_balance) VALUES ($1,$2,$3,$4) RETURNING id,name,email,virtual_balance,is_admin,plan',
    [name, email, hash, 100000]
  );

  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.is_admin }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  return res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.is_admin }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      virtual_balance: user.virtual_balance,
      plan: user.plan,
      is_admin: user.is_admin
    }
  });
});

router.post('/logout', (req, res) => res.json({ message: 'Logged out. Client should delete JWT token.' }));

export default router;
