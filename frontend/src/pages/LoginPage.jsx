import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Field } from '../components/ui.jsx';

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
    <div className="rf-enter -mx-4 min-h-[calc(100vh-5rem)] sm:mx-0 lg:min-h-[calc(100vh-6rem)] lg:grid lg:grid-cols-2 lg:overflow-hidden lg:rounded-xl lg:border lg:border-line lg:shadow-lift">
      {/* Photo + instrument cue — mobile band + desktop panel */}
      <div className="relative h-44 overflow-hidden sm:h-52 lg:h-auto lg:min-h-full">
        <img
          src="/images/hero-desk.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/55 to-navy-deep/30" />
        <div className="relative flex h-full items-end justify-between gap-4 p-5 text-white sm:p-8 lg:min-h-full lg:flex-col lg:justify-end lg:p-10">
          <div className="max-w-md space-y-2">
            <p className="font-display text-xl font-bold sm:text-2xl">ResumeForge</p>
            <p className="text-sm font-semibold leading-snug sm:text-lg">
              Pick up where you left off — profile, generations, and chat stay on this desk.
            </p>
            <p className="hidden text-sm text-white/80 sm:block">
              Marketplace proposals and company applications, same ground-truth profile.
            </p>
          </div>
          <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 lg:mt-8 lg:h-24 lg:w-24">
            <div className="rf-radar h-full w-full">
              <div className="rf-radar-sweep" aria-hidden />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-bold tracking-wide text-[#9fd49a]">FIT</p>
                <p className="font-display text-sm font-bold text-white sm:text-base">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-panel px-4 py-8 sm:px-8 sm:py-10">
        <div className="w-full max-w-[24rem] space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="rf-page-title">Welcome back</h1>
            <p className="rf-page-sub !mt-1 !max-w-none">
              Log in to generate tailored documents, answer client questions from your
              profile, and download ATS-safe PDFs.
            </p>
          </div>

          {error && <Alert tone="error">{error}</Alert>}

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Email"
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
              placeholder="Your password"
            />
            <Button
              type="submit"
              variant="accent"
              className="w-full !min-h-12 !text-base"
              loading={loading}
            >
              {loading ? 'Signing you in…' : 'Log in'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted lg:text-left">
            New here?{' '}
            <Link
              to="/signup"
              className="font-bold text-accent-dim underline-offset-2 hover:text-accent hover:underline"
            >
              Create a free account
            </Link>
          </p>

          <ul className="grid grid-cols-1 gap-2 border-t border-line pt-2 text-sm text-ink-muted">
            <li className="flex gap-2">
              <span className="font-bold text-accent">·</span> Profile stays private to you
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-accent">·</span> Session saves Generate & Chat work
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-accent">·</span> Upwork-safe mode when you need it
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
