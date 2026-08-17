import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { Alert, Button, Field } from '../components/ui.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus(null);

    if (!token.trim()) {
      setError('Password reset token is missing. Please check your reset link.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ token: token.trim(), password });
      setStatus(res.message || 'Password reset successfully.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="rf-page-title text-xl sm:text-2xl">Create new password</h1>
          <p className="rf-page-sub !mt-1 !max-w-none text-xs sm:text-sm">
            Enter your new secure password below.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {status && (
          <Alert tone="success">
            {status} Redirecting to login…
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!tokenFromUrl && (
            <Field
              label="Reset Token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your reset token"
            />
          )}

          <Field
            label="New Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          <Field
            label="Confirm New Password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter your password"
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full !min-h-12 !text-base"
            loading={loading}
          >
            {loading ? 'Saving new password…' : 'Save new password'}
          </Button>
        </form>

        <div className="text-center text-sm text-ink-muted">
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
