function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderList(items, mapper) {
  if (!items?.length) return '';
  return items.map(mapper).join('');
}

function normalizeSkillGroups(skills) {
  if (!skills?.length) return [];
  // Already grouped: [{ category, items: [] }]
  if (skills.some((s) => Array.isArray(s.items))) {
    return skills
      .map((g) => ({
        category: g.category || 'Skills',
        items: (g.items || []).map(String).filter(Boolean),
      }))
      .filter((g) => g.items.length);
  }

  // Flat rows: [{ category, name }]
  const map = new Map();
  for (const s of skills) {
    const cat = s.category || 'Skills';
    const name = s.name || s.item;
    if (!name) continue;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(String(name));
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }));
}

/**
 * Modern Single Column (ATS-safe) resume HTML.
 *
 * Design goals:
 * - single column, left-aligned body
 * - one accent color used sparingly
 * - no icons/graphics/tables
 */
export function renderResumeHtml(resume, profile = {}, options = {}) {
  const includeContact = options.includeContact !== false;
  const accent = '#1B2A4A'; // Navy
  const name = escapeHtml(profile.full_name || resume.name || 'Candidate');
  const headline = escapeHtml(resume.headline || profile.title || '');

  // With contact: private details + links. Without: links only (no email/phone/address).
  const contactParts = includeContact
    ? [
        profile.email,
        profile.phone,
        profile.location,
        profile.linkedin_url,
        profile.github_url,
        profile.portfolio_url,
      ]
    : [profile.linkedin_url, profile.github_url, profile.portfolio_url];

  const contact = contactParts.filter(Boolean).map(escapeHtml).join(' | ');

  const skillGroups = normalizeSkillGroups(resume.skills);

  const skillsHtml = skillGroups.length
    ? renderList(skillGroups, (g) => {
        const items = g.items.map(escapeHtml).join(', ');
        return `
          <div class="skill-line">
            <span class="skill-cat">${escapeHtml(g.category)}</span>
            <span class="skill-items">${items}</span>
          </div>`;
      })
    : '';

  const educationHtml = renderList(resume.education, (edu) => {
    if (typeof edu === 'string') {
      return `<div class="edu-row"><span>${escapeHtml(edu)}</span></div>`;
    }
    const line1 = [edu.degree, edu.field].filter(Boolean).join(' in ');
    const dates = [edu.start_date || edu.start, edu.end_date || edu.end]
      .filter(Boolean)
      .join(' – ');
    return `
      <div class="edu-row">
        <div class="edu-left">
          <div class="edu-degree">${escapeHtml(line1)}</div>
          <div class="edu-school">${escapeHtml(edu.institution || edu.school || '')}</div>
        </div>
        ${dates ? `<div class="edu-dates">${escapeHtml(dates)}</div>` : ''}
      </div>`;
  });

  const certsHtml = renderList(resume.certifications, (cert) => {
    if (typeof cert === 'string') return `<div class="cert-item">${escapeHtml(cert)}</div>`;
    const meta = [
      cert.provider,
      cert.issue_date || cert.date,
    ]
      .filter(Boolean)
      .join(' · ');
    return `
      <div class="cert-item">
        <div class="cert-name">${escapeHtml(cert.name || '')}</div>
        ${meta ? `<div class="cert-meta">${escapeHtml(meta)}</div>` : ''}
      </div>`;
  });

  const experienceHtml = renderList(resume.experience, (exp) => {
    const bullets = (exp.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const role = exp.role || exp.role_title || '';
    const dates = exp.dates || exp.dates_str || exp.date_range || '';
    const companyLine = [exp.company, exp.location].filter(Boolean).join(' · ');

    return `
      <div class="exp-item">
        <div class="exp-top">
          <div class="exp-role">${escapeHtml(role)}</div>
          ${dates ? `<div class="exp-dates">${escapeHtml(dates)}</div>` : ''}
        </div>
        ${companyLine ? `<div class="exp-company">${escapeHtml(companyLine)}</div>` : ''}
        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
      </div>`;
  });

  const projectsHtml = renderList(resume.projects, (proj) => {
    const bullets = (proj.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const desc = proj.description ? `<p class="proj-desc">${escapeHtml(proj.description)}</p>` : '';
    const name = proj.name ? escapeHtml(proj.name) : '';
    const dates = proj.dates || proj.date_range || '';
    return `
      <div class="proj-item">
        <div class="proj-top">
          <div class="proj-name">${name}</div>
          ${dates ? `<div class="proj-dates">${escapeHtml(dates)}</div>` : ''}
        </div>
        ${desc}
        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
      </div>`;
  });

  // Section order per spec: Summary → Experience → Skills → Education → (Projects/Certs)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: Letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 8.5in;
      height: 11in;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      font-size: 9.6px;
      line-height: 1.4;
      color: #1A1A1A;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 8.5in;
      min-height: 11in;
      max-height: 11in;
      padding: 0.75in 0.78in;
      overflow: hidden;
    }
    .header { margin-bottom: 10px; }
    .name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: ${accent};
      line-height: 1.15;
      margin-bottom: 3px;
    }
    .headline {
      font-size: 10.2px;
      font-weight: 600;
      color: #3D4451;
      letter-spacing: 0.02em;
      margin-bottom: 6px;
    }
    .contact {
      font-size: 9.2px;
      color: #4B5563;
      word-break: break-word;
    }
    .rule {
      border: none;
      height: 1px;
      background: ${accent};
      margin: 8px 0 12px;
      opacity: 0.95;
    }
    .section { margin-bottom: 12px; }
    .section-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: ${accent};
      border-bottom: 2px solid ${accent};
      padding-bottom: 2px;
      margin-bottom: 6px;
    }
    .summary {
      font-size: 9.6px;
      color: #1F2937;
      text-align: left;
    }
    .exp-item, .proj-item, .edu-row, .cert-item { margin-bottom: 10px; }
    .exp-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .exp-role { font-weight: 800; color: #0F172A; font-size: 10.2px; }
    .exp-dates { color: #64748B; font-size: 9.2px; white-space: nowrap; }
    .exp-company { color: ${accent}; font-weight: 600; font-size: 9.2px; margin-bottom: 3px; }
    .bullets { padding-left: 14px; margin-top: 2px; }
    .bullets li { margin-bottom: 2px; }

    .skill-line {
      display: flex;
      gap: 8px;
      margin-bottom: 3px;
    }
    .skill-cat {
      min-width: 72px;
      font-weight: 700;
      color: #111827;
      font-size: 9.6px;
    }
    .skill-items {
      color: #334155;
      font-size: 9.6px;
    }

    .edu-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: flex-start;
    }
    .edu-degree { font-weight: 800; color: #0F172A; }
    .edu-school { color: #374151; font-size: 9.2px; margin-top: 1px; }
    .edu-dates { color: #64748B; font-size: 9.2px; white-space: nowrap; }

    .proj-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .proj-name { font-weight: 800; color: #0F172A; font-size: 10.2px; }
    .proj-dates { color: #64748B; font-size: 9.2px; white-space: nowrap; }
    .proj-desc { color: #1F2937; margin-bottom: 3px; }

    .cert-name { font-weight: 800; color: #0F172A; }
    .cert-meta { color: #374151; font-size: 9.2px; margin-top: 1px; }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="name">${name}</div>
      ${headline ? `<div class="headline">${headline}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </header>
    <div class="rule"></div>

    ${
      resume.summary
        ? `<section class="section">
      <div class="section-title">Summary</div>
      <p class="summary">${escapeHtml(resume.summary)}</p>
    </section>`
        : ''
    }

    ${
      experienceHtml
        ? `<section class="section">
      <div class="section-title">Experience</div>
      ${experienceHtml}
    </section>`
        : ''
    }

    ${
      skillsHtml
        ? `<section class="section">
      <div class="section-title">Skills</div>
      ${skillsHtml}
    </section>`
        : ''
    }

    ${
      educationHtml
        ? `<section class="section">
      <div class="section-title">Education</div>
      ${educationHtml}
    </section>`
        : ''
    }

    ${
      projectsHtml
        ? `<section class="section">
      <div class="section-title">Projects</div>
      ${projectsHtml}
    </section>`
        : ''
    }

    ${
      certsHtml
        ? `<section class="section">
      <div class="section-title">Certifications</div>
      ${certsHtml}
    </section>`
        : ''
    }
  </div>
</body>
</html>`;
}

