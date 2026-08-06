import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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

const WELCOME =
  "Hi — I'm your ResumeForge assistant. I know the app (Generate, Special notes, Upwork-safe contact, templates, humanize) and I can also talk about any career or work topic. Paste a job and ask me to draft Special notes, or ask how a feature works.";

const SUGGESTIONS = [
  'Create Special notes for this job using my profile experience',
  'Explain ResumeForge features and what I should use for an Upwork proposal',
  'How does my profile fit this role?',
  'Interview prep for this job (not tied to the app)',
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
  const { profileId: authProfileId } = useAuth();
  const profileId = authProfileId || getStoredProfileId();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJob, setShowJob] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  async function sendMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || sending) return;

    setError('');
    const history = messages
      .filter((m) => !(m.role === 'assistant' && m.content === WELCOME))
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'No reply returned.' },
      ]);
    } catch (err) {
      setError(err.message || 'Chat failed');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry — I could not reply just now. Check your connection and try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: WELCOME }]);
    setError('');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Career chat"
        subtitle="Product guide + universal career coach. Fast Flash model — draft Special notes, pick Generate settings, or talk work unrelated to the app."
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
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5"
            style={{ maxHeight: 'min(58vh, 520px)' }}
          >
            {messages.map((m, i) => (
              <MessageBubble key={`${m.role}-${i}`} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-ink-muted pl-1">
                <Spinner className="w-4 h-4" />
                Thinking…
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
              placeholder="Ask about a job, paste a JD + ask for Special notes, or ask anything about work / ResumeForge…"
              className="rf-input w-full resize-y min-h-[4.5rem]"
              disabled={sending}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-ink-muted">
                Enter to send · Shift+Enter for newline
                {profileId ? ' · Profile attached' : ''}
                {' · Fast mode'}
              </p>
              <Button type="submit" disabled={sending || !input.trim()}>
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 text-left"
              onClick={() => setShowJob((v) => !v)}
            >
              <div>
                <p className="text-sm font-bold text-navy">Job context</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Optional — coach uses this for the whole chat
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
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
                <Field
                  label="Company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme"
                />
                <Field
                  as="textarea"
                  label="Job description"
                  className="min-h-[140px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full posting…"
                  maxLength={20000}
                />
              </div>
            )}
          </Card>

          {!profileId && (
            <Alert tone="info">
              Save a profile first so the coach can match advice to your real
              experience.{' '}
              <Link to="/profile" className="font-semibold underline">
                Open Profile
              </Link>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
