import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../db/pool.js';
import { chatCareerCoach, isPlaceholderGeminiKey } from '../services/gemini.js';
import { getFullProfile } from './profile.js';

const router = Router();
router.use(requireAuth);

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded. Maximum 60 chat messages per hour.',
  },
});

const MAX_MESSAGE = 12000;
const MAX_HISTORY = 20;
const MAX_JOB_DESCRIPTION = 20000;

async function resolveUserProfile(userId, profileId) {
  if (profileId) {
    const profile = await getFullProfile(profileId, userId);
    if (profile) return profile;
  }
  const owned = await query(
    `SELECT id FROM profiles
     WHERE user_id = $1
     ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
     LIMIT 1`,
    [userId]
  );
  if (!owned.rows.length) return null;
  return getFullProfile(owned.rows[0].id, userId);
}

router.post('/', chatLimiter, async (req, res) => {
  try {
    if (isPlaceholderGeminiKey()) {
      return res.status(400).json({
        error:
          'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env with your real key, then restart the server.',
        code: 'PLACEHOLDER_KEY',
      });
    }

    const {
      message,
      history = [],
      profile_id,
      job_title = '',
      company_name = '',
      job_description = '',
    } = req.body || {};

    const userMessage = String(message || '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (userMessage.length > MAX_MESSAGE) {
      return res.status(400).json({
        error: `message must be at most ${MAX_MESSAGE} characters`,
      });
    }

    const prior = Array.isArray(history) ? history.slice(-MAX_HISTORY) : [];
    const messages = [
      ...prior
        .map((m) => ({
          role:
            m?.role === 'assistant' || m?.role === 'model'
              ? 'assistant'
              : 'user',
          content: String(m?.content || '').trim().slice(0, MAX_MESSAGE),
        }))
        .filter((m) => m.content),
      { role: 'user', content: userMessage },
    ];

    // Same profile source as Generate — always attached when the user has one
    const profile = await resolveUserProfile(req.user.id, profile_id || null);

    const reply = await chatCareerCoach({
      messages,
      profile,
      jobTitle: String(job_title || '').trim().slice(0, 200),
      companyName: String(company_name || '').trim().slice(0, 200),
      jobDescription: String(job_description || '')
        .trim()
        .slice(0, MAX_JOB_DESCRIPTION),
    });

    res.json({
      reply: String(reply || '').trim(),
      role: 'assistant',
      profile_attached: Boolean(profile),
      profile_id: profile?.id || null,
      profile_name: profile?.full_name || null,
      profile_title: profile?.title || null,
    });
  } catch (err) {
    console.error('chat error:', err);
    if (err.code === 'PLACEHOLDER_KEY' || err.code === 'INVALID_CHAT') {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    const msg = String(err.message || '');
    if (msg.includes('[429') || msg.toLowerCase().includes('quota')) {
      return res.status(429).json({
        error: 'Gemini quota exceeded. Try again in a moment.',
        code: 'QUOTA',
      });
    }
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

export default router;
