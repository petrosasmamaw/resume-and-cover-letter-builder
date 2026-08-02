import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { BrandMark, Button, LoadingState } from './components/ui.jsx';

function Protected({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <LoadingState label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function navClass({ isActive }) {
  return [
    'relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors',
    isActive
      ? 'text-navy bg-accent-soft'
      : 'text-ink-muted hover:text-ink hover:bg-white/70',
  ].join(' ');
}

function mobileNavClass({ isActive }) {
  return [
    'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition-colors min-h-[3.5rem]',
    isActive ? 'text-navy' : 'text-ink-muted',
  ].join(' ');
}

function IconProfile({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19c1.8-3.2 4.2-4.5 7-4.5S17.2 15.8 19 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {active && <circle cx="12" cy="20.5" r="1" fill="currentColor" />}
    </svg>
  );
}

function IconGenerate({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h10M5 17h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 10.5l2 2-2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && <circle cx="19" cy="6" r="1.5" fill="currentColor" />}
    </svg>
  );
}

function IconHistory({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 8v4.5L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && <circle cx="12" cy="12" r="1.2" fill="currentColor" />}
    </svg>
  );
}

function Shell() {
  const { isAuthenticated, user, logout, booting } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-panel/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3">
          <NavLink to={isAuthenticated ? '/' : '/login'} className="shrink-0">
            <BrandMark compact={isAuthPage} showTagline={!isAuthPage} />
          </NavLink>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isAuthenticated && (
              <nav
                className="hidden md:flex items-center gap-1 rounded-xl bg-surface/80 p-1 border border-line/70"
                aria-label="Primary"
              >
                <NavLink to="/" end className={navClass}>
                  Profile
                </NavLink>
                <NavLink to="/generate" className={navClass}>
                  Generate
                </NavLink>
                <NavLink to="/history" className={navClass}>
                  History
                </NavLink>
              </nav>
            )}

            {!booting && isAuthenticated && (
              <div className="flex items-center gap-2">
                <span
                  className="hidden lg:inline max-w-[180px] truncate text-xs text-ink-muted"
                  title={user?.email}
                >
                  {user?.email}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="!min-h-9 !px-3 !text-xs"
                  onClick={logout}
                >
                  Log out
                </Button>
              </div>
            )}

            {!booting && !isAuthenticated && !isAuthPage && (
              <NavLink to="/login" className="rf-btn rf-btn-primary !min-h-9 !text-xs">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main
        className={`flex-1 mx-auto w-full max-w-6xl px-4 sm:px-5 py-5 sm:py-8 ${
          isAuthenticated ? 'pb-24 md:pb-10' : ''
        }`}
      >
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

      {isAuthenticated && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-panel/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
          aria-label="Mobile"
        >
          <div className="mx-auto max-w-6xl flex">
            <NavLink to="/" end className={mobileNavClass}>
              {({ isActive }) => (
                <>
                  <IconProfile active={isActive} />
                  Profile
                </>
              )}
            </NavLink>
            <NavLink to="/generate" className={mobileNavClass}>
              {({ isActive }) => (
                <>
                  <IconGenerate active={isActive} />
                  Generate
                </>
              )}
            </NavLink>
            <NavLink to="/history" className={mobileNavClass}>
              {({ isActive }) => (
                <>
                  <IconHistory active={isActive} />
                  History
                </>
              )}
            </NavLink>
          </div>
        </nav>
      )}
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
