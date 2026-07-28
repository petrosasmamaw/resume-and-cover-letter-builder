import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/:profile_id', async (req, res) => {
  try {
    const owned = await query(
      'SELECT id FROM profiles WHERE id = $1 AND user_id = $2',
      [req.params.profile_id, req.user.id]
    );
    if (!owned.rows.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const result = await query(
      `SELECT id, profile_id, job_title, company_name, job_description,
              generated_resume_json, generated_cover_letter, created_at
       FROM generations
       WHERE profile_id = $1 AND (user_id = $2 OR user_id IS NULL)
       ORDER BY created_at DESC`,
      [req.params.profile_id, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/item/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT g.* FROM generations g
       INNER JOIN profiles p ON p.id = g.profile_id
       WHERE g.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
