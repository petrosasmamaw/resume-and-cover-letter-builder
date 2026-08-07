import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Alert,
  Button,
  Card,
  CardTitle,
  Field,
  PageHeader,
  ProfileSkeleton,
} from '../components/ui.jsx';
import {
  addCertification,
  addEducation,
  addExperience,
  addProject,
  addSkill,
  deleteCertification,
  deleteEducation,
  deleteExperience,
  deleteProject,
  deleteSkill,
  fetchProfile,
  parseProfileAi,
  saveCoreProfile,
} from '../store/profileSlice.js';

const emptyCore = {
  full_name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
  summary: '',
};

const NAV_ITEMS = [
  { id: 'ai', label: 'AI fill' },
  { id: 'core', label: 'Core details' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'certs', label: 'Certifications' },
];

function TextArea({ label, ...props }) {
  return <Field label={label} as="textarea" className="min-h-[88px]" {...props} />;
}

function EmptyList({ label }) {
  return (
    <div className="mb-4 rounded-lg border border-dashed border-line bg-surface px-4 py-4 text-sm text-ink-muted">
      No {label} yet — add your first below.
    </div>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rf-btn rf-btn-danger !min-h-7 !px-2 !text-xs shrink-0"
      aria-label="Remove"
    >
      Remove
    </button>
  );
}

function ListRow({ children, onRemove }) {
  return (
    <li className="flex items-start justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      <RemoveBtn onClick={onRemove} />
    </li>
  );
}

