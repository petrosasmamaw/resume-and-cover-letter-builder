import { NavLink } from 'react-router-dom';
import { BrandMark } from './ui.jsx';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-line bg-panel/80 pt-12 pb-8 text-xs text-ink-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <BrandMark showTagline={true} />
            <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
              ResumeForge leverages AI to automatically generate ATS-optimized resumes and cover letters tailored to your profile and target job descriptions.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <p className="font-bold text-navy uppercase tracking-wider text-[11px]">Navigation</p>
            <ul className="space-y-2 text-ink-muted">
              <li>
                <NavLink to="/" className="hover:text-navy transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className="hover:text-navy transition-colors">
                  Profile Builder
                </NavLink>
              </li>
              <li>
                <NavLink to="/generate" className="hover:text-navy transition-colors">
                  Resume Generator
                </NavLink>
              </li>
              <li>
                <NavLink to="/chat" className="hover:text-navy transition-colors">
                  Career Chat
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" className="hover:text-navy transition-colors">
                  Generation History
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Support */}
          <div className="space-y-2">
            <p className="font-bold text-navy uppercase tracking-wider text-[11px]">Resources</p>
            <ul className="space-y-2 text-ink-muted">
              <li>
                <NavLink to="/faq" className="hover:text-navy transition-colors">
                  FAQ & Support
                </NavLink>
              </li>
              <li>
                <span className="hover:text-navy cursor-pointer transition-colors" onClick={scrollToTop}>
                  Back to Top
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} ResumeForge. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <NavLink to="/faq" className="hover:text-navy transition-colors">
              Help Center
            </NavLink>
            <span className="text-line">•</span>
            <span>ATS Optimized</span>
            <span className="text-line">•</span>
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
