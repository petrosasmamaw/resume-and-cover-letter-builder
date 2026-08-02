import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Field, Logo } from '../components/ui.jsx';

export default function LoginPage() {
  const { login, isAuthenticated, booting } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!booting && isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-8 px-2 rf-enter">
      <div className="w-full max-w-[26rem]">
        {/* Logo & Heading */}
        <div className="text-center mb-7">
          <div className="inline-flex mb-4">
            <Logo className="h-14 w-14 drop-shadow-md" />
          </div>
          <h1 className="rf-page-title">Welcome back</h1>
          <p className="rf-page-sub mx-auto text-center" style={{ maxWidth: '22rem' }}>
            Sign in to access your profile, generations, and AI tools.
          </p>
        </div>

        {error && (
          <div className="mb-5">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {/* Form Card */}
        <div className="rf-card p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <Field
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <Button
              type="submit"
              className="w-full !min-h-12 !text-base"
              loading={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-ink-muted">
          No account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-navy underline decoration-accent/50 underline-offset-2 hover:decoration-accent transition-all"
          >
            Create one free
          </Link>
        </p>

        {/* Feature hints */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🎯', text: 'ATS-safe resumes' },
            { icon: '✍️', text: 'AI cover letters' },
            { icon: '🔒', text: 'Private & secure' },
          ].map((f) => (
            <div
              key={f.text}
              className="rounded-xl border border-line bg-panel/50 px-2 py-3 text-xs text-ink-muted"
            >
              <div className="text-lg mb-1">{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
