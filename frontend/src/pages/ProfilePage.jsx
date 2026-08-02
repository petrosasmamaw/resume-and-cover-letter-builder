import { useCallback, useEffect, useState } from 'react';
import {
  api,
  setStoredProfileId,
} from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Alert,
  Button,
  Card,
  CardTitle,
  Field,
  LoadingState,
  PageHeader,
} from '../components/ui.jsx';

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

function Section({ title, eyebrow, children }) {
  return (
    <Card className="rf-enter">
      <CardTitle eyebrow={eyebrow}>{title}</CardTitle>
      {children}
    </Card>
  );
}

function TextArea({ label, ...props }) {
  return <Field label={label} as="textarea" className="min-h-[88px]" {...props} />;
}

function EmptyList({ label }) {
  return (
    <p className="mb-4 rounded-[var(--radius-md)] border border-dashed border-line bg-surface/60 px-3 py-4 text-sm text-ink-muted">
      No {label} yet — add your first below.
    </p>
  );
}

export default function ProfilePage() {
  const { profileId: authProfileId, setProfileId: setAuthProfileId } = useAuth();
  const [profileId, setProfileId] = useState(authProfileId);
  const [core, setCore] = useState(emptyCore);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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

  const loadProfile = useCallback(async (id) => {
    const data = await api.getProfile(id);
    setCore({
      full_name: data.full_name || '',
      title: data.title || '',
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || '',
      linkedin_url: data.linkedin_url || '',
      github_url: data.github_url || '',
      portfolio_url: data.portfolio_url || '',
      summary: data.summary || '',
    });
    setSkills(data.skills || []);
    setExperience(data.experience || []);
    setProjects(data.projects || []);
    setEducation(data.education || []);
    setCertifications(data.certifications || []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError('');
      try {
        let id = authProfileId;
        if (!id) {
          const list = await api.listProfiles();
          if (list.length) id = list[0].id;
        }
        if (id) {
          setStoredProfileId(id);
          setAuthProfileId(id);
          await loadProfile(id);
        }
        if (!cancelled) setProfileId(id);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.status === 401
              ? 'Please sign in again.'
              : err.message
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadProfile, authProfileId, setAuthProfileId]);

  async function saveCore(e) {
    e.preventDefault();
    setStatus('');
    setError('');
    try {
      if (!profileId) {
        const created = await api.createProfile(core);
        setProfileId(created.id);
        setStoredProfileId(created.id);
        setAuthProfileId(created.id);
        setStatus('Profile created');
      } else {
        await api.updateProfile(profileId, core);
        setStatus('Profile saved');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function ensureProfile() {
    if (profileId) return profileId;
    const created = await api.createProfile(core);
    setProfileId(created.id);
    setStoredProfileId(created.id);
    setAuthProfileId(created.id);
    return created.id;
  }

  async function addSkill(e) {
    e.preventDefault();
    try {
      const id = await ensureProfile();
      await api.addSkill(id, skillForm);
      setSkillForm({ category: '', name: '' });
      await loadProfile(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addExp(e) {
    e.preventDefault();
    try {
      const id = await ensureProfile();
      await api.addExperience(id, {
        ...expForm,
        end_date: expForm.end_date || null,
      });
      setExpForm({
        role_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
      });
      await loadProfile(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addProject(e) {
    e.preventDefault();
    try {
      const id = await ensureProfile();
      await api.addProject(id, {
        ...projectForm,
        tech_stack: projectForm.tech_stack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setProjectForm({ name: '', url: '', description: '', tech_stack: '' });
      await loadProfile(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addEdu(e) {
    e.preventDefault();
    try {
      const id = await ensureProfile();
      await api.addEducation(id, eduForm);
      setEduForm({
        institution: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
      });
      await loadProfile(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addCert(e) {
    e.preventDefault();
    try {
      const id = await ensureProfile();
      await api.addCertification(id, certForm);
      setCertForm({
        name: '',
        provider: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
      });
      await loadProfile(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fillWithAi(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (!pasteText.trim()) {
      setError('Paste your profile or CV text first.');
      return;
    }
    setAiParsing(true);
    try {
      const filled = await api.parseProfileAi({
        text: pasteText,
        profile_id: profileId || undefined,
      });
      setProfileId(filled.id);
      setStoredProfileId(filled.id);
      setAuthProfileId(filled.id);
      setCore({
        full_name: filled.full_name || '',
        title: filled.title || '',
        email: filled.email || '',
        phone: filled.phone || '',
        location: filled.location || '',
        linkedin_url: filled.linkedin_url || '',
        github_url: filled.github_url || '',
        portfolio_url: filled.portfolio_url || '',
        summary: filled.summary || '',
      });
      setSkills(filled.skills || []);
      setExperience(filled.experience || []);
      setProjects(filled.projects || []);
      setEducation(filled.education || []);
      setCertifications(filled.certifications || []);
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
          'AI filled your profile from the pasted text. Review each section and edit anything that looks off.'
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setAiParsing(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading profile…" />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 rf-stagger">
      <PageHeader
        title="Your profile"
        subtitle="Fill this once. Generations pull from this data — Gemini only rephrases and reorders what you enter here."
      />

      {error && <Alert tone="error">{error}</Alert>}
      {status && <Alert tone="success">{status}</Alert>}

      <Section title="Fill with AI" eyebrow="Fast start">
        <p className="text-sm text-ink-muted mb-3 leading-relaxed">
          Paste a CV, LinkedIn export, or notes. AI merges into your existing
          profile: duplicates are skipped, only new items are added.
        </p>
        <form onSubmit={fillWithAi} className="space-y-3">
          <textarea
            className="rf-input min-h-[160px]"
            placeholder="Paste new or extra profile info here…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={aiParsing}
          />
          <Button
            type="submit"
            variant="accent"
            loading={aiParsing}
            disabled={aiParsing || !pasteText.trim()}
          >
            {aiParsing
              ? 'Classifying & merging…'
              : 'Classify & merge into profile'}
          </Button>
        </form>
      </Section>

      <Section title="Core details" eyebrow="Identity">
        <form onSubmit={saveCore} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Full name"
            value={core.full_name}
            onChange={(e) => setCore({ ...core, full_name: e.target.value })}
            required
          />
          <Field
            label="Title"
            value={core.title}
            onChange={(e) => setCore({ ...core, title: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            value={core.email}
            onChange={(e) => setCore({ ...core, email: e.target.value })}
          />
          <Field
            label="Phone"
            value={core.phone}
            onChange={(e) => setCore({ ...core, phone: e.target.value })}
          />
          <Field
            label="Location"
            value={core.location}
            onChange={(e) => setCore({ ...core, location: e.target.value })}
          />
          <Field
            label="LinkedIn URL"
            value={core.linkedin_url}
            onChange={(e) => setCore({ ...core, linkedin_url: e.target.value })}
          />
          <Field
            label="GitHub URL"
            value={core.github_url}
            onChange={(e) => setCore({ ...core, github_url: e.target.value })}
          />
          <Field
            label="Portfolio URL"
            value={core.portfolio_url}
            onChange={(e) =>
              setCore({ ...core, portfolio_url: e.target.value })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Summary / about me"
              value={core.summary}
              onChange={(e) => setCore({ ...core, summary: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">
              {profileId ? 'Save profile' : 'Create profile'}
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Skills" eyebrow="Capabilities">
        {skills.length === 0 ? (
          <EmptyList label="skills" />
        ) : (
          <ul className="mb-4 space-y-1 text-sm">
            {skills.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 border-b border-line py-2.5"
              >
                <span className="min-w-0 truncate">
                  <span className="text-ink-muted">{s.category}</span>
                  {s.category ? ' · ' : ''}
                  {s.name}
                </span>
                <button
                  type="button"
                  className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0"
                  onClick={async () => {
                    await api.deleteSkill(profileId, s.id);
                    await loadProfile(profileId);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addSkill} className="grid gap-3 sm:grid-cols-3">
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
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Add skill
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Experience" eyebrow="Work history">
        {experience.length === 0 && <EmptyList label="experience" />}
        <ul className="mb-4 space-y-3 text-sm">
          {experience.map((exp) => (
            <li key={exp.id} className="border-b border-line pb-3">
              <div className="flex justify-between gap-2">
                <p className="font-medium">
                  {exp.role_title} · {exp.company}
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0"
                  onClick={async () => {
                    await api.deleteExperience(profileId, exp.id);
                    await loadProfile(profileId);
                  }}
                >
                  Remove
                </button>
              </div>
              <p className="text-ink-muted text-xs">
                {exp.start_date}
                {exp.end_date ? ` – ${exp.end_date}` : ' – Present'}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{exp.description}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addExp} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Role title"
            value={expForm.role_title}
            onChange={(e) =>
              setExpForm({ ...expForm, role_title: e.target.value })
            }
            required
          />
          <Field
            label="Company"
            value={expForm.company}
            onChange={(e) =>
              setExpForm({ ...expForm, company: e.target.value })
            }
            required
          />
          <Field
            label="Location"
            value={expForm.location}
            onChange={(e) =>
              setExpForm({ ...expForm, location: e.target.value })
            }
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
            label="End date (leave blank for Present)"
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
            />
          </div>
          <button
            type="submit"
            className="rf-btn rf-btn-secondary w-fit"
          >
            Add experience
          </button>
        </form>
      </Section>

      <Section title="Projects" eyebrow="Portfolio">
        {projects.length === 0 && <EmptyList label="projects" />}
        <ul className="mb-4 space-y-3 text-sm">
          {projects.map((p) => (
            <li key={p.id} className="border-b border-line pb-3">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                <button
                  type="button"
                  className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0"
                  onClick={async () => {
                    await api.deleteProject(profileId, p.id);
                    await loadProfile(profileId);
                  }}
                >
                  Remove
                </button>
              </div>
              {p.tech_stack?.length > 0 && (
                <p className="text-xs text-ink-muted">
                  {p.tech_stack.join(' · ')}
                </p>
              )}
              <p className="mt-1 whitespace-pre-wrap">{p.description}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addProject} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Name"
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm({ ...projectForm, name: e.target.value })
            }
            required
          />
          <Field
            label="URL"
            value={projectForm.url}
            onChange={(e) =>
              setProjectForm({ ...projectForm, url: e.target.value })
            }
          />
          <Field
            label="Tech stack (comma-separated)"
            value={projectForm.tech_stack}
            onChange={(e) =>
              setProjectForm({ ...projectForm, tech_stack: e.target.value })
            }
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="rf-btn rf-btn-secondary w-fit"
          >
            Add project
          </button>
        </form>
      </Section>

      <Section title="Education" eyebrow="Background">
        {education.length === 0 && <EmptyList label="education" />}
        <ul className="mb-4 space-y-2 text-sm">
          {education.map((edu) => (
            <li
              key={edu.id}
              className="flex justify-between border-b border-line py-2"
            >
              <span>
                {edu.degree} {edu.field ? `in ${edu.field}` : ''} ·{' '}
                {edu.institution}
              </span>
              <button
                type="button"
                className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0"
                onClick={async () => {
                  await api.deleteEducation(profileId, edu.id);
                  await loadProfile(profileId);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addEdu} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Institution"
            value={eduForm.institution}
            onChange={(e) =>
              setEduForm({ ...eduForm, institution: e.target.value })
            }
            required
          />
          <Field
            label="Degree"
            value={eduForm.degree}
            onChange={(e) =>
              setEduForm({ ...eduForm, degree: e.target.value })
            }
          />
          <Field
            label="Field"
            value={eduForm.field}
            onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
          />
          <Field
            label="Start"
            value={eduForm.start_date}
            onChange={(e) =>
              setEduForm({ ...eduForm, start_date: e.target.value })
            }
          />
          <Field
            label="End"
            value={eduForm.end_date}
            onChange={(e) =>
              setEduForm({ ...eduForm, end_date: e.target.value })
            }
          />
          <button
            type="submit"
            className="rf-btn rf-btn-secondary w-fit"
          >
            Add education
          </button>
        </form>
      </Section>

      <Section title="Certifications" eyebrow="Credentials">
        {certifications.length === 0 && <EmptyList label="certifications" />}
        <ul className="mb-4 space-y-2 text-sm">
          {certifications.map((c) => (
            <li
              key={c.id}
              className="flex justify-between border-b border-line py-2"
            >
              <span>
                {c.name} · {c.provider}
              </span>
              <button
                type="button"
                className="rf-btn rf-btn-danger !min-h-8 !px-2.5 !text-xs shrink-0"
                onClick={async () => {
                  await api.deleteCertification(profileId, c.id);
                  await loadProfile(profileId);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addCert} className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Name"
            value={certForm.name}
            onChange={(e) =>
              setCertForm({ ...certForm, name: e.target.value })
            }
            required
          />
          <Field
            label="Provider"
            value={certForm.provider}
            onChange={(e) =>
              setCertForm({ ...certForm, provider: e.target.value })
            }
          />
          <Field
            label="Issue date"
            value={certForm.issue_date}
            onChange={(e) =>
              setCertForm({ ...certForm, issue_date: e.target.value })
            }
          />
          <Field
            label="Expiry date"
            value={certForm.expiry_date}
            onChange={(e) =>
              setCertForm({ ...certForm, expiry_date: e.target.value })
            }
          />
          <Field
            label="Credential ID"
            value={certForm.credential_id}
            onChange={(e) =>
              setCertForm({ ...certForm, credential_id: e.target.value })
            }
          />
          <Field
            label="Credential URL"
            value={certForm.credential_url}
            onChange={(e) =>
              setCertForm({ ...certForm, credential_url: e.target.value })
            }
          />
          <button
            type="submit"
            className="rf-btn rf-btn-secondary w-fit"
          >
            Add certification
          </button>
        </form>
      </Section>
    </div>
  );
}
