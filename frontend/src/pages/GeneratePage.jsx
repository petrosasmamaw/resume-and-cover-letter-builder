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
  LoadingState,
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
    hint: 'Generate both documents',
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
    label: 'Modern single column (ATS-Safe)',
    hint: 'Minimal, left-aligned, parses cleanly',
  },
  {
    id: 'simple',
    label: 'Premium ATS (single-column)',
    hint: 'Inter + blue hierarchy, recruiter-scan optimized',
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

export default function GeneratePage() {
  const [searchParams] = useSearchParams();
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();

  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetterLength, setCoverLetterLength] = useState(1200);
  const [customLength, setCustomLength] = useState('');
  const [outputMode, setOutputMode] = useState('both');
  const [resumeTemplate, setResumeTemplate] = useState('color');

  const [profile, setProfile] = useState(null);
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
    if (!profileId) return;
    api.getProfile(profileId).then(setProfile).catch(() => setProfile(null));
  }, [profileId]);

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

    const length = customLength
      ? Number(customLength)
      : Number(coverLetterLength);

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
      });
      setResume(result.resume || null);
      setCoverLetter(result.cover_letter || '');
      setGenerationId(result.generation_id);
      if (result.output_mode) setOutputMode(result.output_mode);
      if (result.resume_template) setResumeTemplate(result.resume_template);
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
      const blob = await api.downloadPdf(generationId, resumeTemplate);
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
        before: result.before,
        after: result.after,
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
  const charDelta = charCount - targetLength;
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
    <div className="space-y-4 sm:space-y-6 rf-stagger">
      <PageHeader
        title="Generate"
        subtitle="Choose outputs, pick an ATS-safe template, paste the job posting, then generate."
      />

      {health && !health.gemini_ready && (
        <Alert tone="warning">
          Gemini API key is still the placeholder. Add your real{' '}
          <code className="text-xs">GEMINI_API_KEY</code> in{' '}
          <code className="text-xs">backend/.env</code> and restart the backend.
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-ink mb-2">What to generate</p>
            <ChoiceCards
              options={OUTPUT_MODES}
              value={outputMode}
              onChange={setOutputMode}
            />
          </div>

          {wantsResume && (
            <div>
              <p className="text-sm font-semibold text-ink mb-2">Resume template</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TEMPLATES.map((opt) => {
                  const active = resumeTemplate === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setResumeTemplate(opt.id)}
                      className={`rf-choice ${active ? 'rf-choice-active' : ''}`}
                      aria-pressed={active}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-11 w-9 shrink-0 rounded-md border overflow-hidden ${
                            opt.id === 'color'
                              ? 'bg-navy border-navy'
                              : 'bg-white border-line'
                          }`}
                        >
                          {opt.id === 'color' ? (
                            <div className="h-full w-full bg-gradient-to-b from-accent/40 to-navy" />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-start pt-1.5 gap-0.5 px-1">
                              <div className="h-0.5 w-5 bg-navy" />
                              <div className="h-px w-full bg-navy mt-1" />
                              <div className="h-px w-full bg-line" />
                              <div className="h-px w-full bg-line" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {opt.label}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                            {opt.hint}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy">
                            ATS-Safe
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
            <Field
              label="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <Field
            label="Job description"
            as="textarea"
            className="min-h-[180px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            placeholder="Paste the full job description here…"
          />

          {wantsCover && (
            <div>
              <p className="text-sm text-ink-muted mb-2">Cover letter length</p>
              <div className="flex flex-wrap items-center gap-2">
                {LENGTH_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setCoverLetterLength(p.value);
                      setCustomLength('');
                    }}
                    className={`rf-btn !min-h-9 !px-3 !text-xs ${
                      !customLength && coverLetterLength === p.value
                        ? 'rf-btn-primary'
                        : 'rf-btn-ghost'
                    }`}
                  >
                    {p.label} ~{p.value}
                  </button>
                ))}
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-ink-muted">Custom</span>
                  <input
                    type="number"
                    min={200}
                    max={5000}
                    placeholder="chars"
                    className="rf-input w-24 !py-1.5"
                    value={customLength}
                    onChange={(e) => setCustomLength(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            {loading ? 'Generating…' : 'Generate application'}
          </Button>
        </form>
      </Card>

      {loading && (
        <LoadingState label="Calling Gemini and crafting your materials…" />
      )}

      {hasResults && (
        <div className="space-y-5 rf-enter">
          {resume?.requirement_match && (
            <RequirementMatch items={resume.requirement_match} />
          )}

          {resume && (
            <section className="space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-navy">
                    Resume preview
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Template:{' '}
                    {TEMPLATES.find((t) => t.id === resumeTemplate)?.label ||
                      resumeTemplate}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setResumeTemplate(t.id)}
                      className={`rf-btn !min-h-9 !px-3 !text-xs ${
                        resumeTemplate === t.id
                          ? 'rf-btn-primary'
                          : 'rf-btn-ghost'
                      }`}
                    >
                      {t.id === 'color' ? 'Modern' : 'Premium'}
                    </button>
                  ))}
                  <Button
                    type="button"
                    variant="accent"
                    className="!min-h-9 !text-xs"
                    onClick={handlePdf}
                    loading={pdfLoading}
                    disabled={pdfLoading || !generationId}
                  >
                    {pdfLoading ? 'Building PDF…' : 'Download PDF'}
                  </Button>
                </div>
              </div>
              <ResumePreview
                resume={resume}
                profile={profile}
                template={resumeTemplate}
              />
            </section>
          )}

          {coverLetter && (
            <section className="rf-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-navy">Cover letter</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="!min-h-9 !text-xs"
                    onClick={handleDetect}
                    loading={detecting}
                    disabled={detecting || !generationId}
                  >
                    {detecting ? 'Analyzing…' : 'Check AI'}
                  </Button>
                  <Button
                    type="button"
                    className="!min-h-9 !text-xs"
                    onClick={handleHumanize}
                    loading={humanizing}
                    disabled={humanizing || !generationId}
                  >
                    {humanizing ? 'Humanizing…' : 'Humanize'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!min-h-9 !text-xs"
                    onClick={copyCoverLetter}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                {charCount} characters
                {wantsCover && targetLength
                  ? ` · target ${targetLength} (${charDelta >= 0 ? '+' : ''}${charDelta})`
                  : ''}
                {' · '}Humanize only rewrites the cover letter.
              </p>
              {detectionStats && (
                <div className="rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2.5 text-xs text-ink space-y-1">
                  <p className="font-semibold">
                    AI detection:{' '}
                    <span className="capitalize">
                      {detectionStats.prediction}
                    </span>
                    {' · '}
                    {Math.round((detectionStats.confidence || 0) * 100)}% confidence
                    {' · '}
                    AI score{' '}
                    {Math.round((detectionStats.aiProbability || 0) * 100)}%
                  </p>
                  <p className="text-ink-muted">
                    Readability{' '}
                    {detectionStats.readability?.fleschReadingEase ?? '—'}
                    {' · '}
                    Burstiness σ {detectionStats.burstiness?.stdDev ?? '—'}
                    {' · '}
                    Avg sentence{' '}
                    {detectionStats.readability?.avgSentenceLength ?? '—'} words
                  </p>
                </div>
              )}
              {humanizeStats && (
                <div className="rounded-[var(--radius-md)] border border-accent/30 bg-accent-soft px-3 py-2.5 text-xs text-navy space-y-1">
                  <p className="font-semibold">
                    Humanized via NLP pipeline
                    {humanizeStats.improved ? ' · AI score reduced' : ''}
                  </p>
                  {humanizeStats.metrics && (
                    <p>
                      Similarity{' '}
                      {Math.round(
                        (humanizeStats.metrics.semanticSimilarity || 0) * 100
                      )}
                      % · Readability{' '}
                      {humanizeStats.metrics.readability?.fleschReadingEase ??
                        '—'}{' '}
                      · Burstiness σ{' '}
                      {humanizeStats.metrics.burstiness?.stdDev ?? '—'} · Lexical{' '}
                      {humanizeStats.metrics.vocabulary?.lexicalDiversity ??
                        '—'}
                    </p>
                  )}
                  {humanizeStats.warning && (
                    <p className="text-warning">{humanizeStats.warning}</p>
                  )}
                </div>
              )}
              <textarea
                readOnly
                value={coverLetter}
                className="rf-input min-h-[240px] leading-relaxed"
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
