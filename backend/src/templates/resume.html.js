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

/**
 * Modern color-accented resume HTML (sidebar + main column).
 * Accent: deep navy #1e3a5f
 */
export function renderResumeHtml(resume, profile = {}) {
  const name = escapeHtml(profile.full_name || resume.name || 'Candidate');
  const headline = escapeHtml(resume.headline || profile.title || '');
  const email = escapeHtml(profile.email || '');
  const phone = escapeHtml(profile.phone || '');
  const location = escapeHtml(profile.location || '');
  const linkedin = escapeHtml(profile.linkedin_url || '');
  const github = escapeHtml(profile.github_url || '');
  const portfolio = escapeHtml(profile.portfolio_url || '');

  const skillsHtml = renderList(resume.skills, (group) => {
    const items = (group.items || []).map(escapeHtml).join(', ');
    return `
      <div class="skill-group">
        <div class="skill-cat">${escapeHtml(group.category)}</div>
        <div class="skill-items">${items}</div>
      </div>`;
  });

  const educationHtml = renderList(resume.education, (edu) => {
    if (typeof edu === 'string') {
      return `<div class="edu-item">${escapeHtml(edu)}</div>`;
    }
    const line = [edu.degree, edu.field].filter(Boolean).join(' in ');
    const dates = [edu.start_date || edu.start, edu.end_date || edu.end]
      .filter(Boolean)
      .join(' – ');
    return `
      <div class="edu-item">
        <div class="edu-school">${escapeHtml(edu.institution || edu.school || '')}</div>
        <div class="edu-degree">${escapeHtml(line)}</div>
        <div class="edu-dates">${escapeHtml(dates)}</div>
      </div>`;
  });

  const certsHtml = renderList(resume.certifications, (cert) => {
    if (typeof cert === 'string') {
      return `<div class="cert-item">${escapeHtml(cert)}</div>`;
    }
    return `
      <div class="cert-item">
        <div class="cert-name">${escapeHtml(cert.name || '')}</div>
        <div class="cert-meta">${escapeHtml(cert.provider || '')}${cert.issue_date || cert.date ? ` · ${escapeHtml(cert.issue_date || cert.date)}` : ''}</div>
      </div>`;
  });

  const experienceHtml = renderList(resume.experience, (exp) => {
    const bullets = (exp.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    return `
      <div class="exp-item">
        <div class="exp-header">
          <span class="exp-role">${escapeHtml(exp.role || exp.role_title || '')}</span>
          <span class="exp-dates">${escapeHtml(exp.dates || '')}</span>
        </div>
        <div class="exp-company">${escapeHtml(exp.company || '')}${exp.location ? ` · ${escapeHtml(exp.location)}` : ''}</div>
        <ul class="bullets">${bullets}</ul>
      </div>`;
  });

  const projectsHtml = renderList(resume.projects, (proj) => {
    const bullets = (proj.bullets || [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    return `
      <div class="proj-item">
        <div class="proj-name">${escapeHtml(proj.name || '')}</div>
        <ul class="bullets">${bullets}</ul>
      </div>`;
  });

  const contactBits = [
    email && `<div class="contact-line">${email}</div>`,
    phone && `<div class="contact-line">${phone}</div>`,
    location && `<div class="contact-line">${location}</div>`,
    linkedin && `<div class="contact-line">${linkedin}</div>`,
    github && `<div class="contact-line">${github}</div>`,
    portfolio && `<div class="contact-line">${portfolio}</div>`,
  ]
    .filter(Boolean)
    .join('');

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
      font-size: 9.5px;
      line-height: 1.35;
      color: #1a1a1a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      display: flex;
      width: 8.5in;
      min-height: 11in;
      max-height: 11in;
      overflow: hidden;
    }
    .sidebar {
      width: 30%;
      background: #1e3a5f;
      color: #f1f5f9;
      padding: 24px 16px;
    }
    .main {
      width: 70%;
      background: #ffffff;
      padding: 24px 20px;
    }
    .name {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .headline {
      font-size: 10px;
      color: #94a3b8;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .contact-line {
      font-size: 8.5px;
      color: #cbd5e1;
      margin-bottom: 4px;
      word-break: break-word;
    }
    .side-section {
      margin-top: 20px;
    }
    .side-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7dd3fc;
      border-bottom: 1px solid rgba(125, 211, 252, 0.35);
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .skill-group { margin-bottom: 8px; }
    .skill-cat {
      font-weight: 600;
      font-size: 9px;
      color: #e2e8f0;
      margin-bottom: 2px;
    }
    .skill-items {
      font-size: 8.5px;
      color: #cbd5e1;
    }
    .edu-item, .cert-item { margin-bottom: 8px; }
    .edu-school, .cert-name {
      font-weight: 600;
      font-size: 9px;
      color: #e2e8f0;
    }
    .edu-degree, .edu-dates, .cert-meta {
      font-size: 8px;
      color: #94a3b8;
    }
    .section {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #1e3a5f;
      border-bottom: 2px solid #1e3a5f;
      padding-bottom: 4px;
      margin-bottom: 8px;
    }
    .summary {
      font-size: 9.5px;
      color: #334155;
    }
    .exp-item, .proj-item { margin-bottom: 10px; }
    .exp-header {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .exp-role, .proj-name {
      font-weight: 700;
      font-size: 10px;
      color: #0f172a;
    }
    .exp-dates {
      font-size: 8.5px;
      color: #64748b;
      white-space: nowrap;
    }
    .exp-company {
      font-size: 9px;
      color: #1e3a5f;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .bullets {
      padding-left: 14px;
      margin-top: 2px;
    }
    .bullets li {
      margin-bottom: 2px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="name">${name}</div>
      <div class="headline">${headline}</div>
      ${contactBits}
      ${skillsHtml ? `<div class="side-section"><div class="side-title">Skills</div>${skillsHtml}</div>` : ''}
      ${educationHtml ? `<div class="side-section"><div class="side-title">Education</div>${educationHtml}</div>` : ''}
      ${certsHtml ? `<div class="side-section"><div class="side-title">Certifications</div>${certsHtml}</div>` : ''}
    </aside>
    <main class="main">
      ${resume.summary ? `<section class="section"><div class="section-title">Summary</div><p class="summary">${escapeHtml(resume.summary)}</p></section>` : ''}
      ${experienceHtml ? `<section class="section"><div class="section-title">Experience</div>${experienceHtml}</section>` : ''}
      ${projectsHtml ? `<section class="section"><div class="section-title">Projects</div>${projectsHtml}</section>` : ''}
    </main>
  </div>
</body>
</html>`;
}
