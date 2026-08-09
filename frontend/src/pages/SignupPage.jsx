import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Alert, Button, Field } from '../components/ui.jsx';

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
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rf-enter -mx-4 min-h-[calc(100vh-5rem)] sm:mx-0 lg:min-h-[calc(100vh-6rem)] lg:grid lg:grid-cols-2 lg:overflow-hidden lg:rounded-xl lg:border lg:border-line lg:shadow-lift">
      <div className="relative h-44 overflow-hidden sm:h-52 lg:h-auto lg:min-h-full">
        <img
          src="/images/apply-together.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/60 to-navy-deep/25" />
        <div className="relative flex h-full items-end justify-between gap-4 p-5 text-white sm:p-8 lg:min-h-full lg:flex-col lg:justify-end lg:p-10">
          <div className="max-w-md space-y-2">
            <p className="font-display text-xl font-bold sm:text-2xl">ResumeForge</p>
            <p className="text-sm font-semibold leading-snug sm:text-lg">
              Start with your real work — then forge the version each job needs.
            </p>
            <p className="hidden text-sm text-white/80 sm:block">
              Free to begin. Next step after signup: save your Profile so Generate and Chat
              have ground truth.
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
            <h1 className="rf-page-title">Create your account</h1>
            <p className="rf-page-sub !mt-1 !max-w-none">
              Two minutes to open a workspace for tailored resumes, cover letters, and
              profile-grounded client answers.
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
            <div>
              <Field
                label="Password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Use 8+ characters. You can change this later in your account settings when
                available.
              </p>
            </div>
            <Button
              type="submit"
              variant="accent"
              className="w-full !min-h-12 !text-base"
              loading={loading}
            >
              {loading ? 'Creating account…' : 'Create free account'}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted lg:text-left">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-accent-dim underline-offset-2 hover:text-accent hover:underline"
            >
              Log in
            </Link>
          </p>

          <ul className="grid grid-cols-1 gap-2 border-t border-line pt-2 text-sm text-ink-muted">
            <li>No credit card to start</li>
            <li>Documents stay tied to your account</li>
            <li>Marketplace-safe contact toggle on Generate</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
