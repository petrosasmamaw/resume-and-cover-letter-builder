import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, getStoredProfileId } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  Spinner,
} from '../components/ui.jsx';
import {
  appendChatMessage,
  CHAT_WELCOME,
  clearChatSession,
  setChatJobField,
  setChatProfileMeta,
  setChatShowJob,
} from '../store/chatSlice.js';

const SUGGESTIONS = [
  'What experience do I have with SaaS? Write my Upwork answer.',
  'Answer this for a client: Have you built production React apps?',
  'Using my profile, why am I a fit for the job in context?',
  'Create Special notes for this job from my experience',
];

function MessageBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-panel border border-line text-ink rounded-bl-md',
        ].join(' ')}
      >
        {!isUser && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            Assistant
          </p>
        )}
        {content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();

  const {
    messages,
    jobTitle,
    companyName,
    jobDescription,
    showJob,
    profileMeta,
  } = useSelector((state) => state.chat);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!profileId) {
        dispatch(setChatProfileMeta(null));
        return;
      }
      try {
        const p = await api.getProfile(profileId);
        if (cancelled) return;
        dispatch(
          setChatProfileMeta({
            id: p.id,
            name: p.full_name,
            title: p.title,
            skills: (p.skills || []).length,
            experience: (p.experience || []).length,
            projects: (p.projects || []).length,
          })
        );
      } catch {
        if (!cancelled) dispatch(setChatProfileMeta(null));
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [profileId, dispatch]);

  async function sendMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || sending) return;

    setError('');
    const history = messages
      .filter((m) => !(m.role === 'assistant' && m.content === CHAT_WELCOME))
      .map((m) => ({ role: m.role, content: m.content }));

    dispatch(appendChatMessage({ role: 'user', content: text }));
    setInput('');
    setSending(true);

    try {
      const data = await api.chat({
        message: text,
        history,
        profile_id: profileId || undefined,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
      });
      if (data.profile_attached && data.profile_name) {
        dispatch(
          setChatProfileMeta({
            id: data.profile_id || profileMeta?.id,
            name: data.profile_name,
            title: data.profile_title || profileMeta?.title,
            skills: profileMeta?.skills ?? 0,
            experience: profileMeta?.experience ?? 0,
            projects: profileMeta?.projects ?? 0,
          })
        );
      }
      dispatch(
        appendChatMessage({
          role: 'assistant',
          content: data.reply || 'No reply returned.',
        })
      );
    } catch (err) {
      setError(err.message || 'Chat failed');
      dispatch(
        appendChatMessage({
          role: 'assistant',
          content:
            'Sorry — I could not reply just now. Check your connection and try again.',
        })
      );
    } finally {
      setSending(false);
    }
  }

  function clearChat() {
    dispatch(clearChatSession());
    setError('');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Career chat"
        subtitle="Answers Upwork/client questions from your full Profile, drafts Special notes, and guides Generate — same data the resume AI uses."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={clearChat}>
              New chat
            </Button>
            <Link to="/generate" className="rf-btn rf-btn-primary !min-h-10 !text-sm">
              Go to Generate
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="flex flex-col min-h-[min(70vh,640px)] !p-0 overflow-hidden">
          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5"
            style={{ maxHeight: 'min(58vh, 520px)' }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={`${m.role}-${i}`} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-ink-muted pl-1">
                <Spinner className="w-4 h-4" />
                Reading your profile…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={sending}
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-line bg-panel px-3 py-2 text-left text-xs font-medium text-ink-muted hover:border-line-accent hover:text-navy hover:bg-accent-soft transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="px-4 pb-2 sm:px-5">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <form
            className="border-t border-line bg-panel/60 p-3 sm:p-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              rows={3}
              maxLength={12000}
              placeholder="Paste an Upwork question, or ask me to answer from my profile…"
              className="rf-input w-full resize-y min-h-[4.5rem]"
              disabled={sending}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-ink-muted">
                Enter to send · Shift+Enter for newline
                {profileMeta || profileId
                  ? ' · Profile linked'
                  : ' · No profile yet'}
                {' · Saved in session'}
              </p>
              <Button type="submit" disabled={sending || !input.trim()}>
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-navy">Your profile in chat</p>
            {profileMeta ? (
              <div className="mt-2 space-y-1.5 text-sm text-ink-muted">
                <p className="font-medium text-ink">
                  {profileMeta.name || 'Unnamed profile'}
                  {profileMeta.title ? (
                    <span className="font-normal text-ink-muted">
                      {' '}
                      · {profileMeta.title}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs">
                  {profileMeta.skills} skills · {profileMeta.experience} roles ·{' '}
                  {profileMeta.projects} projects
                </p>
                <p className="text-xs text-accent-dim pt-1">
                  Chat answers client questions using this data (same as Generate).
                </p>
                <Link
                  to="/profile"
                  className="inline-block text-xs font-semibold text-navy underline mt-1"
                >
                  Edit profile
                </Link>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-ink-muted">
                  No profile linked yet. Save one so Upwork-style answers can use your
                  real experience.
                </p>
                <Link
                  to="/profile"
                  className="rf-btn rf-btn-secondary !min-h-9 !text-sm"
                >
                  Open Profile
                </Link>
              </div>
            )}
          </Card>

          <Card>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 text-left"
              onClick={() => dispatch(setChatShowJob(!showJob))}
            >
              <div>
                <p className="text-sm font-bold text-navy">Job context</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Optional — answers articulate your fit for this role
                </p>
              </div>
              <span className="text-xs font-semibold text-accent">
                {showJob ? 'Hide' : 'Show'}
              </span>
            </button>

            {(showJob || jobTitle || companyName || jobDescription) && (
              <div className="mt-4 space-y-3">
                <Field
                  label="Job title"
                  value={jobTitle}
                  onChange={(e) =>
                    dispatch(
                      setChatJobField({ key: 'jobTitle', value: e.target.value })
                    )
                  }
                  placeholder="e.g. Frontend Engineer"
                />
                <Field
                  label="Company"
                  value={companyName}
                  onChange={(e) =>
                    dispatch(
                      setChatJobField({
                        key: 'companyName',
                        value: e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Acme"
                />
                <Field
                  as="textarea"
                  label="Job description"
                  className="min-h-[140px]"
                  value={jobDescription}
                  onChange={(e) =>
                    dispatch(
                      setChatJobField({
                        key: 'jobDescription',
                        value: e.target.value,
                      })
                    )
                  }
                  placeholder="Paste the full posting…"
                  maxLength={20000}
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