function ListScroll({ children, empty }) {
  if (empty) return null;
  return (
    <div className="mb-4 max-h-[240px] overflow-y-auto overscroll-contain rounded-lg border border-line bg-panel">
      <ul className="divide-y divide-line">{children}</ul>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profileId: authProfileId, setProfileId: setAuthProfileId } = useAuth();
  const profileState = useSelector((state) => state.profile);

  const {
    profileId,
    core: reduxCore,
    skills,
    experience,
    projects,
    education,
    certifications,
    status: reduxStatus,
    error: reduxError,
  } = profileState;

  const [activeSection, setActiveSection] = useState('core');
  const [core, setCore] = useState(emptyCore);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);

  const [skillForm, setSkillForm] = useState({ category: '', name: '' });
  const [expForm, setExpForm] = useState({
    role_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    url: '',
    description: '',
    tech_stack: '',
  });
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
  });
  const [certForm, setCertForm] = useState({
    name: '',
    provider: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
  });

  useEffect(() => {
    if (reduxCore) setCore(reduxCore);
  }, [reduxCore]);

  useEffect(() => {
    if (profileId && profileId !== authProfileId) {
      setAuthProfileId(profileId);
    }
  }, [profileId, authProfileId, setAuthProfileId]);

  useEffect(() => {
    dispatch(fetchProfile(authProfileId));
  }, [dispatch, authProfileId]);

  const counts = useMemo(
    () => ({
      ai: null,
      core: null,
      skills: skills.length,
      experience: experience.length,
      projects: projects.length,
      education: education.length,
      certs: certifications.length,
    }),
    [skills, experience, projects, education, certifications]
  );

  function goTo(id) {
    setActiveSection(id);
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSaveCore(e) {
    e.preventDefault();
    setStatus('');
    setError('');
    try {
      await dispatch(saveCoreProfile({ profileId, coreData: core })).unwrap();
      setStatus('Profile saved successfully!');
    } catch (err) {
      setError(err || 'Failed to save profile');
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    setError('');
    try {
      await dispatch(addSkill({ profileId, skillForm })).unwrap();
      setSkillForm({ category: '', name: '' });
    } catch (err) {
      setError(err || 'Failed to add skill');
    }
  }

  async function handleDeleteSkill(skillId) {
    setError('');
    try {
      await dispatch(deleteSkill({ profileId, skillId })).unwrap();
    } catch (err) {
      setError(err || 'Failed to delete skill');
    }
  }

  async function handleAddExp(e) {
    e.preventDefault();
    setError('');
    try {
      await dispatch(addExperience({ profileId, expForm })).unwrap();
      setExpForm({
        role_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    } catch (err) {
      setError(err || 'Failed to add experience');
    }
  }

  async function handleDeleteExp(expId) {
    setError('');
    try {
      await dispatch(deleteExperience({ profileId, expId })).unwrap();
    } catch (err) {
      setError(err || 'Failed to delete experience');
    }
  }

  async function handleAddProject(e) {
    e.preventDefault();
    setError('');
    try {
      await dispatch(addProject({ profileId, projectForm })).unwrap();
      setProjectForm({ name: '', url: '', description: '', tech_stack: '' });
    } catch (err) {
      setError(err || 'Failed to add project');
    }
  }

  async function handleDeleteProject(projectId) {
    setError('');
    try {
      await dispatch(deleteProject({ profileId, projectId })).unwrap();
    } catch (err) {
      setError(err || 'Failed to delete project');
    }
  }

  async function handleAddEdu(e) {
    e.preventDefault();
    setError('');
    try {
      await dispatch(addEducation({ profileId, eduForm })).unwrap();
      setEduForm({
        institution: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
      });
    } catch (err) {
      setError(err || 'Failed to add education');
    }
  }

  async function handleDeleteEdu(eduId) {
    setError('');
    try {
      await dispatch(deleteEducation({ profileId, eduId })).unwrap();
    } catch (err) {
      setError(err || 'Failed to delete education');
    }
  }

  async function handleAddCert(e) {
    e.preventDefault();
    setError('');
    try {
      await dispatch(addCertification({ profileId, certForm })).unwrap();
      setCertForm({
        name: '',
        provider: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
      });
    } catch (err) {
      setError(err || 'Failed to add certification');
    }
  }

  async function handleDeleteCert(certId) {
    setError('');
    try {
      await dispatch(deleteCertification({ profileId, certId })).unwrap();
    } catch (err) {
      setError(err || 'Failed to delete certification');
    }
  }

  async function handleFillWithAi(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (!pasteText.trim()) {
      setError('Paste your profile or CV text first.');
      return;
    }
    setAiParsing(true);
    try {
      const filled = await dispatch(
        parseProfileAi({ text: pasteText, profileId })
      ).unwrap();
      setPasteText('');
      const m = filled.merge;
      if (m) {
        const addedTotal = Object.values(m.added || {}).reduce((a, b) => a + b, 0);
        const skippedTotal = Object.values(m.skipped || {}).reduce(
          (a, b) => a + b,
          0
        );
        setStatus(
          `AI merge complete — added ${addedTotal} new item(s), skipped ${skippedTotal} duplicate(s). Existing data was kept.`
        );
      } else {
        setStatus(
          'AI filled your profile from the pasted text. Review each section.'
        );
      }
      goTo('core');
    } catch (err) {
      setError(err || 'AI parsing failed');
    } finally {
      setAiParsing(false);
    }
  }

  if (reduxStatus === 'loading' && !profileId) {
    return <ProfileSkeleton />;
  }

  const displayError = error || reduxError;
  const activeMeta = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <div className="space-y-5 rf-enter">
      <PageHeader
        title="Your profile"
        subtitle="Edit one section at a time. Generations use this data as ground truth."
      />

      {displayError && <Alert tone="error">{displayError}</Alert>}
      {status && <Alert tone="success">{status}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-20">
          <nav
            className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            aria-label="Profile sections"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.id;
              const count = counts[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(item.id)}
                  className={[
                    'shrink-0 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors',
                    active
                      ? 'bg-accent text-white'
                      : 'bg-panel border border-line text-ink-muted hover:text-ink hover:border-line-strong',
                  ].join(' ')}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    {typeof count === 'number' && (
                      <span
                        className={[
                          'text-xs font-medium tabular-nums',
                          active ? 'text-white/85' : 'text-ink-faint',
                        ].join(' ')}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <Card className="min-h-[420px]">
          <CardTitle eyebrow="Profile section">{activeMeta?.label}</CardTitle>

          {activeSection === 'ai' && (
            <form onSubmit={handleFillWithAi} className="space-y-3">
              <p className="text-sm text-ink-muted -mt-2 mb-2">
                Paste a CV or LinkedIn export. AI merges into your profile —
                duplicates are skipped.
              </p>
              <textarea
                className="rf-input min-h-[160px]"
                placeholder="Paste CV text, LinkedIn export, or notes…"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                disabled={aiParsing}
              />
              <Button
                type="submit"
                variant="accent"
                loading={aiParsing}
                disabled={aiParsing || !pasteText.trim()}
                className="!min-h-11"
              >
                {aiParsing ? 'Classifying & merging…' : 'Classify & merge into profile'}
              </Button>
            </form>
          )}

          {activeSection === 'core' && (
            <form onSubmit={handleSaveCore} className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={core.full_name}
                onChange={(e) => setCore({ ...core, full_name: e.target.value })}
                required
                placeholder="Jane Smith"
              />
              <Field
                label="Professional title"
                value={core.title}
                onChange={(e) => setCore({ ...core, title: e.target.value })}
                placeholder="Senior Software Engineer"
              />
              <Field
                label="Email"
                type="email"
                value={core.email}
                onChange={(e) => setCore({ ...core, email: e.target.value })}
                placeholder="jane@example.com"
                autoComplete="email"
              />
              <Field
                label="Phone"
                type="tel"
                value={core.phone}
                onChange={(e) => setCore({ ...core, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
              />
              <Field
                label="Location"
                value={core.location}
                onChange={(e) => setCore({ ...core, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
              <Field
                label="LinkedIn URL"
                value={core.linkedin_url}
                onChange={(e) =>
                  setCore({ ...core, linkedin_url: e.target.value })
                }
                placeholder="linkedin.com/in/janesmith"
              />
              <Field
                label="GitHub URL"
                value={core.github_url}
                onChange={(e) => setCore({ ...core, github_url: e.target.value })}
                placeholder="github.com/janesmith"
              />
              <Field
                label="Portfolio URL"
                value={core.portfolio_url}
                onChange={(e) =>
                  setCore({ ...core, portfolio_url: e.target.value })
                }
                placeholder="janesmith.dev"
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="Summary / about me"
                  value={core.summary}
                  onChange={(e) => setCore({ ...core, summary: e.target.value })}
                  placeholder="Brief professional summary…"
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="!min-h-11">
                  {profileId ? 'Save profile' : 'Create profile'}
                </Button>
              </div>
            </form>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-4">
              {skills.length === 0 ? (
                <EmptyList label="skills" />
              ) : (
                <div className="max-h-[260px] overflow-y-auto overscroll-contain rounded-lg border border-line p-3">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface pl-2.5 pr-1 py-1 text-sm"
                      >
                        {s.category && (
                          <span className="text-xs font-medium text-ink-faint">
                            {s.category} ·
                          </span>
                        )}
                        <span className="font-medium text-ink">{s.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(s.id)}
                          className="ml-0.5 flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-danger-soft hover:text-danger"
                          aria-label={`Remove ${s.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <form
                onSubmit={handleAddSkill}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field
                  label="Category"
                  placeholder="Frontend"
                  value={skillForm.category}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, category: e.target.value })
                  }
                />
                <Field
                  label="Skill name"
                  placeholder="React"
                  value={skillForm.name}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, name: e.target.value })
                  }
                  required
                />
                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full !min-h-11"
                  >
                    Add skill
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'experience' && (
            <div>
              {experience.length === 0 && <EmptyList label="experience" />}
              <ListScroll empty={experience.length === 0}>
                {experience.map((exp) => (
                  <ListRow
                    key={exp.id}
                    onRemove={() => handleDeleteExp(exp.id)}
                  >
                    <p className="font-semibold text-ink">
                      {exp.role_title}
                      <span className="font-medium text-ink-muted">
                        {' '}
                        · {exp.company}
                      </span>
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {exp.start_date}
                      {exp.end_date ? ` – ${exp.end_date}` : ' – Present'}
                      {exp.location ? ` · ${exp.location}` : ''}
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-xs text-ink line-clamp-2 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </ListRow>
                ))}
              </ListScroll>
              <form onSubmit={handleAddExp} className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Role title"
                  value={expForm.role_title}
                  onChange={(e) =>
                    setExpForm({ ...expForm, role_title: e.target.value })
                  }
                  required
                  placeholder="Software Engineer"
                />
                <Field
                  label="Company"
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                  required
                  placeholder="Acme Corp"
                />
                <Field
                  label="Location"
                  value={expForm.location}
                  onChange={(e) =>
                    setExpForm({ ...expForm, location: e.target.value })
                  }
                  placeholder="Remote"
                />
                <Field
                  label="Start date"
                  type="date"
                  value={expForm.start_date}
                  onChange={(e) =>
                    setExpForm({ ...expForm, start_date: e.target.value })
                  }
                />
                <Field
                  label="End date (blank = Present)"
                  type="date"
                  value={expForm.end_date}
                  onChange={(e) =>
                    setExpForm({ ...expForm, end_date: e.target.value })
                  }
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="Description / bullet notes"
                    value={expForm.description}
                    onChange={(e) =>
                      setExpForm({ ...expForm, description: e.target.value })
                    }
                    placeholder="Key responsibilities and achievements…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" className="!min-h-11">
                    Add experience
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'projects' && (
            <div>
              {projects.length === 0 && <EmptyList label="projects" />}
              <ListScroll empty={projects.length === 0}>
                {projects.map((p) => (
                  <ListRow
                    key={p.id}
                    onRemove={() => handleDeleteProject(p.id)}
                  >
                    <p className="font-semibold text-ink">{p.name}</p>
                    {p.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tech_stack.map((t) => (
                          <span
                            key={t}
                            className="rounded border border-line bg-panel px-1.5 py-0.5 text-xs text-ink-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.description && (
                      <p className="mt-1 text-xs text-ink line-clamp-2 whitespace-pre-wrap">
                        {p.description}
                      </p>
                    )}
                  </ListRow>
                ))}
              </ListScroll>
              <form
                onSubmit={handleAddProject}
                className="grid gap-3 sm:grid-cols-2"
              >
                <Field
                  label="Project name"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                  required
                  placeholder="My Awesome App"
                />
                <Field
                  label="URL"
                  value={projectForm.url}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Tech stack (comma-separated)"
                    value={projectForm.tech_stack}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        tech_stack: e.target.value,
                      })
                    }
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextArea
                    label="Description"
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="What the project does and your role…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" className="!min-h-11">
                    Add project
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'education' && (
            <div>
              {education.length === 0 && <EmptyList label="education" />}
              <ListScroll empty={education.length === 0}>
                {education.map((edu) => (
                  <ListRow key={edu.id} onRemove={() => handleDeleteEdu(edu.id)}>
                    <p className="font-semibold text-ink">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {edu.institution}
                      {(edu.start_date || edu.end_date) && (
                        <>
                          {' '}
                          · {edu.start_date}
                          {edu.end_date ? ` – ${edu.end_date}` : ''}
                        </>
                      )}
                    </p>
                  </ListRow>
                ))}
              </ListScroll>
              <form onSubmit={handleAddEdu} className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Institution"
                  value={eduForm.institution}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, institution: e.target.value })
                  }
                  required
                  placeholder="University of California, Berkeley"
                />
                <Field
                  label="Degree"
                  value={eduForm.degree}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, degree: e.target.value })
                  }
                  placeholder="B.Sc."
                />
                <Field
                  label="Field of study"
                  value={eduForm.field}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, field: e.target.value })
                  }
                  placeholder="Computer Science"
                />
                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <Field
                    label="Start"
                    value={eduForm.start_date}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, start_date: e.target.value })
                    }
                    placeholder="2018"
                  />
                  <Field
                    label="End"
                    value={eduForm.end_date}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, end_date: e.target.value })
                    }
                    placeholder="2022"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" className="!min-h-11">
                    Add education
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'certs' && (
            <div>
              {certifications.length === 0 && (
                <EmptyList label="certifications" />
              )}
              <ListScroll empty={certifications.length === 0}>
                {certifications.map((c) => (
                  <ListRow
                    key={c.id}
                    onRemove={() => handleDeleteCert(c.id)}
                  >
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {c.provider}
                      {c.issue_date ? ` · ${c.issue_date}` : ''}
                    </p>
                  </ListRow>
                ))}
              </ListScroll>
              <form onSubmit={handleAddCert} className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Certificate name"
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm({ ...certForm, name: e.target.value })
                  }
                  required
                  placeholder="AWS Solutions Architect"
                />
                <Field
                  label="Provider"
                  value={certForm.provider}
                  onChange={(e) =>
                    setCertForm({ ...certForm, provider: e.target.value })
                  }
                  placeholder="Amazon Web Services"
                />
                <Field
                  label="Issue date"
                  value={certForm.issue_date}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issue_date: e.target.value })
                  }
                  placeholder="2023-06"
                />
                <Field
                  label="Expiry date"
                  value={certForm.expiry_date}
                  onChange={(e) =>
                    setCertForm({ ...certForm, expiry_date: e.target.value })
                  }
                  placeholder="2026-06"
                />
                <Field
                  label="Credential ID"
                  value={certForm.credential_id}
                  onChange={(e) =>
                    setCertForm({ ...certForm, credential_id: e.target.value })
                  }
                  placeholder="ABCD-1234"
                />
                <Field
                  label="Credential URL"
                  value={certForm.credential_url}
                  onChange={(e) =>
                    setCertForm({ ...certForm, credential_url: e.target.value })
                  }
                  placeholder="https://credly.com/…"
                />
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary" className="!min-h-11">
                    Add certification
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
