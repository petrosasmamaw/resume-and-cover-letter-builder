import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

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
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-4xl text-navy">Sign in</h1>
      <p className="text-ink-muted mt-1 text-sm">
        Access your profiles, generations, and AI tools.
      </p>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-3 rounded-lg border border-line bg-panel p-5"
      >
        <label className="block text-sm">
          <span className="text-ink-muted mb-1 block">Email</span>
          <input
            type="email"
            required
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-navy"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-muted mb-1 block">Password</span>
          <input
            type="password"
            required
            minLength={8}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-navy"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink-muted">
        No account?{' '}
        <Link to="/signup" className="text-accent underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
