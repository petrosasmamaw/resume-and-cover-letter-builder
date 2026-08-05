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
  if (skills.some((s) => Array.isArray(s.items))) {
    return skills
      .map((g) => ({
        category: g.category || 'Skills',
        items: (g.items || []).map(String).filter(Boolean),
      }))
      .filter((g) => g.items.length);
  }

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
 * Premium ATS-safe single-column resume.
 * Inter typography + restrained blue hierarchy.
 */
export function renderSimpleResumeHtml(resume, profile = {}, options = {}) {
  const includeContact = options.includeContact !== false;
  const name = escapeHtml(profile.full_name || resume.name || 'Candidate');
  const headline = escapeHtml(resume.headline || profile.title || '');

  const contactParts = includeContact
    ? [
        profile.email,
        profile.phone,
        profile.location,
        profile.portfolio_url,
        profile.github_url,
        profile.linkedin_url,
      ]
    : [profile.portfolio_url, profile.github_url, profile.linkedin_url];

  const contact = contactParts.filter(Boolean).map(escapeHtml).join(' | ');

  const skillGroups = normalizeSkillGroups(resume.skills);

  const skillsHtml = renderList(skillGroups, (g) => {
    const items = g.items.map(escapeHtml).join(', ');
    return `
      <div class="skill-line">
        <span class="skill-cat">${escapeHtml(g.category)}:</span>
        <span class="skill-items">${items}</span>
      </div>`;
  });

  const experienceHtml = renderList(resume.experience, (exp) => {
    const bullets = (exp.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const role = exp.role || exp.role_title || '';
    const company = exp.company || '';
    const location = exp.location || '';
    const dates = exp.dates || '';
    return `
      <div class="block">
        <div class="row">
          <div class="block-title">${escapeHtml(role)}</div>
          ${dates ? `<div class="block-date">${escapeHtml(dates)}</div>` : ''}
        </div>
        <div class="block-sub">${escapeHtml([company, location].filter(Boolean).join(' · '))}</div>
        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
      </div>`;
  });

  const projectsHtml = renderList(resume.projects, (proj) => {
    const bullets = (proj.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const desc = proj.description ? `<p class="proj-desc">${escapeHtml(proj.description)}</p>` : '';
    const tech = Array.isArray(proj.tech_stack) && proj.tech_stack.length
      ? `<p class="proj-tech"><strong>Technologies:</strong> ${escapeHtml(proj.tech_stack.join(', '))}</p>`
      : '';
    const links = [proj.url, proj.github, proj.live_demo].filter(Boolean);
    const linksHtml = links.length
      ? `<p class="proj-tech"><strong>Links:</strong> ${escapeHtml(links.join(' | '))}</p>`
      : '';
    return `
      <div class="block">
        <div class="row">
          <div class="block-title">${escapeHtml(proj.name || '')}</div>
          ${proj.dates ? `<div class="block-date">${escapeHtml(proj.dates)}</div>` : ''}
        </div>
        ${desc}
        ${tech}
        ${linksHtml}
        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
      </div>`;
  });

  const educationHtml = renderList(resume.education, (edu) => {
    if (typeof edu === 'string') {
      return `<div class="block"><div class="block-title">${escapeHtml(edu)}</div></div>`;
    }
    const degree = [edu.degree, edu.field].filter(Boolean).join(' in ');
    const school = edu.institution || edu.school || '';
    const dates = [edu.start_date || edu.start, edu.end_date || edu.end]
      .filter(Boolean)
      .join(' – ');
    return `
      <div class="block">
        <div class="row">
          <div class="block-title">${escapeHtml(degree)}</div>
          ${dates ? `<div class="block-date">${escapeHtml(dates)}</div>` : ''}
        </div>
        <div class="block-sub">${escapeHtml(school)}</div>
      </div>`;
  });

  const certsHtml = renderList(resume.certifications, (cert) => {
    if (typeof cert === 'string') {
      return `<li>${escapeHtml(cert)}</li>`;
    }
    const val = [cert.name, cert.provider, cert.issue_date || cert.date]
      .filter(Boolean)
      .join(' · ');
    return `<li>${escapeHtml(val)}</li>`;
  });

  const awards = Array.isArray(resume.achievements) ? resume.achievements : [];
  const awardsHtml = awards.map((a) => `<li>${escapeHtml(a)}</li>`).join('');

  const languages = Array.isArray(resume.languages) ? resume.languages : [];
  const languagesHtml = languages.length
    ? `<p class="plain-line">${escapeHtml(languages.join(', '))}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 8.27in;
      height: 11.69in;
      font-family: Inter, "Source Sans 3", "IBM Plex Sans", Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #111827;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 8.27in;
      min-height: 11.69in;
      max-height: 11.69in;
      padding: 0.76in;
      overflow: hidden;
    }
    .header { margin-bottom: 12px; }
    .name {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      letter-spacing: 0.01em;
      line-height: 1.08;
    }
    .headline {
      margin-top: 3px;
      font-size: 14px;
      font-weight: 600;
      color: #2563EB;
    }
    .contact {
      margin-top: 6px;
      font-size: 9pt;
      color: #6B7280;
      word-break: break-word;
    }
    .section { margin-top: 18px; }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #2563EB;
      padding-bottom: 4px;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 8px;
      letter-spacing: 0.01em;
    }
    .summary { color: #111827; }
    .skill-line { margin-bottom: 5px; }
    .skill-cat { font-weight: 700; color: #111827; }
    .skill-items { color: #374151; margin-left: 4px; }
    .block { margin-bottom: 10px; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
    }
    .block-title { font-size: 11pt; font-weight: 700; color: #111827; }
    .block-date { font-size: 9pt; color: #6B7280; white-space: nowrap; }
    .block-sub {
      font-size: 10pt;
      color: #2563EB;
      font-weight: 600;
      margin-top: 1px;
    }
    .bullets { margin-top: 4px; padding-left: 16px; }
    .bullets li { margin-bottom: 2px; color: #111827; }
    .plain-list { padding-left: 16px; }
    .plain-list li { margin-bottom: 2px; }
    .plain-line { color: #111827; }
    .proj-desc, .proj-tech { margin-top: 2px; font-size: 10pt; color: #374151; }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="name">${name}</div>
      ${headline ? `<div class="headline">${headline}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </header>

    ${resume.summary ? `<section class="section"><div class="section-title">Summary</div><p class="summary">${escapeHtml(resume.summary)}</p></section>` : ''}
    ${skillsHtml ? `<section class="section"><div class="section-title">Skills</div>${skillsHtml}</section>` : ''}
    ${experienceHtml ? `<section class="section"><div class="section-title">Experience</div>${experienceHtml}</section>` : ''}
    ${projectsHtml ? `<section class="section"><div class="section-title">Projects</div>${projectsHtml}</section>` : ''}
    ${educationHtml ? `<section class="section"><div class="section-title">Education</div>${educationHtml}</section>` : ''}
    ${certsHtml ? `<section class="section"><div class="section-title">Certifications</div><ul class="plain-list">${certsHtml}</ul></section>` : ''}
    ${awardsHtml ? `<section class="section"><div class="section-title">Awards</div><ul class="plain-list">${awardsHtml}</ul></section>` : ''}
    ${languagesHtml ? `<section class="section"><div class="section-title">Languages</div>${languagesHtml}</section>` : ''}
  </div>
</body>
</html>`;
}

