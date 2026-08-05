import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
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

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 40;
const MAX_JOB_DESCRIPTION = 20000;

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
          role: m?.role === 'assistant' || m?.role === 'model' ? 'assistant' : 'user',
          content: String(m?.content || '').trim().slice(0, MAX_MESSAGE),
        }))
        .filter((m) => m.content),
      { role: 'user', content: userMessage },
    ];

    let profile = null;
    if (profile_id) {
      profile = await getFullProfile(profile_id, req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
    }

    const reply = await chatCareerCoach({
      messages,
      profile,
      jobTitle: String(job_title || '').trim().slice(0, 200),
      companyName: String(company_name || '').trim().slice(0, 200),
      jobDescription: String(job_description || '').trim().slice(0, MAX_JOB_DESCRIPTION),
    });

    res.json({
      reply: String(reply || '').trim(),
      role: 'assistant',
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
