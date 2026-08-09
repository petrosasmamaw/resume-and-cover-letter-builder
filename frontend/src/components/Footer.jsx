import { NavLink } from 'react-router-dom';
import { BrandMark } from './ui.jsx';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-line bg-panel pt-12 pb-10 text-sm text-ink-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-3">
            <BrandMark showTagline />
            <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
              ResumeForge forges job-ready resumes and cover letters from your real
              profile — with Special notes, Upwork-safe contact, and chat that answers
              from your experience.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-navy">Product</p>
            <ul className="space-y-2">
              <li>
                <NavLink to="/profile" className="hover:text-navy transition-colors">
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/generate" className="hover:text-navy transition-colors">
                  Generate
                </NavLink>
              </li>
              <li>
                <NavLink to="/chat" className="hover:text-navy transition-colors">
                  Chat
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" className="hover:text-navy transition-colors">
                  History
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-navy">Help</p>
            <ul className="space-y-2">
              <li>
                <NavLink to="/faq" className="hover:text-navy transition-colors">
                  FAQ
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="hover:text-navy transition-colors"
                >
                  Back to top
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-faint">
          <p>© {new Date().getFullYear()} ResumeForge</p>
          <p>Real profile · Per-job fit · ATS-safe PDFs</p>
        </div>
      </div>
    </footer>
  );
}
