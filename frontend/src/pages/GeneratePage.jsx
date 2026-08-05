import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  api,
  getStoredProfileId,
} from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { RequirementMatch } from '../components/RequirementMatch.jsx';
import {
  Alert,
  Button,
  Card,
  ChoiceCards,
  EmptyState,
  Field,
  GenerateSkeleton,
  PageHeader,
} from '../components/ui.jsx';

const LENGTH_PRESETS = [
  { label: 'Short', value: 800 },
  { label: 'Medium', value: 1200 },
  { label: 'Long', value: 1600 },
];

const OUTPUT_MODES = [
  {
    id: 'both',
    label: 'Resume + Cover letter',
    hint: 'Generate both documents at once',
  },
  {
    id: 'resume',
    label: 'Resume only',
    hint: 'Skip the cover letter',
  },
  {
    id: 'cover_letter',
    label: 'Cover letter only',
    hint: 'Skip the resume PDF',
  },
];

const TEMPLATES = [
  {
    id: 'color',
    label: 'Modern single column',
    hint: 'Minimal, left-aligned, parses cleanly',
    badge: 'ATS-Safe',
  },
  {
    id: 'simple',
    label: 'Premium ATS',
    hint: 'Inter + blue hierarchy, recruiter-scan optimized',
    badge: 'ATS-Safe',
  },
];

