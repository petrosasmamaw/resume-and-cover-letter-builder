import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  EmptyState,
  Field,
  GenerateSkeleton,
  PageHeader,
} from '../components/ui.jsx';
import { addGenerationToHistory } from '../store/historySlice.js';
import { fetchProfile } from '../store/profileSlice.js';
import {
  clearGenerateResults,
  setCoverLetter,
  setDetectionStats,
  setGenerateField,
  setGenerateFields,
  setGenerateResults,
  setHumanizeStats,
} from '../store/generateSlice.js';

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

/* ── Compact vertical option list (sidebar filters) ─────── */
function CompactChoice({ options, value, onChange, 'aria-label': ariaLabel }) {
  return (
    <div className="rf-gen-options" role="listbox" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`rf-gen-option${active ? ' rf-gen-option-active' : ''}`}
          >
            <span className="rf-gen-option-label">{opt.label}</span>
            {opt.hint ? (
              <span className="rf-gen-option-hint">{opt.hint}</span>
            ) : null}
            {opt.badge ? (
              <span className="rf-gen-option-badge">{opt.badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
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
        Humanized for more natural rhythm
        {stats.improved ? (
          <span className="ml-2 text-xs font-semibold text-success">
            · AI-likeness score reduced
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

export default function GeneratePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();

  const profileState = useSelector((state) => state.profile);
  const {
    jobTitle,
    companyName,
    jobDescription,
    coverLetterLength,
    customLength,
    outputMode,
    resumeTemplate,
    includeContact,
    specialNotes,
    resume,
    coverLetter,
    generationId,
    humanizeStats,
    detectionStats,
  } = useSelector((state) => state.generate);

  const { core: profileCore, skills, experience, projects, education, certifications } = profileState;
  const profile = { ...profileCore, skills, experience, projects, education, certifications };

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState(null);
  const [humanizing, setHumanizing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const resultsRef = useRef(null);
  const scrollResultsPending = useRef(false);

  const setField = (key, value) => dispatch(setGenerateField({ key, value }));

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
        dispatch(
          setGenerateFields({
            jobTitle: gen.job_title || '',
            companyName: gen.company_name || '',
            jobDescription: gen.job_description || '',
            resume: gen.generated_resume_json,
            coverLetter: gen.generated_cover_letter || '',
            generationId: gen.id,
            outputMode: gen.output_mode || 'both',
            resumeTemplate: gen.resume_template || 'color',
            includeContact:
              typeof gen.include_contact === 'boolean'
                ? gen.include_contact
                : true,
            specialNotes: gen.special_notes || '',
            humanizeStats: null,
            detectionStats: null,
          })
        );
        scrollResultsPending.current = true;
      } catch (err) {
        setError(err.message);
      }
    }
    loadGeneration();
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!scrollResultsPending.current) return;
    if (!resume && !coverLetter) return;
    scrollResultsPending.current = false;
    const id = window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [resume, coverLetter]);

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setCopied(false);
    dispatch(setHumanizeStats(null));
    dispatch(setDetectionStats(null));

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
        special_notes: specialNotes.trim() || undefined,
      });
      dispatch(
        setGenerateResults({
          resume: result.resume || null,
          coverLetter: result.cover_letter || '',
          generationId: result.generation_id,
          outputMode: result.output_mode || outputMode,
          resumeTemplate: result.resume_template || resumeTemplate,
          includeContact:
            typeof result.include_contact === 'boolean'
              ? result.include_contact
              : includeContact,
          specialNotes:
            typeof result.special_notes === 'string'
              ? result.special_notes
              : specialNotes,
        })
      );

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
          include_contact: includeContact,
          special_notes: specialNotes.trim() || '',
          created_at: new Date().toISOString(),
        })
      );

      scrollResultsPending.current = true;
    } catch (err) {
      setError(err.message);
      dispatch(clearGenerateResults());
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
      dispatch(setCoverLetter(result.cover_letter || ''));
      dispatch(
        setHumanizeStats({
          engine: result.engine,
          warning: result.warning,
          improved: result.improved,
          metrics: result.metrics,
        })
      );
      if (result.after?.detection) {
        dispatch(setDetectionStats(result.after.detection));
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
      dispatch(setDetectionStats(result));
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

  const lengthOptions = LENGTH_PRESETS.map((p) => ({
    id: String(p.value),
    label: p.label,
    hint: `About ${p.value} characters`,
  }));

  if (!profileId) {
    return (
      <EmptyState
        title="Create a profile first"
        description="Generate needs your real experience and skills before it can craft a tailored application."
        action={
          <Link to="/profile" className="rf-btn rf-btn-primary">
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
        subtitle="Paste the job posting, set Special notes and contact mode, pick an ATS template — then forge resume and cover letter from your profile."
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

      <div className="rf-gen-layout">
        <aside className="rf-gen-aside" aria-label="Generate options">
          <div className="rf-gen-panel">
            <div className="rf-gen-section">
              <p className="rf-gen-section-title">What to generate</p>
              <CompactChoice
                aria-label="What to generate"
                options={OUTPUT_MODES}
                value={outputMode}
                onChange={(id) => setField('outputMode', id)}
              />
            </div>

            {wantsResume && (
              <div className="rf-gen-section">
                <p className="rf-gen-section-title">Resume template</p>
                <CompactChoice
                  aria-label="Resume template"
                  options={TEMPLATES}
                  value={resumeTemplate}
                  onChange={(id) => setField('resumeTemplate', id)}
                />
              </div>
            )}

            {wantsResume && (
              <div className="rf-gen-section">
                <p className="rf-gen-section-title">Contact on resume</p>
                <p className="rf-gen-contact-note">
                  Upwork and similar platforms can ban proposals that share email,
                  phone, LinkedIn, or other ways to contact you outside the site.
                  Use <span className="font-semibold text-navy">Upwork-safe</span>{' '}
                  when applying there — your skills, experience, and projects stay;
                  contact details do not.
                </p>
                <CompactChoice
                  aria-label="Contact on resume"
                  options={CONTACT_MODES}
                  value={includeContact ? 'with' : 'without'}
                  onChange={(id) => setField('includeContact', id === 'with')}
                />
                <p
                  className={`rf-gen-contact-note ${
                    includeContact ? '' : 'text-navy font-medium'
                  }`}
                >
                  {includeContact
                    ? 'Header includes email, phone, address, LinkedIn, GitHub, and portfolio.'
                    : 'Upwork-safe: no email, phone, address, or profile links — only name, title, and work content.'}
                </p>
              </div>
            )}

            {wantsCover && (
              <div className="rf-gen-section">
                <p className="rf-gen-section-title">Cover letter length</p>
                <CompactChoice
                  aria-label="Cover letter length"
                  options={lengthOptions}
                  value={customLength ? '' : String(coverLetterLength)}
                  onChange={(id) => {
                    setField('coverLetterLength', Number(id));
                    setField('customLength', '');
                  }}
                />
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-ink-muted font-medium text-xs">Custom:</span>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    placeholder="chars"
                    className="rf-input !w-24 !py-1.5 !px-2.5 !text-sm"
                    value={customLength}
                    onChange={(e) => setField('customLength', e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </aside>

        <div className="rf-gen-main">
          <div className="rf-gen-panel">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Job title"
                  value={jobTitle}
                  onChange={(e) => setField('jobTitle', e.target.value)}
                  required
                  placeholder="Senior Software Engineer"
                />
                <Field
                  label="Company name"
                  value={companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                  required
                  placeholder="Acme Corporation"
                />
              </div>

              <Field
                label="Job description"
                as="textarea"
                className="min-h-[7rem]"
                value={jobDescription}
                onChange={(e) => setField('jobDescription', e.target.value)}
                required
                placeholder="Paste the full job description here — the more detail, the better the tailoring…"
              />

              <div>
                <Field
                  label="Special notes (optional — this application only)"
                  as="textarea"
                  className="min-h-[4.5rem]"
                  value={specialNotes}
                  onChange={(e) => setField('specialNotes', e.target.value.slice(0, 4000))}
                  maxLength={4000}
                  placeholder={
                    'Tell Gemini what to add, emphasize, or leave out for THIS job only.\nExamples:\n• Emphasize React and Node; de-emphasize WordPress\n• Highlight the Tamagn Check project; skip older internships\n• Mention I led the payments migration for 6 months\n• Keep the cover letter shorter and more technical'
                  }
                />
                <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                  Applied only to this generation — does not change your saved profile.
                  Use it to tailor skills, experience, or tone for one application.
                  {specialNotes.trim()
                    ? ` · ${specialNotes.trim().length}/4000`
                    : ''}
                </p>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="accent"
                  loading={loading}
                  className="w-full sm:w-auto !min-h-11 !text-sm !px-6"
                >
                  {loading ? 'Generating…' : 'Generate application'}
                </Button>
              </div>
            </form>
          </div>

          {loading && <GenerateSkeleton />}

          {hasResults && (
            <div ref={resultsRef} className="space-y-5 rf-enter">
              {resume?.requirement_match ? (
                <RequirementMatch items={resume.requirement_match} />
              ) : null}

              {resume ? (
                <section className="rf-gen-panel space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-base font-bold text-navy">Resume</h2>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Full-page preview ·{' '}
                        <span className="font-medium">
                          {TEMPLATES.find((t) => t.id === resumeTemplate)?.label ||
                            resumeTemplate}
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
                          onClick={() => setField('resumeTemplate', t.id)}
                          className={`rf-btn !min-h-9 !px-3 !text-xs !rounded-lg ${
                            resumeTemplate === t.id ? 'rf-btn-primary' : 'rf-btn-ghost'
                          }`}
                        >
                          {t.id === 'color' ? 'Modern' : 'Premium'}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setField('includeContact', !includeContact)}
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

                  <div className="rf-gen-pdf-stage">
                    <div className="rf-gen-pdf-page">
                      <ResumePreview
                        resume={resume}
                        profile={profile}
                        template={resumeTemplate}
                        includeContact={includeContact}
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              {coverLetter ? (
                <section className="rf-gen-panel space-y-3 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-base font-bold text-navy">Cover letter</h2>
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
                        {humanizing ? 'Humanizing…' : 'Humanize'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                        onClick={copyCoverLetter}
                      >
                        {copied ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {wantsCover && targetLength ? (
                    <CharBar count={charCount} target={targetLength} />
                  ) : (
                    <p className="text-xs text-ink-muted">
                      {charCount.toLocaleString()} characters
                    </p>
                  )}

                  {detectionStats && <DetectionCard stats={detectionStats} />}
                  {humanizeStats && <HumanizeCard stats={humanizeStats} />}

                  <textarea
                    readOnly
                    value={coverLetter}
                    className="rf-input min-h-[16rem] w-full resize-y leading-relaxed font-sans"
                  />
                  <p className="text-xs text-ink-muted">
                    Humanize only rewrites the cover letter — your resume PDF is unaffected.
                  </p>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
