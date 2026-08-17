import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alert, Button, Field } from '../components/ui.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus(null);
    setDevResetUrl('');
    setLoading(true);

    try {
      const res = await api.forgotPassword({ email });
      setStatus(res.message || 'If an account exists with that email, a password reset link has been generated.');
      if (res.reset_url) {
        setDevResetUrl(res.reset_url);
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rf-enter mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center px-4 py-8">
      <div className="w-full space-y-6 rounded-xl border border-line bg-panel p-6 shadow-lift sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="rf-page-title text-xl sm:text-2xl">Reset your password</h1>
          <p className="rf-page-sub !mt-1 !max-w-none text-xs sm:text-sm">
            Enter the email associated with your account and we’ll generate a secure reset link.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {status && <Alert tone="success">{status}</Alert>}

        {devResetUrl && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-xs space-y-2">
            <p className="font-semibold text-accent">Dev / Preview Link:</p>
            <a
              href={devResetUrl}
              className="break-all font-mono text-accent-dim underline hover:text-accent"
            >
              {devResetUrl}
            </a>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full !min-h-12 !text-base"
            loading={loading}
          >
            {loading ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>

        <div className="text-center text-sm text-ink-muted">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-bold text-accent-dim underline-offset-2 hover:text-accent hover:underline"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
