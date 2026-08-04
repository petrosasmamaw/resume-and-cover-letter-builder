import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Footer from './components/Footer.jsx';
import {
  BrandMark,
  ProfileSkeleton,
  IconHome,
  IconHelp,
} from './components/ui.jsx';

function Protected({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <ProfileSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function navClass({ isActive }) {
  return [
    'relative px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5',
    isActive
      ? 'text-navy bg-accent-soft shadow-xs border border-line-accent'
      : 'text-ink-muted hover:text-ink hover:bg-white/70',
  ].join(' ');
}

function mobileNavClass({ isActive }) {
  return [
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold tracking-wide uppercase transition-colors duration-150 min-h-[3.75rem]',
    isActive ? 'text-navy' : 'text-ink-muted hover:text-ink',
  ].join(' ');
}

/* ── Nav Icons ─────────────────────────────────────────── */
function IconProfileNav({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-transform duration-150"
      style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} />
      <path d="M5 19c1.8-3.2 4.2-4.5 7-4.5S17.2 15.8 19 19" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" />
    </svg>
  );
}

function IconGenerateNav({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-transform duration-150"
      style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}
    >
      <path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" />
      <path d="M17 10.5l2.5 2-2.5 2" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHistoryNav({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-transform duration-150"
      style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} />
      <path d="M12 8v4.5L15 14" stroke="currentColor" strokeWidth={active ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── User Avatar Pill ──────────────────────────────────── */
function UserPill({ email, onLogout }) {
  const initials = email ? email[0].toUpperCase() : '?';
  return (
    <div className="flex items-center gap-2">
      <div
        className="hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-navy text-white text-xs font-bold"
        title={email}
      >
        {initials}
      </div>
      <span
        className="hidden xl:inline max-w-[140px] truncate text-xs font-medium text-ink-muted"
        title={email}
      >
        {email}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="rf-btn rf-btn-ghost !min-h-8 !px-3 !text-xs !rounded-md gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden sm:inline">Log out</span>
      </button>
    </div>
  );
}

/* ── Shell ─────────────────────────────────────────────── */
function Shell() {
  const { isAuthenticated, user, logout, booting } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b border-line/70 rf-glass"
        style={{ boxShadow: '0 1px 24px rgba(12,59,58,0.06)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 md:py-3.5 flex items-center justify-between gap-4">
          <NavLink
            to="/"
            className="shrink-0 focus-visible:outline-offset-4"
          >
            <BrandMark compact={isAuthPage} showTagline={!isAuthPage} />
          </NavLink>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <nav
              className="hidden md:flex items-center gap-0.5 rounded-xl bg-surface/90 p-1 border border-line/80"
              aria-label="Primary navigation"
            >
              <NavLink to="/" end className={navClass}>
                <IconHome className="w-4 h-4 text-accent" />
                Home
              </NavLink>

              {isAuthenticated && (
                <>
                  <NavLink to="/profile" className={navClass}>
                    Profile
                  </NavLink>
                  <NavLink to="/generate" className={navClass}>
                    Generate
                  </NavLink>
                  <NavLink to="/history" className={navClass}>
                    History
                  </NavLink>
                </>
              )}

              <NavLink to="/faq" className={navClass}>
                <IconHelp className="w-4 h-4 text-accent" />
                FAQ
              </NavLink>
            </nav>

            {!booting && isAuthenticated && (
              <UserPill email={user?.email} onLogout={logout} />
            )}

            {!booting && !isAuthenticated && !isAuthPage && (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rf-btn rf-btn-ghost !min-h-9 !text-sm !px-3.5"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rf-btn rf-btn-primary !min-h-9 !text-sm !px-4"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────── */}
      <main
        className={`flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 ${
          isAuthenticated ? 'pb-28 md:pb-12' : 'pb-12'
        }`}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/profile"
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-panel/95 backdrop-blur-2xl rf-safe-bottom"
        aria-label="Mobile navigation"
        style={{ boxShadow: '0 -1px 20px rgba(12,59,58,0.07)' }}
      >
        <div className="mx-auto max-w-md flex">
          <NavLink to="/" end className={mobileNavClass}>
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                  isActive ? 'bg-accent-soft' : ''
                }`}>
                  <IconHome className="w-4 h-4" />
                </div>
                <span>Home</span>
              </>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={mobileNavClass}>
                {({ isActive }) => (
                  <>
                    <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                      isActive ? 'bg-accent-soft' : ''
                    }`}>
                      <IconProfileNav active={isActive} />
                    </div>
                    <span>Profile</span>
                  </>
                )}
              </NavLink>

              <NavLink to="/generate" className={mobileNavClass}>
                {({ isActive }) => (
                  <>
                    <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                      isActive ? 'bg-accent-soft' : ''
                    }`}>
                      <IconGenerateNav active={isActive} />
                    </div>
                    <span>Generate</span>
                  </>
                )}
              </NavLink>

              <NavLink to="/history" className={mobileNavClass}>
                {({ isActive }) => (
                  <>
                    <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                      isActive ? 'bg-accent-soft' : ''
                    }`}>
                      <IconHistoryNav active={isActive} />
                    </div>
                    <span>History</span>
                  </>
                )}
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={mobileNavClass}>
              {({ isActive }) => (
                <>
                  <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                    isActive ? 'bg-accent-soft' : ''
                  }`}>
                    <IconProfileNav active={isActive} />
                  </div>
                  <span>Sign In</span>
                </>
              )}
            </NavLink>
          )}

          <NavLink to="/faq" className={mobileNavClass}>
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-6 rounded-lg transition-all duration-150 ${
                  isActive ? 'bg-accent-soft' : ''
                }`}>
                  <IconHelp className="w-4 h-4" />
                </div>
                <span>FAQ</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <Footer />
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
