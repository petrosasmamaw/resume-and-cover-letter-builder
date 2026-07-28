import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'text-navy border-b-2 border-navy'
      : 'text-ink-muted hover:text-ink'
  }`;

function Protected({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) {
    return <p className="text-ink-muted">Loading…</p>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Shell() {
  const { isAuthenticated, user, logout, booting } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-navy tracking-tight leading-none">
              ResumeForge
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Tailored resumes & cover letters from your real profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <nav className="flex gap-1">
                <NavLink to="/" end className={linkClass}>
                  Profile
                </NavLink>
                <NavLink to="/generate" className={linkClass}>
                  Generate
                </NavLink>
                <NavLink to="/history" className={linkClass}>
                  History
                </NavLink>
              </nav>
            )}
            {!booting && isAuthenticated && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-muted hidden sm:inline">{user?.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded border border-line px-2 py-1 text-xs hover:border-navy"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />
          <Route
            path="/generate"
            element={
              <Protected>
                <GeneratePage />
              </Protected>
            }
          />
          <Route
            path="/history"
            element={
              <Protected>
                <HistoryPage />
              </Protected>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
