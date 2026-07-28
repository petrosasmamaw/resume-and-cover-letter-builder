import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  api,
  getStoredProfileId,
} from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { RequirementMatch } from '../components/RequirementMatch.jsx';

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
    label: 'Color accent',
    hint: 'Navy sidebar + modern layout',
  },
  {
    id: 'simple',
    label: 'Simple classic',
    hint: 'Centered header, clean black rules',
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

function ChoiceCards({ options, value, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-lg border px-3 py-3 text-left transition-colors ${
              active
                ? 'border-navy bg-navy/5 ring-1 ring-navy'
                : 'border-line hover:border-navy/40'
            }`}
          >
            <p className="text-sm font-semibold text-ink">{opt.label}</p>
            <p className="text-xs text-ink-muted mt-0.5">{opt.hint}</p>
          </button>
        );
      })}
    </div>
  );
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

  const targetLength = customLength
    ? Number(customLength) || coverLetterLength
    : coverLetterLength;
  const charCount = coverLetter.length;
  const charDelta = charCount - targetLength;
  const hasResults = !loading && (resume || coverLetter);

  if (!profileId) {
    return (
      <div className="rounded-lg border border-line bg-panel p-6">
        <h1 className="font-display text-3xl text-navy">Generate</h1>
        <p className="mt-2 text-ink-muted">
          No profile found yet.{' '}
          <Link to="/" className="text-accent underline">
            Create your profile
          </Link>{' '}
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">Generate</h1>
        <p className="text-ink-muted mt-1">
          Choose what to generate, pick a resume template, then paste the job
          posting.
        </p>
      </div>

      {health && !health.gemini_ready && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Gemini API key is still the placeholder. Add your real{' '}
          <code className="text-xs">GEMINI_API_KEY</code> in{' '}
          <code className="text-xs">backend/.env</code> and restart the backend
          before generating.
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleGenerate}
        className="rounded-lg border border-line bg-panel p-5 space-y-5"
      >
        <div>
          <p className="text-sm font-medium text-ink mb-2">What to generate</p>
          <ChoiceCards
            options={OUTPUT_MODES}
            value={outputMode}
            onChange={setOutputMode}
          />
        </div>

        {wantsResume && (
          <div>
            <p className="text-sm font-medium text-ink mb-2">Resume template</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((opt) => {
                const active = resumeTemplate === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setResumeTemplate(opt.id)}
                    className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-navy bg-navy/5 ring-1 ring-navy'
                        : 'border-line hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-10 w-8 shrink-0 rounded border overflow-hidden ${
                          opt.id === 'color'
                            ? 'bg-navy border-navy'
                            : 'bg-white border-slate-400'
                        }`}
                      >
                        {opt.id === 'color' ? (
                          <div className="h-full w-[35%] bg-[#1e3a5f]" />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-start pt-1 gap-0.5 px-0.5">
                            <div className="h-0.5 w-4 bg-slate-800" />
                            <div className="h-px w-full bg-slate-800 mt-1" />
                            <div className="h-px w-full bg-slate-300" />
                            <div className="h-px w-full bg-slate-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {opt.label}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {opt.hint}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-ink-muted mb-1 block">Job title</span>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-navy"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink-muted mb-1 block">Company name</span>
            <input
              className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-navy"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-ink-muted mb-1 block">Job description</span>
          <textarea
            className="w-full min-h-[180px] rounded border border-line px-3 py-2 text-sm outline-none focus:border-navy"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            placeholder="Paste the full job description here…"
          />
        </label>

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
                  className={`rounded px-3 py-1.5 text-sm border transition-colors ${
                    !customLength && coverLetterLength === p.value
                      ? 'bg-navy text-white border-navy'
                      : 'border-line text-ink hover:border-navy'
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
                  className="w-24 rounded border border-line px-2 py-1.5 text-sm outline-none focus:border-navy"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-60"
        >
          {loading ? 'Generating… (this can take a few seconds)' : 'Generate'}
        </button>
      </form>

      {loading && (
        <div className="rounded-lg border border-line bg-panel p-8 text-center text-ink-muted">
          Calling Gemini and crafting your application materials…
        </div>
      )}

      {hasResults && (
        <div className="space-y-6">
          {resume?.requirement_match && (
            <RequirementMatch items={resume.requirement_match} />
          )}

          {resume && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-navy">
                    Resume preview
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Template:{' '}
                    {resumeTemplate === 'simple'
                      ? 'Simple classic'
                      : 'Color accent'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setResumeTemplate(t.id)}
                      className={`rounded px-3 py-1.5 text-xs border ${
                        resumeTemplate === t.id
                          ? 'bg-navy text-white border-navy'
                          : 'border-line hover:border-navy'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handlePdf}
                    disabled={pdfLoading || !generationId}
                    className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {pdfLoading ? 'Building PDF…' : 'Download Resume PDF'}
                  </button>
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
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-navy">Cover letter</h2>
                <button
                  type="button"
                  onClick={copyCoverLetter}
                  className="rounded border border-navy px-4 py-2 text-sm text-navy hover:bg-navy hover:text-white"
                >
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
              <p className="text-xs text-ink-muted">
                {charCount} characters
                {wantsCover && targetLength
                  ? ` · target ${targetLength} (${charDelta >= 0 ? '+' : ''}${charDelta})`
                  : ''}
              </p>
              <textarea
                readOnly
                value={coverLetter}
                className="w-full min-h-[240px] rounded border border-line bg-white px-4 py-3 text-sm leading-relaxed"
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
