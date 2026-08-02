import { useEffect, useState } from 'react';
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

/* ── Section wrapper ──────────────────────────────────── */
function Section({ title, eyebrow, children, icon }) {
  return (
    <Card className="rf-enter" accent>
      <div className="flex items-start gap-3 mb-5">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-navy text-base">
            {icon}
          </div>
        )}
        <CardTitle eyebrow={eyebrow}>{title}</CardTitle>
      </div>
      {children}
    </Card>
  );
}

/* ── Textarea field ───────────────────────────────────── */
function TextArea({ label, ...props }) {
  return <Field label={label} as="textarea" className="min-h-[96px]" {...props} />;
}

/* ── Empty list placeholder ───────────────────────────── */
function EmptyList({ label }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-700">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-slate-500">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      No {label} yet — add your first below.
    </div>
  );
}

/* ── Remove button ────────────────────────────────────── */
function RemoveBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0 gap-1"
      aria-label="Remove"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Remove</span>
    </button>
  );
}

/* ── List item row ────────────────────────────────────── */
function ListRow({ children, onRemove }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 shadow-xs transition-colors hover:bg-white">
      <div className="min-w-0 flex-1 text-sm">{children}</div>
      <RemoveBtn onClick={onRemove} />
    </li>
  );
}

/* ── Main component ───────────────────────────────────── */
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

  // Sync Redux core data to local form state
  useEffect(() => {
    if (reduxCore) {
      setCore(reduxCore);
    }
  }, [reduxCore]);

  // Sync Auth profileId if changed via Redux
  useEffect(() => {
    if (profileId && profileId !== authProfileId) {
      setAuthProfileId(profileId);
    }
  }, [profileId, authProfileId, setAuthProfileId]);

  // Fetch profile via Redux Thunk (Redux condition prevents refetch if already cached!)
  useEffect(() => {
    dispatch(fetchProfile(authProfileId));
  }, [dispatch, authProfileId]);

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
      setExpForm({ role_title: '', company: '', location: '', start_date: '', end_date: '', description: '' });
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
      setEduForm({ institution: '', degree: '', field: '', start_date: '', end_date: '' });
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
      setCertForm({ name: '', provider: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' });
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
      const filled = await dispatch(parseProfileAi({ text: pasteText, profileId })).unwrap();
      setPasteText('');
      const m = filled.merge;
      if (m) {
        const addedTotal = Object.values(m.added || {}).reduce((a, b) => a + b, 0);
        const skippedTotal = Object.values(m.skipped || {}).reduce((a, b) => a + b, 0);
        setStatus(
          `AI merge complete — added ${addedTotal} new item(s), skipped ${skippedTotal} duplicate(s). Existing data was kept.`
        );
      } else {
        setStatus('AI filled your profile from the pasted text. Review each section.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err || 'AI parsing failed');
    } finally {
      setAiParsing(false);
    }
  }

  // Render Skeleton ONLY when profile is fetching from backend for the first time
  if (reduxStatus === 'loading' && !profileId) {
    return <ProfileSkeleton />;
  }

  const displayError = error || reduxError;

  return (
    <div className="space-y-5 sm:space-y-6 rf-stagger">
      <PageHeader
        title="Your profile"
        subtitle="Fill this once. Generations pull from this data — Gemini only rephrases and reorders what you enter here."
      />

      {displayError && <Alert tone="error">{displayError}</Alert>}
      {status && <Alert tone="success">{status}</Alert>}

      {/* ── AI Fill ────────────────────────────────────────── */}
      <div className="rf-card rf-card-accent rf-enter overflow-hidden">
        <div className="px-6 pt-6 pb-5 bg-teal-50/80 border-b border-teal-200">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
              🤖
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                Fast start
              </p>
              <h2 className="text-xl font-bold text-navy tracking-tight">
                Fill with AI
              </h2>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mt-2 ml-12">
            Paste a CV, LinkedIn export, or notes. AI merges into your existing
            profile — duplicates are skipped, only new items are added.
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleFillWithAi} className="space-y-3">
            <textarea
              className="rf-input min-h-[140px]"
              placeholder="Paste new or extra profile info here — CV text, LinkedIn export, notes…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={aiParsing}
            />
            <Button
              type="submit"
              variant="accent"
              loading={aiParsing}
              disabled={aiParsing || !pasteText.trim()}
              className="w-full sm:w-auto !min-h-11"
            >
              {aiParsing ? 'Classifying & merging…' : '✨ Classify & merge into profile'}
            </Button>
          </form>
        </div>
      </div>

      {/* ── Core Details ───────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            👤
          </span>
          <CardTitle eyebrow="Identity">Core details</CardTitle>
        </div>
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
            onChange={(e) => setCore({ ...core, linkedin_url: e.target.value })}
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
            onChange={(e) => setCore({ ...core, portfolio_url: e.target.value })}
            placeholder="janesmith.dev"
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Summary / about me"
              value={core.summary}
              onChange={(e) => setCore({ ...core, summary: e.target.value })}
              placeholder="A brief professional summary that highlights your experience and goals…"
            />
          </div>
          <div className="sm:col-span-2 pt-1">
            <Button type="submit" className="!min-h-11">
              {profileId ? 'Save profile' : 'Create profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Skills ─────────────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            ⚡
          </span>
          <CardTitle eyebrow="Capabilities">Skills</CardTitle>
        </div>
        {skills.length === 0 ? (
          <EmptyList label="skills" />
        ) : (
          <ul className="mb-5 space-y-2">
            {skills.map((s) => (
              <ListRow
                key={s.id}
                onRemove={() => handleDeleteSkill(s.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {s.category && (
                    <span className="inline-flex items-center rounded-full bg-accent-soft border border-line-accent px-2.5 py-0.5 text-xs font-semibold text-navy">
                      {s.category}
                    </span>
                  )}
                  <span className="font-medium text-ink">{s.name}</span>
                </div>
              </ListRow>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddSkill} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field
            label="Category"
            placeholder="Frontend"
            value={skillForm.category}
            onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
          />
          <Field
            label="Skill name"
            placeholder="React"
            value={skillForm.name}
            onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
            required
          />
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full !min-h-11">
              + Add skill
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Experience ─────────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            💼
          </span>
          <CardTitle eyebrow="Work history">Experience</CardTitle>
        </div>
        {experience.length === 0 && <EmptyList label="experience" />}
        <ul className="mb-5 space-y-2">
          {experience.map((exp) => (
            <ListRow
              key={exp.id}
              onRemove={() => handleDeleteExp(exp.id)}
            >
              <p className="font-bold text-ink">
                {exp.role_title}
                <span className="font-medium text-ink-muted"> · {exp.company}</span>
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {exp.start_date}
                {exp.end_date ? ` – ${exp.end_date}` : ' – Present'}
                {exp.location ? ` · ${exp.location}` : ''}
              </p>
              {exp.description && (
                <p className="mt-1.5 text-xs text-ink whitespace-pre-wrap leading-relaxed line-clamp-3">
                  {exp.description}
                </p>
              )}
            </ListRow>
          ))}
        </ul>
        <form onSubmit={handleAddExp} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Role title"
            value={expForm.role_title}
            onChange={(e) => setExpForm({ ...expForm, role_title: e.target.value })}
            required
            placeholder="Software Engineer"
          />
          <Field
            label="Company"
            value={expForm.company}
            onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
            required
            placeholder="Acme Corp"
          />
          <Field
            label="Location"
            value={expForm.location}
            onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
            placeholder="Remote"
          />
          <Field
            label="Start date"
            type="date"
            value={expForm.start_date}
            onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
          />
          <Field
            label="End date (blank = Present)"
            type="date"
            value={expForm.end_date}
            onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Description / bullet notes"
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              placeholder="Key responsibilities and achievements…"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" className="!min-h-11">
              + Add experience
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Projects ───────────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            🚀
          </span>
          <CardTitle eyebrow="Portfolio">Projects</CardTitle>
        </div>
        {projects.length === 0 && <EmptyList label="projects" />}
        <ul className="mb-5 space-y-2">
          {projects.map((p) => (
            <ListRow
              key={p.id}
              onRemove={() => handleDeleteProject(p.id)}
            >
              <p className="font-bold text-ink">{p.name}</p>
              {p.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.tech_stack.map((t) => (
                    <span key={t} className="inline-flex rounded-full bg-surface border border-line px-2 py-0.5 text-xs text-ink-muted">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {p.description && (
                <p className="mt-1.5 text-xs text-ink whitespace-pre-wrap leading-relaxed line-clamp-2">
                  {p.description}
                </p>
              )}
            </ListRow>
          ))}
        </ul>
        <form onSubmit={handleAddProject} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Project name"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            required
            placeholder="My Awesome App"
          />
          <Field
            label="URL"
            value={projectForm.url}
            onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
            placeholder="https://example.com"
          />
          <div className="sm:col-span-2">
            <Field
              label="Tech stack (comma-separated)"
              value={projectForm.tech_stack}
              onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="What the project does and your role…"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" className="!min-h-11">
              + Add project
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Education ──────────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            🎓
          </span>
          <CardTitle eyebrow="Background">Education</CardTitle>
        </div>
        {education.length === 0 && <EmptyList label="education" />}
        <ul className="mb-5 space-y-2">
          {education.map((edu) => (
            <ListRow
              key={edu.id}
              onRemove={() => handleDeleteEdu(edu.id)}
            >
              <p className="font-bold text-ink">
                {edu.degree}
                {edu.field ? ` in ${edu.field}` : ''}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                {edu.institution}
                {(edu.start_date || edu.end_date) && (
                  <> · {edu.start_date}{edu.end_date ? ` – ${edu.end_date}` : ''}</>
                )}
              </p>
            </ListRow>
          ))}
        </ul>
        <form onSubmit={handleAddEdu} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Institution"
            value={eduForm.institution}
            onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
            required
            placeholder="University of California, Berkeley"
          />
          <Field
            label="Degree"
            value={eduForm.degree}
            onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
            placeholder="B.Sc."
          />
          <Field
            label="Field of study"
            value={eduForm.field}
            onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
            placeholder="Computer Science"
          />
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-2">
            <Field
              label="Start"
              value={eduForm.start_date}
              onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })}
              placeholder="2018"
            />
            <Field
              label="End"
              value={eduForm.end_date}
              onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })}
              placeholder="2022"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" className="!min-h-11">
              + Add education
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Certifications ─────────────────────────────────── */}
      <Card accent className="rf-enter">
        <div className="flex items-start gap-3 mb-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-base border border-line-accent">
            🏆
          </span>
          <CardTitle eyebrow="Credentials">Certifications</CardTitle>
        </div>
        {certifications.length === 0 && <EmptyList label="certifications" />}
        <ul className="mb-5 space-y-2">
          {certifications.map((c) => (
            <ListRow
              key={c.id}
              onRemove={() => handleDeleteCert(c.id)}
            >
              <p className="font-bold text-ink">{c.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {c.provider}
                {c.issue_date ? ` · ${c.issue_date}` : ''}
              </p>
            </ListRow>
          ))}
        </ul>
        <form onSubmit={handleAddCert} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Certificate name"
            value={certForm.name}
            onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
            required
            placeholder="AWS Solutions Architect"
          />
          <Field
            label="Provider"
            value={certForm.provider}
            onChange={(e) => setCertForm({ ...certForm, provider: e.target.value })}
            placeholder="Amazon Web Services"
          />
          <Field
            label="Issue date"
            value={certForm.issue_date}
            onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
            placeholder="2023-06"
          />
          <Field
            label="Expiry date"
            value={certForm.expiry_date}
            onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })}
            placeholder="2026-06"
          />
          <Field
            label="Credential ID"
            value={certForm.credential_id}
            onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
            placeholder="ABCD-1234"
          />
          <Field
            label="Credential URL"
            value={certForm.credential_url}
            onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
            placeholder="https://credly.com/…"
          />
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" className="!min-h-11">
              + Add certification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
