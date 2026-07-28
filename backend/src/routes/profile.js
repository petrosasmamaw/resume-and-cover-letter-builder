import { Router } from 'express';
import { query } from '../db/pool.js';
import {
  isPlaceholderGeminiKey,
  parseProfileText,
} from '../services/gemini.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function emptyToNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

/** Normalize AI date strings for DATE columns; keep null if unusable. */
function toDateOrNull(v) {
  const s = emptyToNull(v);
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  return null;
}

async function assertOwnsProfile(profileId, userId) {
  const result = await query(
    'SELECT id FROM profiles WHERE id = $1 AND user_id = $2',
    [profileId, userId]
  );
  return result.rows[0] || null;
}

async function getOrCreateUserProfileId(userId, email) {
  const existing = await query(
    'SELECT id FROM profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  if (existing.rows.length) return existing.rows[0].id;
  const created = await query(
    `INSERT INTO profiles (user_id, email) VALUES ($1, $2) RETURNING id`,
    [userId, email || null]
  );
  return created.rows[0].id;
}

function normKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Merge AI-parsed data into an existing profile:
 * - Core fields: only fill blanks (never overwrite existing values)
 * - Lists: skip duplicates, append only new items
 */
async function applyParsedProfile(profileId, parsed) {
  const stats = {
    added: { skills: 0, experience: 0, projects: 0, education: 0, certifications: 0 },
    skipped: { skills: 0, experience: 0, projects: 0, education: 0, certifications: 0 },
  };

  // Only fill empty core fields — keep whatever the user already saved
  await query(
    `UPDATE profiles SET
      full_name = COALESCE(NULLIF(full_name, ''), $1, full_name),
      title = COALESCE(NULLIF(title, ''), $2, title),
      email = COALESCE(NULLIF(email, ''), $3, email),
      phone = COALESCE(NULLIF(phone, ''), $4, phone),
      location = COALESCE(NULLIF(location, ''), $5, location),
      linkedin_url = COALESCE(NULLIF(linkedin_url, ''), $6, linkedin_url),
      github_url = COALESCE(NULLIF(github_url, ''), $7, github_url),
      portfolio_url = COALESCE(NULLIF(portfolio_url, ''), $8, portfolio_url),
      summary = COALESCE(NULLIF(summary, ''), $9, summary),
      updated_at = NOW()
     WHERE id = $10`,
    [
      emptyToNull(parsed.full_name),
      emptyToNull(parsed.title),
      emptyToNull(parsed.email),
      emptyToNull(parsed.phone),
      emptyToNull(parsed.location),
      emptyToNull(parsed.linkedin_url),
      emptyToNull(parsed.github_url),
      emptyToNull(parsed.portfolio_url),
      emptyToNull(parsed.summary),
      profileId,
    ]
  );

  const [skillsRes, expRes, projRes, eduRes, certRes] = await Promise.all([
    query('SELECT id, category, name, sort_order FROM skills WHERE profile_id = $1', [
      profileId,
    ]),
    query(
      'SELECT id, role_title, company, sort_order FROM experience WHERE profile_id = $1',
      [profileId]
    ),
    query('SELECT id, name, sort_order FROM projects WHERE profile_id = $1', [
      profileId,
    ]),
    query(
      'SELECT id, institution, degree, field FROM education WHERE profile_id = $1',
      [profileId]
    ),
    query(
      'SELECT id, name, provider FROM certifications WHERE profile_id = $1',
      [profileId]
    ),
  ]);

  const existingSkills = new Set(
    skillsRes.rows.map((s) => `${normKey(s.category)}::${normKey(s.name)}`)
  );
  // Also match on name alone so "React" in Frontend vs Tools still counts as same
  const existingSkillNames = new Set(skillsRes.rows.map((s) => normKey(s.name)));
  let nextSkillOrder =
    skillsRes.rows.reduce((max, s) => Math.max(max, s.sort_order || 0), -1) + 1;

  for (const s of Array.isArray(parsed.skills) ? parsed.skills : []) {
    if (!s?.name) continue;
    const name = String(s.name).trim();
    const category = emptyToNull(s.category);
    const key = `${normKey(category)}::${normKey(name)}`;
    if (existingSkills.has(key) || existingSkillNames.has(normKey(name))) {
      stats.skipped.skills += 1;
      continue;
    }
    await query(
      `INSERT INTO skills (profile_id, category, name, sort_order)
       VALUES ($1,$2,$3,$4)`,
      [profileId, category, name, nextSkillOrder++]
    );
    existingSkills.add(key);
    existingSkillNames.add(normKey(name));
    stats.added.skills += 1;
  }

  const existingExp = new Set(
    expRes.rows.map(
      (e) => `${normKey(e.role_title)}::${normKey(e.company)}`
    )
  );
  let nextExpOrder =
    expRes.rows.reduce((max, e) => Math.max(max, e.sort_order || 0), -1) + 1;

  for (const e of Array.isArray(parsed.experience) ? parsed.experience : []) {
    if (!e?.role_title && !e?.company) continue;
    const key = `${normKey(e.role_title)}::${normKey(e.company)}`;
    if (existingExp.has(key)) {
      stats.skipped.experience += 1;
      continue;
    }
    await query(
      `INSERT INTO experience
        (profile_id, role_title, company, location, start_date, end_date, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        profileId,
        emptyToNull(e.role_title),
        emptyToNull(e.company),
        emptyToNull(e.location),
        toDateOrNull(e.start_date),
        toDateOrNull(e.end_date),
        emptyToNull(e.description),
        nextExpOrder++,
      ]
    );
    existingExp.add(key);
    stats.added.experience += 1;
  }

  const existingProjects = new Set(projRes.rows.map((p) => normKey(p.name)));
  let nextProjOrder =
    projRes.rows.reduce((max, p) => Math.max(max, p.sort_order || 0), -1) + 1;

  for (const p of Array.isArray(parsed.projects) ? parsed.projects : []) {
    if (!p?.name) continue;
    const name = String(p.name).trim();
    if (existingProjects.has(normKey(name))) {
      stats.skipped.projects += 1;
      continue;
    }
    const tech = Array.isArray(p.tech_stack) ? p.tech_stack.map(String) : null;
    await query(
      `INSERT INTO projects (profile_id, name, url, description, tech_stack, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        profileId,
        emptyToNull(name),
        emptyToNull(p.url),
        emptyToNull(p.description),
        tech,
        nextProjOrder++,
      ]
    );
    existingProjects.add(normKey(name));
    stats.added.projects += 1;
  }

  const existingEdu = new Set(
    eduRes.rows.map(
      (edu) =>
        `${normKey(edu.institution)}::${normKey(edu.degree)}::${normKey(edu.field)}`
    )
  );

  for (const edu of Array.isArray(parsed.education) ? parsed.education : []) {
    if (!edu?.institution && !edu?.degree) continue;
    const key = `${normKey(edu.institution)}::${normKey(edu.degree)}::${normKey(edu.field)}`;
    if (existingEdu.has(key)) {
      stats.skipped.education += 1;
      continue;
    }
    await query(
      `INSERT INTO education (profile_id, institution, degree, field, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        profileId,
        emptyToNull(edu.institution),
        emptyToNull(edu.degree),
        emptyToNull(edu.field),
        emptyToNull(edu.start_date),
        emptyToNull(edu.end_date),
      ]
    );
    existingEdu.add(key);
    stats.added.education += 1;
  }

  const existingCerts = new Set(
    certRes.rows.map((c) => `${normKey(c.name)}::${normKey(c.provider)}`)
  );

  for (const c of Array.isArray(parsed.certifications)
    ? parsed.certifications
    : []) {
    if (!c?.name) continue;
    const key = `${normKey(c.name)}::${normKey(c.provider)}`;
    if (existingCerts.has(key)) {
      stats.skipped.certifications += 1;
      continue;
    }
    await query(
      `INSERT INTO certifications
        (profile_id, name, provider, issue_date, expiry_date, credential_id, credential_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        profileId,
        emptyToNull(c.name),
        emptyToNull(c.provider),
        emptyToNull(c.issue_date),
        emptyToNull(c.expiry_date),
        emptyToNull(c.credential_id),
        emptyToNull(c.credential_url),
      ]
    );
    existingCerts.add(key);
    stats.added.certifications += 1;
  }

  return stats;
}

async function getFullProfile(id, userId = null) {
  const profileRes = userId
    ? await query('SELECT * FROM profiles WHERE id = $1 AND user_id = $2', [
        id,
        userId,
      ])
    : await query('SELECT * FROM profiles WHERE id = $1', [id]);
  if (!profileRes.rows.length) return null;

  const [
    skills,
    experience,
    projects,
    education,
    certifications,
  ] = await Promise.all([
    query(
      'SELECT * FROM skills WHERE profile_id = $1 ORDER BY sort_order, category, name',
      [id]
    ),
    query(
      'SELECT * FROM experience WHERE profile_id = $1 ORDER BY sort_order, start_date DESC NULLS LAST',
      [id]
    ),
    query(
      'SELECT * FROM projects WHERE profile_id = $1 ORDER BY sort_order, name',
      [id]
    ),
    query('SELECT * FROM education WHERE profile_id = $1', [id]),
    query('SELECT * FROM certifications WHERE profile_id = $1', [id]),
  ]);

  return {
    ...profileRes.rows[0],
    skills: skills.rows,
    experience: experience.rows,
    projects: projects.rows,
    education: education.rows,
    certifications: certifications.rows,
  };
}

export { getFullProfile };

/**
 * Paste raw CV/profile text → Gemini classifies into fields → save to DB.
 * Body: { text, profile_id? }
 */
router.post('/parse-ai', async (req, res) => {
  try {
    if (isPlaceholderGeminiKey()) {
      return res.status(400).json({
        error:
          'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env, then restart.',
        code: 'PLACEHOLDER_KEY',
      });
    }

    const text = req.body?.text;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (String(text).length > 50000) {
      return res.status(400).json({ error: 'text too long (max 50,000 characters)' });
    }

    const parsed = await parseProfileText(String(text));

    let profileId = await getOrCreateUserProfileId(
      req.user.id,
      req.user.email
    );

    // Only allow updating the caller's own profile (ignore foreign profile_id)
    if (req.body?.profile_id && req.body.profile_id !== profileId) {
      const owned = await assertOwnsProfile(req.body.profile_id, req.user.id);
      if (owned) profileId = owned.id;
    }

    const merge = await applyParsedProfile(profileId, parsed);
    const full = await getFullProfile(profileId, req.user.id);
    res.json({ ...full, merge });
  } catch (err) {
    console.error('parse-ai error:', err);
    if (err.code === 'PLACEHOLDER_KEY') {
      return res.status(400).json({ error: err.message, code: 'PLACEHOLDER_KEY' });
    }
    res.status(500).json({
      error: err.message || 'Failed to parse profile with AI',
    });
  }
});

// List profiles (handy for frontend bootstrap)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, title, email, updated_at FROM profiles
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await getFullProfile(req.params.id, req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      title,
      email,
      phone,
      location,
      linkedin_url,
      github_url,
      portfolio_url,
      summary,
    } = req.body;

    const existing = await query(
      'SELECT id FROM profiles WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (existing.rows.length) {
      const result = await query(
        `UPDATE profiles SET
          full_name = COALESCE($1, full_name),
          title = COALESCE($2, title),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          location = COALESCE($5, location),
          linkedin_url = COALESCE($6, linkedin_url),
          github_url = COALESCE($7, github_url),
          portfolio_url = COALESCE($8, portfolio_url),
          summary = COALESCE($9, summary),
          updated_at = NOW()
         WHERE id = $10 AND user_id = $11
         RETURNING *`,
        [
          full_name,
          title,
          email,
          phone,
          location,
          linkedin_url,
          github_url,
          portfolio_url,
          summary,
          existing.rows[0].id,
          req.user.id,
        ]
      );
      return res.json(result.rows[0]);
    }

    const result = await query(
      `INSERT INTO profiles
        (user_id, full_name, title, email, phone, location, linkedin_url, github_url, portfolio_url, summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id,
        full_name || null,
        title || null,
        email || null,
        phone || null,
        location || null,
        linkedin_url || null,
        github_url || null,
        portfolio_url || null,
        summary || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const owned = await assertOwnsProfile(req.params.id, req.user.id);
    if (!owned) return res.status(404).json({ error: 'Profile not found' });

    const {
      full_name,
      title,
      email,
      phone,
      location,
      linkedin_url,
      github_url,
      portfolio_url,
      summary,
    } = req.body;

    const result = await query(
      `UPDATE profiles SET
        full_name = COALESCE($1, full_name),
        title = COALESCE($2, title),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        location = COALESCE($5, location),
        linkedin_url = COALESCE($6, linkedin_url),
        github_url = COALESCE($7, github_url),
        portfolio_url = COALESCE($8, portfolio_url),
        summary = COALESCE($9, summary),
        updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        full_name,
        title,
        email,
        phone,
        location,
        linkedin_url,
        github_url,
        portfolio_url,
        summary,
        req.params.id,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ownership gate for nested resources
async function requireOwnedProfile(req, res, next) {
  try {
    const owned = await assertOwnsProfile(req.params.id, req.user.id);
    if (!owned) return res.status(404).json({ error: 'Profile not found' });
    next();
  } catch (err) {
    next(err);
  }
}

router.use('/:id/skills', requireOwnedProfile);
router.use('/:id/experience', requireOwnedProfile);
router.use('/:id/projects', requireOwnedProfile);
router.use('/:id/education', requireOwnedProfile);
router.use('/:id/certifications', requireOwnedProfile);

// --- Skills ---
router.post('/:id/skills', async (req, res) => {
  try {
    const { category, name, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await query(
      `INSERT INTO skills (profile_id, category, name, sort_order)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, category || null, name, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/skills/:skillId', async (req, res) => {
  try {
    const { category, name, sort_order } = req.body;
    const result = await query(
      `UPDATE skills SET
        category = COALESCE($1, category),
        name = COALESCE($2, name),
        sort_order = COALESCE($3, sort_order)
       WHERE id = $4 AND profile_id = $5
       RETURNING *`,
      [category, name, sort_order, req.params.skillId, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Skill not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/skills/:skillId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM skills WHERE id = $1 AND profile_id = $2 RETURNING id',
      [req.params.skillId, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Skill not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Experience ---
router.post('/:id/experience', async (req, res) => {
  try {
    const {
      role_title,
      company,
      location,
      start_date,
      end_date,
      description,
      sort_order,
    } = req.body;
    const result = await query(
      `INSERT INTO experience
        (profile_id, role_title, company, location, start_date, end_date, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.params.id,
        role_title || null,
        company || null,
        location || null,
        start_date || null,
        end_date || null,
        description || null,
        sort_order ?? 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/experience/:expId', async (req, res) => {
  try {
    const {
      role_title,
      company,
      location,
      start_date,
      end_date,
      description,
      sort_order,
    } = req.body;

    const existing = await query(
      'SELECT * FROM experience WHERE id = $1 AND profile_id = $2',
      [req.params.expId, req.params.id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const result = await query(
      `UPDATE experience SET
        role_title = COALESCE($1, role_title),
        company = COALESCE($2, company),
        location = COALESCE($3, location),
        start_date = COALESCE($4, start_date),
        end_date = $5,
        description = COALESCE($6, description),
        sort_order = COALESCE($7, sort_order)
       WHERE id = $8 AND profile_id = $9
       RETURNING *`,
      [
        role_title ?? null,
        company ?? null,
        location ?? null,
        start_date ?? null,
        end_date === undefined ? existing.rows[0].end_date : end_date,
        description ?? null,
        sort_order ?? null,
        req.params.expId,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/experience/:expId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM experience WHERE id = $1 AND profile_id = $2 RETURNING id',
      [req.params.expId, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Projects ---
router.post('/:id/projects', async (req, res) => {
  try {
    const { name, url, description, tech_stack, sort_order } = req.body;
    const result = await query(
      `INSERT INTO projects (profile_id, name, url, description, tech_stack, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        req.params.id,
        name || null,
        url || null,
        description || null,
        Array.isArray(tech_stack) ? tech_stack : tech_stack ? [tech_stack] : null,
        sort_order ?? 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/projects/:projectId', async (req, res) => {
  try {
    const { name, url, description, tech_stack, sort_order } = req.body;
    const result = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        description = COALESCE($3, description),
        tech_stack = COALESCE($4, tech_stack),
        sort_order = COALESCE($5, sort_order)
       WHERE id = $6 AND profile_id = $7
       RETURNING *`,
      [
        name,
        url,
        description,
        Array.isArray(tech_stack) ? tech_stack : undefined,
        sort_order,
        req.params.projectId,
        req.params.id,
      ]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/projects/:projectId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND profile_id = $2 RETURNING id',
      [req.params.projectId, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Education ---
router.post('/:id/education', async (req, res) => {
  try {
    const { institution, degree, field, start_date, end_date } = req.body;
    const result = await query(
      `INSERT INTO education (profile_id, institution, degree, field, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        req.params.id,
        institution || null,
        degree || null,
        field || null,
        start_date || null,
        end_date || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/education/:eduId', async (req, res) => {
  try {
    const { institution, degree, field, start_date, end_date } = req.body;
    const result = await query(
      `UPDATE education SET
        institution = COALESCE($1, institution),
        degree = COALESCE($2, degree),
        field = COALESCE($3, field),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date)
       WHERE id = $6 AND profile_id = $7
       RETURNING *`,
      [
        institution,
        degree,
        field,
        start_date,
        end_date,
        req.params.eduId,
        req.params.id,
      ]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Education not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/education/:eduId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM education WHERE id = $1 AND profile_id = $2 RETURNING id',
      [req.params.eduId, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Education not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Certifications ---
router.post('/:id/certifications', async (req, res) => {
  try {
    const {
      name,
      provider,
      issue_date,
      expiry_date,
      credential_id,
      credential_url,
    } = req.body;
    const result = await query(
      `INSERT INTO certifications
        (profile_id, name, provider, issue_date, expiry_date, credential_id, credential_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        req.params.id,
        name || null,
        provider || null,
        issue_date || null,
        expiry_date || null,
        credential_id || null,
        credential_url || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/certifications/:certId', async (req, res) => {
  try {
    const {
      name,
      provider,
      issue_date,
      expiry_date,
      credential_id,
      credential_url,
    } = req.body;
    const result = await query(
      `UPDATE certifications SET
        name = COALESCE($1, name),
        provider = COALESCE($2, provider),
        issue_date = COALESCE($3, issue_date),
        expiry_date = COALESCE($4, expiry_date),
        credential_id = COALESCE($5, credential_id),
        credential_url = COALESCE($6, credential_url)
       WHERE id = $7 AND profile_id = $8
       RETURNING *`,
      [
        name,
        provider,
        issue_date,
        expiry_date,
        credential_id,
        credential_url,
        req.params.certId,
        req.params.id,
      ]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/certifications/:certId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM certifications WHERE id = $1 AND profile_id = $2 RETURNING id',
      [req.params.certId, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