const CONTACT_MODES = [
  {
    id: 'with',
    label: 'With contact',
    hint: 'Email, phone, address & links — for company / email applications',
  },
  {
    id: 'without',
    label: 'Upwork-safe (no contact)',
    hint: 'Hides all contact channels so your proposal is less likely to get banned',
  },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Character counter bar ─────────────────────────────── */
function CharBar({ count, target }) {
  const pct = Math.min(100, Math.round((count / target) * 100));
  const delta = count - target;
  const color =
    Math.abs(delta) < target * 0.1
      ? 'bg-success'
      : Math.abs(delta) < target * 0.25
      ? 'bg-warning'
      : 'bg-danger';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{count.toLocaleString()} chars</span>
        <span className={Math.abs(delta) < 50 ? 'text-success font-semibold' : ''}>
          target {target} ({delta >= 0 ? '+' : ''}{delta})
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Detection score display ───────────────────────────── */
function DetectionCard({ stats }) {
  const aiPct = Math.round((stats.aiProbability || 0) * 100);
  const confPct = Math.round((stats.confidence || 0) * 100);
  const isHuman = stats.prediction === 'human';

  return (
    <div className={`rounded-xl border px-4 py-3.5 text-sm space-y-2 ${
      isHuman
        ? 'border-success/30 bg-success-soft'
        : 'border-danger/30 bg-danger-soft'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-ink">
          AI Detection:{' '}
          <span className={`capitalize ${isHuman ? 'text-success' : 'text-danger'}`}>
            {stats.prediction}
          </span>
        </p>
        <span className={`rf-badge ${isHuman ? 'rf-badge-success' : 'bg-danger-soft text-danger border border-danger/30'}`}>
          {aiPct}% AI
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>Confidence: {confPct}%</span>
        <span>Readability: {stats.readability?.fleschReadingEase ?? '—'}</span>
        <span>Burstiness σ: {stats.burstiness?.stdDev ?? '—'}</span>
        <span>Avg sentence: {stats.readability?.avgSentenceLength ?? '—'} words</span>
      </div>
    </div>
  );
}

/* ── Humanize stats card ───────────────────────────────── */
function HumanizeCard({ stats }) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3.5 text-sm space-y-2">
      <p className="font-bold text-navy">
        ✨ Humanized via NLP pipeline
        {stats.improved ? (
          <span className="ml-2 text-xs font-semibold text-success">
            · AI score reduced
          </span>
        ) : null}
      </p>
      {stats.metrics && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span>
            Similarity:{' '}
            {Math.round((stats.metrics.semanticSimilarity || 0) * 100)}%
          </span>
          <span>
            Readability: {stats.metrics.readability?.fleschReadingEase ?? '—'}
          </span>
          <span>Burstiness σ: {stats.metrics.burstiness?.stdDev ?? '—'}</span>
          <span>
            Lexical: {stats.metrics.vocabulary?.lexicalDiversity ?? '—'}
          </span>
        </div>
      )}
      {stats.warning && (
        <p className="text-xs font-medium text-warning">{stats.warning}</p>
      )}
    </div>
  );
}

import { useDispatch, useSelector } from 'react-redux';
import { addGenerationToHistory } from '../store/historySlice.js';
import { fetchProfile } from '../store/profileSlice.js';

export default function GeneratePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();

  const profileState = useSelector((state) => state.profile);
  const { core: profileCore, skills, experience, projects, education, certifications } = profileState;
  const profile = { ...profileCore, skills, experience, projects, education, certifications };

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetterLength, setCoverLetterLength] = useState(1200);
  const [customLength, setCustomLength] = useState('');
  const [outputMode, setOutputMode] = useState('both');
  const [resumeTemplate, setResumeTemplate] = useState('color');
  const [includeContact, setIncludeContact] = useState(true);

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generationId, setGenerationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState(null);
  const [humanizing, setHumanizing] = useState(false);
  const [humanizeStats, setHumanizeStats] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionStats, setDetectionStats] = useState(null);

  const wantsResume = outputMode === 'both' || outputMode === 'resume';
  const wantsCover = outputMode === 'both' || outputMode === 'cover_letter';

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  useEffect(() => {
    if (profileId) {
      dispatch(fetchProfile(profileId));
    }
  }, [dispatch, profileId]);

  useEffect(() => {
    const gid = searchParams.get('generation');
    if (!gid) return;

    async function loadGeneration() {
      try {
        const gen = await api.getGeneration(gid);
        setJobTitle(gen.job_title || '');
        setCompanyName(gen.company_name || '');
        setJobDescription(gen.job_description || '');
        setResume(gen.generated_resume_json);
        setCoverLetter(gen.generated_cover_letter || '');
        setGenerationId(gen.id);
        if (gen.output_mode) setOutputMode(gen.output_mode);
        if (gen.resume_template) setResumeTemplate(gen.resume_template);
        if (typeof gen.include_contact === 'boolean') {
          setIncludeContact(gen.include_contact);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    loadGeneration();
  }, [searchParams]);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setCopied(false);
    setHumanizeStats(null);
    setDetectionStats(null);

    if (!profileId) {
      setError('Create a profile first on the Profile page.');
      return;
    }

    const length = customLength ? Number(customLength) : Number(coverLetterLength);

    setLoading(true);
    try {
      const result = await api.generate({
        profile_id: profileId,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        cover_letter_length: length,
        output_mode: outputMode,
        resume_template: resumeTemplate,
        include_contact: includeContact,
      });
      setResume(result.resume || null);
      setCoverLetter(result.cover_letter || '');
      setGenerationId(result.generation_id);
      if (result.output_mode) setOutputMode(result.output_mode);
      if (result.resume_template) setResumeTemplate(result.resume_template);
      if (typeof result.include_contact === 'boolean') {
        setIncludeContact(result.include_contact);
      }

      // Add to Redux History Store automatically
      dispatch(
        addGenerationToHistory({
          id: result.generation_id,
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription,
          generated_resume_json: result.resume,
          generated_cover_letter: result.cover_letter,
          output_mode: result.output_mode || outputMode,
          resume_template: result.resume_template || resumeTemplate,
          created_at: new Date().toISOString(),
        })
      );
    } catch (err) {
      setError(err.message);
      setResume(null);
      setCoverLetter('');
      setGenerationId(null);
    } finally {
      setLoading(false);
    }
  }

  async function handlePdf() {
    if (!generationId) return;
    setPdfLoading(true);
    setError('');
    try {
      const blob = await api.downloadPdf(
        generationId,
        resumeTemplate,
        includeContact
      );
      downloadBlob(
        blob,
        `resume-${(companyName || 'application').replace(/\s+/g, '-')}-${resumeTemplate}.pdf`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPdfLoading(false);
    }
  }

  async function copyCoverLetter() {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleHumanize() {
    if (!generationId || !coverLetter) return;
    setHumanizing(true);
    setError('');
    try {
      const result = await api.humanizeCoverLetter(generationId, coverLetter);
      setCoverLetter(result.cover_letter || '');
      setHumanizeStats({
        engine: result.engine,
        warning: result.warning,
        improved: result.improved,
        metrics: result.metrics,
      });
      if (result.after?.detection) {
        setDetectionStats(result.after.detection);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setHumanizing(false);
    }
  }

  async function handleDetect() {
    if (!generationId || !coverLetter) return;
    setDetecting(true);
    setError('');
    try {
      const result = await api.detectCoverLetter(generationId, coverLetter);
      setDetectionStats(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetecting(false);
    }
  }

  const targetLength = customLength
    ? Number(customLength) || coverLetterLength
    : coverLetterLength;
  const charCount = coverLetter.length;
  const hasResults = !loading && (resume || coverLetter);

  if (!profileId) {
    return (
      <EmptyState
        title="Create a profile first"
        description="Generate needs your real experience and skills before it can craft a tailored application."
        action={
          <Link to="/" className="rf-btn rf-btn-primary">
            Go to Profile
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 rf-stagger">
      <PageHeader
        title="Generate"
        subtitle="Pick your outputs, select an ATS-safe template, paste the job posting — then generate."
      />

      {health && !health.gemini_ready && (
        <Alert tone="warning">
          Gemini API key is still the placeholder. Add your real{' '}
          <code className="text-xs font-mono bg-warning-soft px-1 rounded">GEMINI_API_KEY</code>{' '}
          in{' '}
          <code className="text-xs font-mono bg-warning-soft px-1 rounded">backend/.env</code>{' '}
          and restart the backend.
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {/* ── Form Card ───────────────────────────────────────── */}
      <Card>
        <form onSubmit={handleGenerate} className="space-y-6">

          {/* Output mode */}
          <div>
            <p className="text-sm font-bold text-ink mb-3">What to generate</p>
            <ChoiceCards
              options={OUTPUT_MODES}
              value={outputMode}
              onChange={setOutputMode}
            />
          </div>

          {/* Resume template */}
          {wantsResume && (
            <div>
              <p className="text-sm font-bold text-ink mb-3">Resume template</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((opt) => {
                  const active = resumeTemplate === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setResumeTemplate(opt.id)}
                      className={`rf-choice ${active ? 'rf-choice-active' : ''} text-left`}
                      aria-pressed={active}
                    >
                      <div className="flex items-start gap-3">
                        {/* Template thumbnail */}
                        <div
                          className={`mt-0.5 h-12 w-10 shrink-0 rounded-lg border overflow-hidden shadow-xs ${
                            opt.id === 'color'
                              ? 'border-accent/40'
                              : 'border-line-strong'
                          }`}
                        >
                          {opt.id === 'color' ? (
                            <div className="h-full w-full bg-gradient-to-b from-accent/50 via-navy/60 to-navy" />
                          ) : (
                            <div className="h-full flex flex-col items-start justify-start pt-1.5 gap-0.5 px-1.5 bg-white">
                              <div className="h-1 w-6 bg-navy rounded-full" />
                              <div className="h-px w-full bg-navy/30 mt-1" />
                              <div className="h-px w-full bg-line" />
                              <div className="h-px w-5 bg-line" />
                              <div className="h-px w-full bg-line mt-0.5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink leading-tight">
                            {opt.label}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                            {opt.hint}
                          </p>
                          <span className="mt-1.5 inline-flex rf-badge rf-badge-accent">
                            {opt.badge}
                          </span>
                        </div>
                        {active && (
                          <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-navy">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact details — With contact vs Upwork-safe */}
          {wantsResume && (
            <div>
              <p className="text-sm font-bold text-ink mb-1">Contact on resume</p>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Upwork and similar platforms can ban proposals that share email,
                phone, LinkedIn, or other ways to contact you outside the site.
                Use <span className="font-semibold text-navy">Upwork-safe</span>{' '}
                when applying there — your skills, experience, and projects stay;
                contact details do not.
              </p>
              <ChoiceCards
                options={CONTACT_MODES}
                value={includeContact ? 'with' : 'without'}
                onChange={(id) => setIncludeContact(id === 'with')}
              />
              <p
                className={`mt-2 text-xs leading-relaxed ${
                  includeContact ? 'text-ink-muted' : 'text-navy font-medium'
                }`}
              >
                {includeContact
                  ? 'Header includes email, phone, address, LinkedIn, GitHub, and portfolio.'
                  : 'Upwork-safe: no email, phone, address, or profile links — only name, title, and work content.'}
              </p>
            </div>
          )}

          {/* Job fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              placeholder="Senior Software Engineer"
            />
            <Field
              label="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Acme Corporation"
            />
          </div>

          <Field
            label="Job description"
            as="textarea"
            className="min-h-[200px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            placeholder="Paste the full job description here — the more detail, the better the tailoring…"
          />

          {/* Cover letter length */}
          {wantsCover && (
            <div>
              <p className="text-sm font-bold text-ink mb-3">Cover letter length</p>
              <div className="flex flex-wrap items-center gap-2">
                {LENGTH_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setCoverLetterLength(p.value);
                      setCustomLength('');
                    }}
                    className={`rf-btn !min-h-9 !px-3.5 !text-xs !rounded-lg ${
                      !customLength && coverLetterLength === p.value
                        ? 'rf-btn-primary'
                        : 'rf-btn-ghost'
                    }`}
                  >
                    {p.label}
                    <span className="text-[10px] opacity-70">~{p.value}</span>
                  </button>
                ))}
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-ink-muted font-medium text-xs">Custom:</span>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    placeholder="chars"
                    className="rf-input !w-24 !py-1.5 !px-2.5 !text-sm"
                    value={customLength}
                    onChange={(e) => setCustomLength(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-1">
            <Button
              type="submit"
              loading={loading}
              className="w-full sm:w-auto !min-h-12 !text-base !px-8"
            >
              {loading ? (
                <>Generating…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                  Generate application
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Loading state ───────────────────────────────────── */}
      {loading && <GenerateSkeleton />}

      {/* ── Results ─────────────────────────────────────────── */}
      {hasResults && (
        <div className="space-y-6 rf-enter">
          {resume?.requirement_match && (
            <RequirementMatch items={resume.requirement_match} />
          )}

          {/* Resume preview */}
          {resume && (
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-navy">Resume preview</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Template:{' '}
                    <span className="font-medium">
                      {TEMPLATES.find((t) => t.id === resumeTemplate)?.label || resumeTemplate}
                    </span>
                    {' · '}
                    {includeContact ? 'With contact' : 'Upwork-safe'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setResumeTemplate(t.id)}
                      className={`rf-btn !min-h-9 !px-3 !text-xs !rounded-lg ${
                        resumeTemplate === t.id ? 'rf-btn-primary' : 'rf-btn-ghost'
                      }`}
                    >
                      {t.id === 'color' ? 'Modern' : 'Premium'}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIncludeContact((v) => !v)}
                    className={`rf-btn !min-h-9 !px-3 !text-xs !rounded-lg ${
                      includeContact ? 'rf-btn-secondary' : 'rf-btn-primary'
                    }`}
                    title="Toggle contact details for Upwork vs normal applications"
                  >
                    {includeContact ? 'With contact' : 'Upwork-safe'}
                  </button>
                  <Button
                    type="button"
                    variant="accent"
                    className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                    onClick={handlePdf}
                    loading={pdfLoading}
                    disabled={pdfLoading || !generationId}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {pdfLoading ? 'Building…' : 'Download PDF'}
                  </Button>
                </div>
              </div>
              <ResumePreview
                resume={resume}
                profile={profile}
                template={resumeTemplate}
                includeContact={includeContact}
              />
            </section>
          )}

          {/* Cover letter */}
          {coverLetter && (
            <section className="rf-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-navy">Cover letter</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                    onClick={handleDetect}
                    loading={detecting}
                    disabled={detecting || !generationId}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {detecting ? 'Analyzing…' : 'Check AI'}
                  </Button>
                  <Button
                    type="button"
                    className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                    onClick={handleHumanize}
                    loading={humanizing}
                    disabled={humanizing || !generationId}
                  >
                    ✨ {humanizing ? 'Humanizing…' : 'Humanize'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                    onClick={copyCoverLetter}
                  >
                    {copied ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>
                    ) : (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" /></svg>Copy</>
                    )}
                  </Button>
                </div>
              </div>

              {wantsCover && targetLength ? (
                <CharBar count={charCount} target={targetLength} />
              ) : (
                <p className="text-xs text-ink-muted">{charCount.toLocaleString()} characters</p>
              )}

              {detectionStats && <DetectionCard stats={detectionStats} />}
              {humanizeStats && <HumanizeCard stats={humanizeStats} />}

              <textarea
                readOnly
                value={coverLetter}
                className="rf-input min-h-[260px] leading-relaxed font-sans"
              />
              <p className="text-xs text-ink-muted">
                💡 Humanize only rewrites the cover letter — your resume PDF is unaffected.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
