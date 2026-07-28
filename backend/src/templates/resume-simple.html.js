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

function flattenSkills(skills) {
  if (!skills?.length) return [];
  const items = [];
  for (const group of skills) {
    if (Array.isArray(group.items)) {
      for (const item of group.items) items.push(String(item));
    } else if (group.name) {
      items.push(String(group.name));
    }
  }
  return items;
}

/**
 * Classic simple resume (Emma Williams style):
 * centered header, black rules, single-column sections.
 */
export function renderSimpleResumeHtml(resume, profile = {}) {
  const name = escapeHtml(profile.full_name || resume.name || 'Candidate');
  const headline = escapeHtml(resume.headline || profile.title || '');
  const contact = [
    profile.location,
    profile.email,
    profile.phone,
    profile.linkedin_url,
    profile.github_url,
    profile.portfolio_url,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' | ');

  const skillItems = flattenSkills(resume.skills);
  const mid = Math.ceil(skillItems.length / 2) || 0;
  const leftSkills = skillItems.slice(0, mid);
  const rightSkills = skillItems.slice(mid);

  const experienceHtml = renderList(resume.experience, (exp) => {
    const bullets = (exp.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const titleLine = [
      exp.role || exp.role_title,
      exp.company,
      exp.location,
    ]
      .filter(Boolean)
      .map(escapeHtml)
      .join(' – ');
    return `
      <div class="job">
        <div class="job-head">
          <div class="job-title">${titleLine}</div>
          <div class="job-dates">${escapeHtml(exp.dates || '')}</div>
        </div>
        <ul class="bullets">${bullets}</ul>
      </div>`;
  });

  const projectsHtml = renderList(resume.projects, (proj) => {
    const bullets = (proj.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const body =
      bullets ||
      (proj.description
        ? `<p class="proj-desc">${escapeHtml(proj.description)}</p>`
        : '');
    return `
      <div class="job">
        <div class="job-head">
          <div class="job-title">${escapeHtml(proj.name || '')}</div>
          <div class="job-dates">${escapeHtml(proj.dates || '')}</div>
        </div>
        ${body}
      </div>`;
  });

  const educationHtml = renderList(resume.education, (edu) => {
    if (typeof edu === 'string') {
      return `<div class="edu-row"><div>${escapeHtml(edu)}</div></div>`;
    }
    const line1 = [edu.degree, edu.field].filter(Boolean).join(' in ');
    const line2 = edu.institution || edu.school || '';
    const dates = [edu.start_date || edu.start, edu.end_date || edu.end]
      .filter(Boolean)
      .join(' – ');
    return `
      <div class="edu-row">
        <div>
          <div class="edu-degree">${escapeHtml(line1)}</div>
          <div class="edu-school">${escapeHtml(line2)}</div>
        </div>
        <div class="job-dates">${escapeHtml(dates || edu.dates || '')}</div>
      </div>`;
  });

  const certs = (resume.certifications || [])
    .map((c) => {
      if (typeof c === 'string') return escapeHtml(c);
      return escapeHtml(
        [c.name, c.provider, c.issue_date || c.date]
          .filter(Boolean)
          .join(' – ')
      );
    })
    .filter(Boolean);

  const languages = Array.isArray(resume.languages)
    ? resume.languages.map(escapeHtml)
    : [];

  const achievements = Array.isArray(resume.achievements)
    ? resume.achievements.map(escapeHtml)
    : [];

  const skillsCols =
    skillItems.length === 0
      ? ''
      : `
    <div class="skills-grid">
      <ul class="bullets">${leftSkills.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      <ul class="bullets">${rightSkills.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
    </div>`;

  const additional =
    certs.length || languages.length || achievements.length
      ? `
    <section class="section">
      <h2 class="section-title">Additional Details</h2>
      <div class="extra-grid">
        <div>
          ${
            certs.length
              ? `<div class="extra-label">Certifications:</div><ul class="bullets tight">${certs
                  .map((c) => `<li>${c}</li>`)
                  .join('')}</ul>`
              : ''
          }
          ${
            languages.length
              ? `<div class="extra-label" style="margin-top:8px">Languages:</div><ul class="bullets tight"><li>${languages.join(
                  ', '
                )}</li></ul>`
              : ''
          }
        </div>
        <div>
          ${
            achievements.length
              ? `<div class="extra-label">Achievements</div><ul class="bullets tight">${achievements
                  .map((a) => `<li>${a}</li>`)
                  .join('')}</ul>`
              : ''
          }
        </div>
      </div>
    </section>`
      : certs.length
        ? ''
        : '';

  // If only certs in resume.certifications and no achievements block built above with empty achievements
  const certsOnlyFallback =
    !additional && certs.length
      ? `
    <section class="section">
      <h2 class="section-title">Additional Details</h2>
      <div class="extra-label">Certifications:</div>
      <ul class="bullets tight">${certs.map((c) => `<li>${c}</li>`).join('')}</ul>
    </section>`
      : '';

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
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 10.5px;
      line-height: 1.35;
      color: #111;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 8.5in;
      min-height: 11in;
      max-height: 11in;
      overflow: hidden;
      padding: 0.55in 0.65in;
      background: #fff;
    }
    .header { text-align: center; margin-bottom: 10px; }
    .name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .headline {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 4px;
      color: #222;
    }
    .contact {
      font-size: 9px;
      margin-top: 6px;
      color: #333;
    }
    .rule {
      border: none;
      border-top: 1.5px solid #111;
      margin: 10px 0 8px;
    }
    .section { margin-bottom: 10px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid #111;
      padding-bottom: 2px;
      margin-bottom: 6px;
    }
    .summary { font-size: 10px; text-align: justify; }
    .job { margin-bottom: 8px; }
    .job-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
    }
    .job-title { font-weight: 700; font-size: 10.5px; }
    .job-dates {
      font-size: 9.5px;
      white-space: nowrap;
      color: #222;
    }
    .bullets {
      padding-left: 16px;
      margin-top: 2px;
    }
    .bullets li { margin-bottom: 1px; }
    .bullets.tight li { margin-bottom: 0; }
    .proj-desc { font-size: 10px; margin-top: 2px; }
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
    }
    .edu-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
    }
    .edu-degree { font-weight: 700; }
    .edu-school { font-size: 10px; }
    .extra-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    .extra-label { font-weight: 700; font-size: 10px; margin-bottom: 2px; }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="name">${name}</div>
      ${headline ? `<div class="headline">${headline}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </header>
    <hr class="rule" />

    ${
      resume.summary
        ? `<section class="section">
      <h2 class="section-title">Profile</h2>
      <p class="summary">${escapeHtml(resume.summary)}</p>
    </section>`
        : ''
    }

    ${
      experienceHtml
        ? `<section class="section">
      <h2 class="section-title">Work Experience</h2>
      ${experienceHtml}
    </section>`
        : ''
    }

    ${
      projectsHtml
        ? `<section class="section">
      <h2 class="section-title">Project Experience</h2>
      ${projectsHtml}
    </section>`
        : ''
    }

    ${
      skillItems.length
        ? `<section class="section">
      <h2 class="section-title">Key Skills</h2>
      ${skillsCols}
    </section>`
        : ''
    }

    ${
      educationHtml
        ? `<section class="section">
      <h2 class="section-title">Education</h2>
      ${educationHtml}
    </section>`
        : ''
    }

    ${additional || certsOnlyFallback}
  </div>
</body>
</html>`;
}
