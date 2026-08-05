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

function ModernPreview({ resume, profile, includeContact = true }) {
  const name = profile?.full_name || 'Candidate';
  const headline = resume.headline || profile?.title || '';

  const contactParts = includeContact
    ? [
        profile?.email,
        profile?.phone,
        profile?.location,
        profile?.linkedin_url,
        profile?.github_url,
        profile?.portfolio_url,
      ]
    : [profile?.linkedin_url, profile?.github_url, profile?.portfolio_url];
  const contact = contactParts.filter(Boolean).join(' | ');

  const skillGroups = normalizeSkillGroups(resume.skills);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-soft)] bg-white text-[11px] leading-snug text-slate-800">
      <div className="px-8 py-6 min-h-[520px]">
        <header className="mb-3">
          <h2 className="text-xl font-extrabold tracking-wide text-navy">
            {name}
          </h2>
          {headline && (
            <div className="mt-1 text-[10px] font-semibold text-ink-muted">
              {headline}
            </div>
          )}
          {contact && (
            <div className="mt-2 text-[10px] text-ink-muted break-words">
              {contact}
            </div>
          )}
        </header>

        <hr className="border-navy/70 mb-4" />

        {resume.summary && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Summary
            </h3>
            <p className="text-slate-800">{resume.summary}</p>
          </section>
        )}

        {resume.experience?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Experience
            </h3>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-slate-900">
                    {exp.role || exp.role_title}
                  </p>
                  {exp.dates && (
                    <p className="text-[10px] text-slate-500 whitespace-nowrap">
                      {exp.dates}
                    </p>
                  )}
                </div>
                <p className="text-navy font-medium">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ''}
                </p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {(exp.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {skillGroups.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Skills
            </h3>
            <div>
              {skillGroups.map((g, i) => (
                <div key={i} className="mb-1">
                  <span className="font-semibold text-[10px] text-slate-900">
                    {g.category}:{' '}
                  </span>
                  <span className="text-[10px] text-slate-700">
                    {(g.items || []).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.education?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Education
            </h3>
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-2">
                {typeof edu === 'string' ? (
                  <p>{edu}</p>
                ) : (
                  <>
                    <p className="font-semibold">
                      {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                    </p>
                    <p className="text-[10px] text-slate-700">
                      {edu.institution}
                    </p>
                  </>
                )}
              </div>
            ))}
          </section>
        )}

        {resume.projects?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Projects
            </h3>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-slate-900">{proj.name}</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {(proj.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {(resume.certifications?.length || 0) > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
              Certifications
            </h3>
            {resume.certifications.map((c, i) => (
              <div key={i} className="mb-2">
                {typeof c === 'string' ? (
                  <p>{c}</p>
                ) : (
                  <>
                    <p className="font-semibold">{c.name}</p>
                    {c.provider && (
                      <p className="text-[10px] text-slate-700">
                        {c.provider}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function SimplePreview({ resume, profile, includeContact = true }) {
  const name = profile?.full_name || 'Candidate';
  const headline = resume.headline || profile?.title || '';
  const contactParts = includeContact
    ? [
        profile?.email,
        profile?.phone,
        profile?.location,
        profile?.portfolio_url,
        profile?.github_url,
        profile?.linkedin_url,
      ]
    : [profile?.portfolio_url, profile?.github_url, profile?.linkedin_url];
  const contact = contactParts.filter(Boolean).join(' | ');

  const skillGroups = normalizeSkillGroups(resume.skills);
  const awards = Array.isArray(resume.achievements) ? resume.achievements : [];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-soft)] bg-white text-[11px] leading-[1.45] text-slate-900">
      <div className="px-8 py-6 min-h-[520px]">
        <header className="mb-3">
          <h2 className="text-[30px] font-bold leading-tight text-slate-900">
            {name}
          </h2>
          {headline && (
            <p className="mt-1 text-[14px] font-semibold text-blue-600">
              {headline}
            </p>
          )}
          {contact && (
            <p className="mt-2 text-[9px] text-slate-500 break-words">{contact}</p>
          )}
        </header>
        <hr className="border-slate-200 mb-4" />

        {resume.summary && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Summary
            </h3>
            <p className="text-[11px]">{resume.summary}</p>
          </section>
        )}

        {skillGroups.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Skills
            </h3>
            <div className="space-y-1">
              {skillGroups.map((g, i) => (
                <div key={i} className="text-[11px]">
                  <span className="font-semibold text-slate-900">
                    {g.category}:{' '}
                  </span>
                  <span className="text-slate-700">{g.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.experience?.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Experience
            </h3>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-[11px]">
                    {exp.role || exp.role_title}
                  </p>
                  {exp.dates && (
                    <p className="text-[9px] text-slate-500 whitespace-nowrap">
                      {exp.dates}
                    </p>
                  )}
                </div>
                <p className="text-[10px] font-semibold text-blue-600">
                  {[exp.company, exp.location].filter(Boolean).join(' · ')}
                </p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                  {(exp.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.projects?.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Projects
            </h3>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-[11px]">{proj.name}</p>
                  {proj.dates && (
                    <p className="text-[9px] text-slate-500 whitespace-nowrap">
                      {proj.dates}
                    </p>
                  )}
                </div>
                {proj.description && (
                  <p className="text-[10px] text-slate-700 mt-1">{proj.description}</p>
                )}
                {proj.tech_stack?.length > 0 && (
                  <p className="text-[10px] text-slate-700 mt-1">
                    <span className="font-semibold">Technologies:</span>{' '}
                    {proj.tech_stack.join(', ')}
                  </p>
                )}
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                  {(proj.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.education?.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Education
            </h3>
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between gap-2 mb-2">
                <div>
                  {typeof edu === 'string' ? (
                    <p>{edu}</p>
                  ) : (
                    <>
                      <p className="font-bold text-[11px]">
                        {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                      </p>
                      <p className="text-[10px] text-slate-700">{edu.institution}</p>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 whitespace-nowrap">
                  {typeof edu === 'string'
                    ? ''
                    : [edu.start_date, edu.end_date].filter(Boolean).join(' – ') ||
                      edu.dates}
                </p>
              </div>
            ))}
          </section>
        )}

        {(resume.certifications?.length || 0) > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Certifications
            </h3>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {resume.certifications.map((c, i) => (
                <li key={i}>
                  {typeof c === 'string'
                    ? c
                    : [c.name, c.provider, c.issue_date].filter(Boolean).join(' · ')}
                </li>
              ))}
            </ul>
          </section>
        )}

        {awards.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Awards
            </h3>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {awards.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        {(resume.languages?.length || 0) > 0 && (
          <section>
            <h3 className="text-[15px] font-bold text-blue-600 border-b border-slate-200 pb-1 mb-2">
              Languages
            </h3>
            <p className="text-[11px]">{resume.languages.join(', ')}</p>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Resume preview — template: 'color' | 'simple'
 */
export default function ResumePreview({
  resume,
  profile,
  template = 'color',
  includeContact = true,
}) {
  if (!resume) return null;
  if (template === 'simple') {
    return (
      <SimplePreview
        resume={resume}
        profile={profile}
        includeContact={includeContact}
      />
    );
  }
  return (
    <ModernPreview
      resume={resume}
      profile={profile}
      includeContact={includeContact}
    />
  );
}
