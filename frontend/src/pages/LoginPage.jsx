import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Card, Field, Logo } from '../components/ui.jsx';

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
    <div className="mx-auto w-full max-w-md rf-enter">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex sm:hidden mb-3">
          <Logo className="h-12 w-12" />
        </div>
        <h1 className="rf-page-title">Welcome back</h1>
        <p className="rf-page-sub">
          Sign in to access your profile, generations, and AI tools.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <Card className="!p-5 sm:!p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center sm:text-left text-sm text-ink-muted">
        No account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-navy underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
