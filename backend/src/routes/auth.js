import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { requireAuth, signToken, isPlaceholderJwt } from '../middleware/auth.js';

const router = Router();

async function ensureUserProfile(userId, email) {
  const existing = await query(
    'SELECT id FROM profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const created = await query(
    `INSERT INTO profiles (user_id, email) VALUES ($1, $2) RETURNING id`,
    [userId, email]
  );
  return created.rows[0].id;
}

router.post('/signup', async (req, res) => {
  try {
    if (isPlaceholderJwt()) {
      return res.status(500).json({
        error: 'JWT_SECRET is not configured. Add it to backend/.env',
      });
    }

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );
    const user = userRes.rows[0];
    const profileId = await ensureUserProfile(user.id, email);
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
      profile_id: profileId,
    });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (isPlaceholderJwt()) {
      return res.status(500).json({
        error: 'JWT_SECRET is not configured. Add it to backend/.env',
      });
    }

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRes = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    if (!userRes.rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const profileId = await ensureUserProfile(user.id, user.email);
    const token = signToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email },
      profile_id: profileId,
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userRes = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!userRes.rows.length) {
      return res.status(401).json({ error: 'User not found', code: 'UNAUTHORIZED' });
    }
    const profile = await query(
      'SELECT id FROM profiles WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );
    res.json({
      user: userRes.rows[0],
      profile_id: profile.rows[0]?.id || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
