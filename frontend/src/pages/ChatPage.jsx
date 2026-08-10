import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, getStoredProfileId } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Field, PageHeader } from '../components/ui.jsx';
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
        className={`rf-chat-bubble ${
          isUser ? 'rf-chat-bubble-user' : 'rf-chat-bubble-assistant'
        }`}
      >
        {!isUser ? (
          <div className="rf-chat-bubble-meta">
            <span className="rf-chat-avatar" aria-hidden>
              RF
            </span>
            Career coach
          </div>
        ) : null}
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="rf-chat-typing" aria-live="polite">
      <span className="rf-chat-typing-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      Reading your profile…
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
  const textareaRef = useRef(null);

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
      textareaRef.current?.focus();
    }
  }

  function clearChat() {
    dispatch(clearChatSession());
    setError('');
  }

  const profileLinked = Boolean(profileMeta || profileId);

  return (
    <div className="rf-chat-shell rf-enter">
      <PageHeader
        title="Career chat"
        subtitle="Client Q&A, Special notes, and fit coaching from your saved Profile — the same ground truth Generate uses."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={clearChat}>
              New chat
            </Button>
            <Link
              to="/generate"
              className="rf-btn rf-btn-accent !min-h-10 !text-sm"
            >
              Go to Generate
            </Link>
          </div>
        }
      />

      <div className="rf-chat-stage">
        <section className="rf-chat-thread" aria-label="Career chat conversation">
          <div className="rf-chat-thread-bar">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-navy truncate">
                Profile-grounded coach
              </p>
              <p className="text-xs text-ink-muted truncate">
                Answers stay tied to your experience
              </p>
            </div>
            <span className="rf-chat-status shrink-0">
              <span className="rf-chat-status-dot" aria-hidden />
              {profileLinked ? 'Profile linked' : 'No profile'}
            </span>
          </div>

          <div className="rf-chat-messages">
            {messages.map((m, i) => (
              <MessageBubble
                key={`${m.role}-${i}`}
                role={m.role}
                content={m.content}
              />
            ))}
            {sending ? <TypingIndicator /> : null}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 ? (
            <div className="rf-chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rf-chat-chip"
                  disabled={sending}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="px-3 sm:px-5 pb-2">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <form
            className="rf-chat-composer space-y-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <label htmlFor="career-chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="career-chat-input"
              ref={textareaRef}
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
              placeholder="Paste an Upwork client question, or ask for Special notes from your profile…"
              disabled={sending}
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-snug text-ink-muted">
                Enter to send · Shift+Enter for newline
                {profileLinked ? ' · Profile ready' : ' · Save a Profile for stronger answers'}
                {' · Session saved'}
              </p>
              <Button
                type="submit"
                variant="accent"
                className="!min-h-11 w-full sm:w-auto sm:!px-6"
                disabled={sending || !input.trim()}
                loading={sending}
              >
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </section>

        <aside className="rf-chat-side" aria-label="Chat context">
          <div className="rf-chat-panel space-y-3">
            <div>
              <h2>Your profile in chat</h2>
              <p className="rf-chat-panel-sub">
                Source of truth for every reply
              </p>
            </div>
            {profileMeta ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-ink leading-snug">
                  {profileMeta.name || 'Unnamed profile'}
                </p>
                {profileMeta.title ? (
                  <p className="text-sm text-ink-muted">{profileMeta.title}</p>
                ) : null}
                <p className="text-xs font-semibold text-navy">
                  {profileMeta.skills} skills · {profileMeta.experience} roles ·{' '}
                  {profileMeta.projects} projects
                </p>
                <Link
                  to="/profile"
                  className="inline-flex text-sm font-bold text-accent-dim underline-offset-2 hover:underline"
                >
                  Edit profile
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted leading-relaxed">
                  Save a Profile so Upwork-style answers and Special notes can use your
                  real experience.
                </p>
                <Link
                  to="/profile"
                  className="rf-btn rf-btn-secondary !min-h-10 !text-sm w-full"
                >
                  Open Profile
                </Link>
              </div>
            )}
          </div>

          <div className="rf-chat-panel">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 text-left"
              onClick={() => dispatch(setChatShowJob(!showJob))}
              aria-expanded={showJob}
            >
              <div>
                <h2>Job context</h2>
                <p className="rf-chat-panel-sub">
                  Optional — improves fit and Special notes
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-accent pt-0.5">
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
          </div>
        </aside>
      </div>
    </div>
  );
}
