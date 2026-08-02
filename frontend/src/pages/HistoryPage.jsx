import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getStoredProfileId } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { RequirementMatch } from '../components/RequirementMatch.jsx';
import {
  Alert,
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
} from '../components/ui.jsx';

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
      <EmptyState
        title="No profile yet"
        description="Create your profile first so History can load past applications."
        action={
          <Link to="/" className="rf-btn rf-btn-primary">
            Create profile
          </Link>
        }
      />
    );
  }

  if (loading) return <LoadingState label="Loading history…" />;

  return (
    <div className="space-y-5 sm:space-y-6 rf-stagger">
      <PageHeader
        title="History"
        subtitle="Reopen past applications, download PDFs, or copy cover letters."
      />

      {error && <Alert tone="error">{error}</Alert>}

      {items.length === 0 ? (
        <EmptyState
          title="No generations yet"
          description="Once you generate a resume or cover letter, it will show up here."
          action={
            <Link to="/generate" className="rf-btn rf-btn-accent">
              Generate your first application
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
          <ul className="space-y-2 max-h-[40vh] lg:max-h-[70vh] overflow-y-auto pr-1">
            {items.map((item) => {
              const active = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`w-full text-left rounded-[var(--radius-md)] border px-3.5 py-3 transition-all ${
                      active
                        ? 'border-navy bg-accent-soft shadow-soft'
                        : 'border-line bg-panel hover:border-accent/50 hover:shadow-soft'
                    }`}
                  >
                    <p className="font-semibold text-sm text-ink truncate">
                      {item.job_title}
                    </p>
                    <p className="text-xs text-ink-muted truncate">
                      {item.company_name}
                    </p>
                    <p className="text-[11px] text-ink-muted mt-1.5">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="min-w-0">
            {!selected ? (
              <div className="rf-card p-8 text-center text-sm text-ink-muted">
                Select a generation to preview details.
              </div>
            ) : (
              <div className="space-y-4 rf-enter">
                <div className="rf-card p-4 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/generate?generation=${selected.id}`}
                    className="rf-btn rf-btn-secondary !min-h-9 !text-xs"
                  >
                    Open in Generate
                  </Link>
                  {selected.generated_resume_json && (
                    <Button
                      type="button"
                      variant="accent"
                      className="!min-h-9 !text-xs"
                      loading={pdfLoading}
                      onClick={() =>
                        handlePdf(
                          selected.id,
                          selected.company_name,
                          selected.resume_template || 'color'
                        )
                      }
                    >
                      {pdfLoading ? 'Building PDF…' : 'Download PDF'}
                    </Button>
                  )}
                  {selected.generated_cover_letter && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="!min-h-9 !text-xs"
                      onClick={() =>
                        copyLetter(selected.generated_cover_letter)
                      }
                    >
                      {copied ? 'Copied!' : 'Copy cover letter'}
                    </Button>
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
                  <section className="rf-card p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-navy mb-3">
                      Cover letter
                    </h3>
                    <textarea
                      readOnly
                      value={selected.generated_cover_letter || ''}
                      className="rf-input min-h-[200px] leading-relaxed"
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
