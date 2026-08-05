import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { api, getStoredProfileId } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ResumePreview from '../components/ResumePreview.jsx';
import { RequirementMatch } from '../components/RequirementMatch.jsx';
import {
  Alert,
  Button,
  EmptyState,
  HistorySkeleton,
  PageHeader,
} from '../components/ui.jsx';
import { fetchHistory, setSelectedGeneration } from '../store/historySlice.js';
import { fetchProfile } from '../store/profileSlice.js';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── History list item ─────────────────────────────────── */
function HistoryItem({ item, active, onClick }) {
  const date = new Date(item.created_at);
  const dateStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasResume = !!item.generated_resume_json;
  const hasCover = !!item.generated_cover_letter;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150 group',
        active
          ? 'border-navy bg-gradient-to-br from-accent-soft to-panel shadow-soft'
          : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-soft',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-ink truncate leading-tight">
            {item.job_title || '(No title)'}
          </p>
          <p className="text-xs text-ink-muted truncate mt-0.5">
            {item.company_name || '(No company)'}
          </p>
        </div>
        {active && (
          <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-navy mt-0.5">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        <time className="text-[11px] text-slate-500 font-medium">
          {dateStr} · {timeStr}
        </time>
      </div>

      <div className="flex gap-1.5 mt-2">
        {hasResume && (
          <span className="rf-badge rf-badge-accent !text-[10px] !py-0.5">
            📄 Resume
          </span>
        )}
        {hasCover && (
          <span className="rf-badge rf-badge-accent !text-[10px] !py-0.5">
            ✉️ Cover
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function HistoryPage() {
  const dispatch = useDispatch();
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();

  const historyState = useSelector((state) => state.history);
  const profileState = useSelector((state) => state.profile);

  const { items, selected, status: reduxStatus, error: reduxError } = historyState;
  const { core: profileCore, skills, experience, projects, education, certifications } = profileState;

  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch History and Profile via Redux thunks (Smart condition skips backend refetch if already in Redux!)
  useEffect(() => {
    if (profileId) {
      dispatch(fetchHistory(profileId));
      dispatch(fetchProfile(profileId));
    }
  }, [dispatch, profileId]);

  async function handlePdf(id, company, template, includeContact) {
    setPdfLoading(true);
    setError('');
    try {
      const blob = await api.downloadPdf(
        id,
        template || 'color',
        includeContact !== false
      );
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

  // Render skeleton ONLY if fetching history for the first time
  if (reduxStatus === 'loading' && items.length === 0) {
    return <HistorySkeleton />;
  }

  const displayError = error || reduxError;

  // Build full profile object for preview if needed
  const fullProfile = {
    ...profileCore,
    skills,
    experience,
    projects,
    education,
    certifications,
  };

  return (
    <div className="space-y-5 sm:space-y-6 rf-stagger">
      <PageHeader
        title="History"
        subtitle="Reopen past applications, download PDFs, or copy cover letters."
        action={
          items.length > 0 && (
            <span className="rf-badge rf-badge-accent">
              {items.length} generation{items.length !== 1 ? 's' : ''}
            </span>
          )
        }
      />

      {displayError && <Alert tone="error">{displayError}</Alert>}

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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-6">

          {/* ── Left panel: List ──────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3 px-0.5">
              Applications
            </p>
            <ul className="space-y-2 max-h-[45vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id}>
                  <HistoryItem
                    item={item}
                    active={selected?.id === item.id}
                    onClick={() => dispatch(setSelectedGeneration(item))}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right panel: Detail ───────────────────────── */}
          <div className="min-w-0">
            {!selected ? (
              <div className="rf-card p-10 sm:p-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-2xl">
                  👈
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Select an application from the list to preview details
                </p>
              </div>
            ) : (
              <div className="space-y-5 rf-enter">

                {/* Action bar */}
                <div className="rf-card p-4 flex flex-wrap items-center gap-2.5">
                  <div className="min-w-0 flex-1 mr-1">
                    <p className="font-bold text-navy text-sm truncate">
                      {selected.job_title}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {selected.company_name}
                    </p>
                  </div>
                  <Link
                    to={`/generate?generation=${selected.id}`}
                    className="rf-btn rf-btn-secondary !min-h-9 !text-xs !rounded-lg gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Open in Generate
                  </Link>
                  {selected.generated_resume_json && (
                    <Button
                      type="button"
                      variant="accent"
                      className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                      loading={pdfLoading}
                      onClick={() =>
                        handlePdf(
                          selected.id,
                          selected.company_name,
                          selected.resume_template || 'color',
                          selected.include_contact !== false
                        )
                      }
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {pdfLoading ? 'Building PDF…' : 'Download PDF'}
                    </Button>
                  )}
                  {selected.generated_cover_letter && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="!min-h-9 !text-xs !rounded-lg gap-1.5"
                      onClick={() => copyLetter(selected.generated_cover_letter)}
                    >
                      {copied ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" /></svg>Copy cover letter</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Requirement match */}
                {selected.generated_resume_json?.requirement_match && (
                  <RequirementMatch
                    items={selected.generated_resume_json.requirement_match}
                  />
                )}

                {/* Resume preview */}
                {selected.generated_resume_json && (
                  <ResumePreview
                    resume={selected.generated_resume_json}
                    profile={fullProfile}
                    template={selected.resume_template || 'color'}
                    includeContact={selected.include_contact !== false}
                  />
                )}

                {/* Cover letter */}
                {selected.generated_cover_letter && (
                  <section className="rf-card p-5 sm:p-6 space-y-3">
                    <h3 className="text-base font-bold text-navy">Cover letter</h3>
                    <textarea
                      readOnly
                      value={selected.generated_cover_letter || ''}
                      className="rf-input min-h-[220px] leading-relaxed"
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
