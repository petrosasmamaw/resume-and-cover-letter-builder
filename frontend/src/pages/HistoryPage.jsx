import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getStoredProfileId } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { RequirementMatch } from '../components/RequirementMatch.jsx';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [gens, prof] = await Promise.all([
          api.listGenerations(profileId),
          api.getProfile(profileId),
        ]);
        setItems(gens);
        setProfile(prof);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profileId]);

  async function handlePdf(id, company, template) {
    setPdfLoading(true);
    setError('');
    try {
      const blob = await api.downloadPdf(id, template || 'color');
      downloadBlob(
        blob,
        `resume-${(company || 'application').replace(/\s+/g, '-')}.pdf`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPdfLoading(false);
    }
  }

  async function copyLetter(text) {
    await navigator.clipboard.writeText(text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!profileId) {
    return (
      <div className="rounded-lg border border-line bg-panel p-6">
        <h1 className="font-display text-3xl text-navy">History</h1>
        <p className="mt-2 text-ink-muted">
          No profile yet.{' '}
          <Link to="/" className="text-accent underline">
            Create one
          </Link>
          .
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-ink-muted">Loading history…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-navy">History</h1>
        <p className="text-ink-muted mt-1">
          Past applications — reopen, re-download the resume PDF, or copy the
          cover letter.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-line bg-panel p-6 text-ink-muted">
          No generations yet.{' '}
          <Link to="/generate" className="text-accent underline">
            Generate your first application
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                    selected?.id === item.id
                      ? 'border-navy bg-navy/5'
                      : 'border-line bg-panel hover:border-navy/40'
                  }`}
                >
                  <p className="font-medium text-sm text-ink">
                    {item.job_title}
                  </p>
                  <p className="text-xs text-ink-muted">{item.company_name}</p>
                  <p className="text-[11px] text-ink-muted mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div>
            {!selected ? (
              <p className="text-ink-muted text-sm">
                Select a generation to preview.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/generate?generation=${selected.id}`}
                    className="rounded border border-navy px-3 py-1.5 text-sm text-navy hover:bg-navy hover:text-white"
                  >
                    Open in Generate
                  </Link>
                  {selected.generated_resume_json && (
                    <button
                      type="button"
                      disabled={pdfLoading}
                      onClick={() =>
                        handlePdf(
                          selected.id,
                          selected.company_name,
                          selected.resume_template || 'color'
                        )
                      }
                      className="rounded bg-accent px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-60"
                    >
                      {pdfLoading ? 'Building PDF…' : 'Download Resume PDF'}
                    </button>
                  )}
                  {selected.generated_cover_letter && (
                    <button
                      type="button"
                      onClick={() =>
                        copyLetter(selected.generated_cover_letter)
                      }
                      className="rounded border border-line px-3 py-1.5 text-sm hover:border-navy"
                    >
                      {copied ? 'Copied!' : 'Copy cover letter'}
                    </button>
                  )}
                </div>

                {selected.generated_resume_json?.requirement_match && (
                  <RequirementMatch
                    items={selected.generated_resume_json.requirement_match}
                  />
                )}

                {selected.generated_resume_json && (
                  <ResumePreview
                    resume={selected.generated_resume_json}
                    profile={profile}
                    template={selected.resume_template || 'color'}
                  />
                )}

                {selected.generated_cover_letter && (
                  <section>
                    <h3 className="text-sm font-semibold text-navy mb-2">
                      Cover letter
                    </h3>
                    <textarea
                      readOnly
                      value={selected.generated_cover_letter || ''}
                      className="w-full min-h-[200px] rounded border border-line bg-white px-4 py-3 text-sm"
                    />
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
