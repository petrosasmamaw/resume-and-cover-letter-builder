import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Field, Logo } from '../components/ui.jsx';

export default function SignupPage() {
  const { signup, isAuthenticated, booting } = useAuth();
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
      await signup(email, password);
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
          <h1 className="rf-page-title">Create account</h1>
          <p className="rf-page-sub mx-auto text-center" style={{ maxWidth: '22rem' }}>
            Your resumes and cover letters stay private to your account.
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
            <div>
              <Field
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-ink-muted pl-0.5">
                Minimum 8 characters
              </p>
            </div>
            <Button
              type="submit"
              variant="accent"
              className="w-full !min-h-12 !text-base"
              loading={loading}
            >
              {loading ? 'Creating your account…' : 'Get started — it\'s free'}
            </Button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-navy underline decoration-accent/50 underline-offset-2 hover:decoration-accent transition-all"
          >
            Sign in
          </Link>
        </p>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⚡', text: 'Instant setup' },
            { icon: '🤖', text: 'Gemini-powered' },
            { icon: '📄', text: 'ATS-optimized' },
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
