import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Card, Field, Logo } from '../components/ui.jsx';

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
    <div className="mx-auto w-full max-w-md rf-enter">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex sm:hidden mb-3">
          <Logo className="h-12 w-12" />
        </div>
        <h1 className="rf-page-title">Create account</h1>
        <p className="rf-page-sub">
          Your resumes and cover letters stay private to your account.
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
            label="Password (min 8 characters)"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-center sm:text-left text-sm text-ink-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-navy underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
