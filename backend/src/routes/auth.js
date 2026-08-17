import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { requireAuth, signToken, isPlaceholderJwt } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimit.js';

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

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

router.post('/signup', authLimiter, async (req, res) => {
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

router.post('/login', authLimiter, async (req, res) => {
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

/** Request a password reset link */
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Always respond with success to prevent user enumeration attacks
    const userRes = await query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (!userRes.rows.length) {
      return res.json({
        ok: true,
        message: 'If an account exists with that email, a password reset link has been generated.',
      });
    }

    const user = userRes.rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate prior unused tokens
    await query(
      `UPDATE password_reset_tokens SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    // Save token
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    const clientOrigin = process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173';
    const resetUrl = `${clientOrigin}/reset-password?token=${rawToken}`;

    console.log(`\n========================================`);
    console.log(`[PASSWORD RESET] Link generated for ${user.email}:`);
    console.log(resetUrl);
    console.log(`========================================\n`);

    // In development mode, provide token/link in payload for seamless local testing
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      ok: true,
      message: 'If an account exists with that email, a password reset link has been generated.',
      ...(isDev ? { reset_url: resetUrl, token: rawToken } : {}),
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: err.message || 'Failed to process request' });
  }
});

/** Submit password reset with token */
router.post('/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const rawToken = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.password || '');

    if (!rawToken) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const tokenHash = hashToken(rawToken);
    const tokenRes = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at, u.email
       FROM password_reset_tokens prt
       INNER JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1`,
      [tokenHash]
    );

    if (!tokenRes.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired password reset link' });
    }

    const tokenRecord = tokenRes.rows[0];
    if (tokenRecord.used_at) {
      return res.status(400).json({ error: 'This reset link has already been used' });
    }
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      tokenRecord.user_id,
    ]);

    // Mark token used
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [
      tokenRecord.id,
    ]);

    res.json({
      ok: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: err.message || 'Password reset failed' });
  }
});

export default router;

