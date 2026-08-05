import { Router } from 'express';
import { query } from '../db/pool.js';
import { getFullProfile } from './profile.js';
import { generateApplication, isPlaceholderGeminiKey } from '../services/gemini.js';
import { generateResumePdf } from '../services/pdf.js';
import { humanizeCoverLetter } from '../services/humanizer/index.js';
import { detectText } from '../services/detector/predict.js';
import { generateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();
router.use(requireAuth);

const humanizeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded. Maximum 30 humanize calls per hour.',
  },
});

const detectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded. Maximum 60 detect calls per hour.',
  },
});

const MAX_JOB_DESCRIPTION = 20000;
const OUTPUT_MODES = new Set(['both', 'resume', 'cover_letter']);
const TEMPLATES = new Set(['color', 'simple']);

router.post('/', generateLimiter, async (req, res) => {
  try {
    if (isPlaceholderGeminiKey()) {
      return res.status(400).json({
        error:
          'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env with your real key from https://aistudio.google.com/apikey, then restart the server.',
        code: 'PLACEHOLDER_KEY',
      });
    }

    const {
      profile_id,
      job_description,
      job_title,
      company_name,
      cover_letter_length,
      output_mode = 'both',
      resume_template = 'color',
      include_contact = true,
      special_notes = '',
    } = req.body;

    if (!OUTPUT_MODES.has(output_mode)) {
      return res.status(400).json({
        error: 'output_mode must be both, resume, or cover_letter',
      });
    }
    if (!TEMPLATES.has(resume_template)) {
      return res.status(400).json({
        error: 'resume_template must be color or simple',
      });
    }

    const includeContact = include_contact !== false && include_contact !== 'false';
    const specialNotes = String(special_notes || '').trim().slice(0, 4000);

    if (!profile_id) {
      return res.status(400).json({ error: 'profile_id is required' });
    }
    if (!job_description || !String(job_description).trim()) {
      return res.status(400).json({ error: 'job_description is required' });
    }
    if (String(job_description).length > MAX_JOB_DESCRIPTION) {
      return res.status(400).json({
        error: `job_description too long (max ${MAX_JOB_DESCRIPTION} characters)`,
      });
    }
    if (!job_title?.trim() || !company_name?.trim()) {
      return res
        .status(400)
        .json({ error: 'job_title and company_name are required' });
    }

    const wantCover = output_mode === 'both' || output_mode === 'cover_letter';
    const length = Number(cover_letter_length) || 1200;
    if (wantCover && (length < 200 || length > 5000)) {
      return res.status(400).json({
        error: 'cover_letter_length must be between 200 and 5000',
      });
    }

    const profile = await getFullProfile(profile_id, req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const generated = await generateApplication({
      profile,
      jobDescription: job_description,
      jobTitle: job_title,
      companyName: company_name,
      coverLetterLength: length,
      outputMode: output_mode,
      specialNotes,
    });

    const resume =
      output_mode === 'cover_letter' ? null : generated.resume || null;
    const coverLetter =
      output_mode === 'resume' ? null : generated.cover_letter || null;

    const saved = await query(
      `INSERT INTO generations
        (profile_id, user_id, job_title, company_name, job_description,
         generated_resume_json, generated_cover_letter, output_mode, resume_template,
         include_contact, special_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, created_at`,
      [
        profile_id,
        req.user.id,
        job_title,
        company_name,
        job_description,
        resume ? JSON.stringify(resume) : null,
        coverLetter,
        output_mode,
        resume_template,
        includeContact,
        specialNotes || null,
      ]
    );

    res.json({
      resume,
      cover_letter: coverLetter,
      generation_id: saved.rows[0].id,
      created_at: saved.rows[0].created_at,
      output_mode,
      resume_template,
      include_contact: includeContact,
      special_notes: specialNotes || '',
    });
  } catch (err) {
    console.error('Generate error:', err);
    if (err.code === 'PLACEHOLDER_KEY') {
      return res.status(400).json({ error: err.message, code: 'PLACEHOLDER_KEY' });
    }
    res.status(500).json({
      error: err.message || 'Generation failed',
    });
  }
});

router.post('/:generation_id/humanize', humanizeLimiter, async (req, res) => {
  try {
    if (isPlaceholderGeminiKey()) {
      return res.status(400).json({
        error:
          'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env first.',
        code: 'PLACEHOLDER_KEY',
      });
    }

    const genRes = await query(
      `SELECT g.* FROM generations g
       WHERE g.id = $1 AND (g.user_id = $2 OR g.profile_id IN (
         SELECT id FROM profiles WHERE user_id = $2
       ))`,
      [req.params.generation_id, req.user.id]
    );
    if (!genRes.rows.length) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const generation = genRes.rows[0];
    const source =
      (req.body?.cover_letter && String(req.body.cover_letter).trim()) ||
      generation.generated_cover_letter;

    if (!source?.trim()) {
      return res.status(400).json({
        error:
          'No cover letter to humanize. Generate a cover letter first (resume-only generations cannot be humanized).',
      });
    }

    const result = await humanizeCoverLetter(source, {
      jobTitle: generation.job_title,
      companyName: generation.company_name,
    });

    await query(
      `UPDATE generations SET generated_cover_letter = $1 WHERE id = $2`,
      [result.cover_letter, generation.id]
    );

    res.json({
      cover_letter: result.cover_letter,
      generation_id: generation.id,
      before: result.before,
      after: result.after,
      metrics: result.metrics,
      passes: result.passes,
      improved: result.improved,
      engine: result.engine,
      warning: result.warning,
    });
  } catch (err) {
    console.error('Humanize error:', err);
    if (err.code === 'PLACEHOLDER_KEY' || err.code === 'EMPTY') {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    res.status(500).json({ error: err.message || 'Humanize failed' });
  }
});

router.post('/:generation_id/detect', detectLimiter, async (req, res) => {
  try {
    const genRes = await query(
      `SELECT g.* FROM generations g
       WHERE g.id = $1 AND (g.user_id = $2 OR g.profile_id IN (
         SELECT id FROM profiles WHERE user_id = $2
       ))`,
      [req.params.generation_id, req.user.id]
    );
    if (!genRes.rows.length) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const generation = genRes.rows[0];
    const source =
      (req.body?.cover_letter && String(req.body.cover_letter).trim()) ||
      generation.generated_cover_letter;

    if (!source?.trim()) {
      return res.status(400).json({
        error:
          'No cover letter to analyze. Generate a cover letter first.',
      });
    }

    const result = detectText(source);
    res.json({
      generation_id: generation.id,
      ...result,
    });
  } catch (err) {
    console.error('Detect error:', err);
    res.status(500).json({ error: err.message || 'Detection failed' });
  }
});

router.post('/:generation_id/pdf', async (req, res) => {
  try {
    const genRes = await query(
      `SELECT g.* FROM generations g
       WHERE g.id = $1 AND (g.user_id = $2 OR g.profile_id IN (
         SELECT id FROM profiles WHERE user_id = $2
       ))`,
      [req.params.generation_id, req.user.id]
    );
    if (!genRes.rows.length) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const generation = genRes.rows[0];
    if (!generation.generated_resume_json) {
      return res.status(400).json({
        error: 'This generation has no resume to export (cover letter only).',
      });
    }

    const template =
      (TEMPLATES.has(req.body?.resume_template) && req.body.resume_template) ||
      generation.resume_template ||
      'color';

    const includeContact =
      req.body?.include_contact !== undefined
        ? req.body.include_contact !== false && req.body.include_contact !== 'false'
        : generation.include_contact !== false;

    const profile = await getFullProfile(generation.profile_id, req.user.id);
    const resume =
      typeof generation.generated_resume_json === 'string'
        ? JSON.parse(generation.generated_resume_json)
        : generation.generated_resume_json;

    const pdf = await generateResumePdf(resume, profile || {}, template, {
      includeContact,
    });

    // Persist last PDF preference if client sent it
    if (req.body?.include_contact !== undefined) {
      await query(
        `UPDATE generations SET include_contact = $1 WHERE id = $2`,
        [includeContact, generation.id]
      );
    }

    const safeName = (generation.company_name || 'resume')
      .replace(/[^a-z0-9-_]/gi, '_')
      .slice(0, 40);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resume-${safeName}-${template}.pdf"`
    );
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: err.message || 'PDF generation failed' });
  }
});

export default router;
