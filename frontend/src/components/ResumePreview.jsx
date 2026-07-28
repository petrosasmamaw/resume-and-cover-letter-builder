function flattenSkills(skills) {
  if (!skills?.length) return [];
  const items = [];
  for (const group of skills) {
    if (Array.isArray(group.items)) items.push(...group.items.map(String));
    else if (group.name) items.push(String(group.name));
  }
  return items;
}

function ColorPreview({ resume, profile }) {
  const name = profile?.full_name || 'Candidate';
  const headline = resume.headline || profile?.title || '';

  return (
    <div className="overflow-hidden rounded-lg border border-line shadow-sm bg-white text-[11px] leading-snug">
      <div className="flex min-h-[520px]">
        <aside className="w-[30%] bg-navy text-slate-100 p-4">
          <h2 className="text-base font-bold leading-tight">{name}</h2>
          {headline && (
            <p className="mt-1 text-[10px] text-slate-300">{headline}</p>
          )}
          <div className="mt-3 space-y-1 text-[10px] text-slate-300 break-words">
            {profile?.email && <p>{profile.email}</p>}
            {profile?.phone && <p>{profile.phone}</p>}
            {profile?.location && <p>{profile.location}</p>}
            {profile?.linkedin_url && <p>{profile.linkedin_url}</p>}
            {profile?.github_url && <p>{profile.github_url}</p>}
          </div>

          {resume.skills?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-300 border-b border-sky-300/30 pb-1 mb-2">
                Skills
              </h3>
              {resume.skills.map((g, i) => (
                <div key={i} className="mb-2">
                  <p className="font-semibold text-[10px]">{g.category}</p>
                  <p className="text-[10px] text-slate-300">
                    {(g.items || []).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resume.education?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-300 border-b border-sky-300/30 pb-1 mb-2">
                Education
              </h3>
              {resume.education.map((edu, i) => (
                <div key={i} className="mb-2 text-[10px]">
                  {typeof edu === 'string' ? (
                    <p>{edu}</p>
                  ) : (
                    <>
                      <p className="font-semibold">{edu.institution}</p>
                      <p className="text-slate-300">
                        {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {resume.certifications?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-300 border-b border-sky-300/30 pb-1 mb-2">
                Certifications
              </h3>
              {resume.certifications.map((c, i) => (
                <div key={i} className="mb-2 text-[10px]">
                  {typeof c === 'string' ? (
                    <p>{c}</p>
                  ) : (
                    <>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-slate-300">{c.provider}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="w-[70%] p-4 text-slate-700">
          {resume.summary && (
            <section className="mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
                Summary
              </h3>
              <p>{resume.summary}</p>
            </section>
          )}

          {resume.experience?.length > 0 && (
            <section className="mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
                Experience
              </h3>
              {resume.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      {exp.role || exp.role_title}
                    </p>
                    <p className="text-[10px] text-slate-500 whitespace-nowrap">
                      {exp.dates}
                    </p>
                  </div>
                  <p className="text-navy font-medium">{exp.company}</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {(exp.bullets || []).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {resume.projects?.length > 0 && (
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-navy border-b-2 border-navy pb-1 mb-2">
                Projects
              </h3>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-3">
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
        </main>
      </div>
    </div>
  );
}

function SimplePreview({ resume, profile }) {
  const name = profile?.full_name || 'Candidate';
  const headline = resume.headline || profile?.title || '';
  const contact = [
    profile?.location,
    profile?.email,
    profile?.phone,
    profile?.linkedin_url,
  ]
    .filter(Boolean)
    .join(' | ');

  const skillItems = flattenSkills(resume.skills);
  const mid = Math.ceil(skillItems.length / 2) || 0;
  const leftSkills = skillItems.slice(0, mid);
  const rightSkills = skillItems.slice(mid);

  return (
    <div className="overflow-hidden rounded-lg border border-line shadow-sm bg-white text-[11px] leading-snug font-serif text-slate-900">
      <div className="px-8 py-6 min-h-[520px]">
        <header className="text-center mb-3">
          <h2 className="text-xl font-bold tracking-wide uppercase">{name}</h2>
          {headline && (
            <p className="mt-1 text-[11px] font-semibold tracking-[0.15em] uppercase">
              {headline}
            </p>
          )}
          {contact && (
            <p className="mt-2 text-[10px] text-slate-600">{contact}</p>
          )}
        </header>
        <hr className="border-slate-900 mb-3" />

        {resume.summary && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Profile
            </h3>
            <p className="text-justify text-[10.5px]">{resume.summary}</p>
          </section>
        )}

        {resume.experience?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Work Experience
            </h3>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-[11px]">
                    {[exp.role || exp.role_title, exp.company, exp.location]
                      .filter(Boolean)
                      .join(' – ')}
                  </p>
                  <p className="text-[10px] whitespace-nowrap">{exp.dates}</p>
                </div>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[10.5px]">
                  {(exp.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {resume.projects?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Project Experience
            </h3>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between gap-2">
                  <p className="font-bold text-[11px]">{proj.name}</p>
                  <p className="text-[10px] whitespace-nowrap">{proj.dates}</p>
                </div>
                <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[10.5px]">
                  {(proj.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {skillItems.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Key Skills
            </h3>
            <div className="grid grid-cols-2 gap-x-8">
              <ul className="list-disc pl-4 space-y-0.5 text-[10.5px]">
                {leftSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <ul className="list-disc pl-4 space-y-0.5 text-[10.5px]">
                {rightSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {resume.education?.length > 0 && (
          <section className="mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Education
            </h3>
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between gap-2 mb-1">
                <div>
                  {typeof edu === 'string' ? (
                    <p>{edu}</p>
                  ) : (
                    <>
                      <p className="font-bold text-[11px]">
                        {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                      </p>
                      <p className="text-[10.5px]">{edu.institution}</p>
                    </>
                  )}
                </div>
                <p className="text-[10px] whitespace-nowrap">
                  {typeof edu === 'string'
                    ? ''
                    : [edu.start_date, edu.end_date].filter(Boolean).join(' – ') ||
                      edu.dates}
                </p>
              </div>
            ))}
          </section>
        )}

        {(resume.certifications?.length > 0 ||
          resume.languages?.length > 0 ||
          resume.achievements?.length > 0) && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">
              Additional Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 text-[10.5px]">
              <div>
                {resume.certifications?.length > 0 && (
                  <>
                    <p className="font-bold mb-1">Certifications:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {resume.certifications.map((c, i) => (
                        <li key={i}>
                          {typeof c === 'string'
                            ? c
                            : [c.name, c.provider, c.issue_date]
                                .filter(Boolean)
                                .join(' – ')}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {resume.languages?.length > 0 && (
                  <>
                    <p className="font-bold mt-2 mb-1">Languages:</p>
                    <ul className="list-disc pl-4">
                      <li>{resume.languages.join(', ')}</li>
                    </ul>
                  </>
                )}
              </div>
              <div>
                {resume.achievements?.length > 0 && (
                  <>
                    <p className="font-bold mb-1">Achievements</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {resume.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * Resume preview — template: 'color' | 'simple'
 */
export default function ResumePreview({ resume, profile, template = 'color' }) {
  if (!resume) return null;
  if (template === 'simple') {
    return <SimplePreview resume={resume} profile={profile} />;
  }
  return <ColorPreview resume={resume} profile={profile} />;
}
