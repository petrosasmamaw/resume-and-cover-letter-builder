import { PageHeader } from '../components/ui.jsx';
import FAQSection from '../components/FAQSection.jsx';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function FAQPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-10 rf-enter">
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <PageHeader
          title="Answers before you trust AI with your career"
          subtitle="Straight talk on how ResumeForge uses your profile, what Upwork-safe means, Special notes, chat, and privacy — no fluff metrics."
        />
        <div className="relative overflow-hidden">
          <img
            src="/images/resume-work.jpg"
            alt=""
            className="h-32 w-full object-cover sm:h-36"
            loading="lazy"
          />
          <div className="pointer-events-none absolute bottom-3 right-3 h-14 w-14 opacity-90">
            <div className="rf-radar h-full w-full">
              <div className="rf-radar-sweep" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-3xl text-sm leading-relaxed text-ink-muted sm:text-base">
        Generate and Chat read your saved Profile only. Upwork-safe mode strips contact
        channels. Special notes reshape one application without permanently editing Profile.
      </p>

      <FAQSection showHeader={false} />

      <div className="border-y border-navy bg-navy px-5 py-8 text-center text-white sm:px-8 sm:py-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Still deciding? Try a free profile build.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/80">
          The fastest way to evaluate ResumeForge is to save your experience and generate once
          for a real job you are applying to.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {isAuthenticated ? (
            <NavLink to="/generate" className="rf-btn rf-btn-accent !min-h-11">
              Go to Generate
            </NavLink>
          ) : (
            <NavLink to="/signup" className="rf-btn rf-btn-accent !min-h-11">
              Create free account
            </NavLink>
          )}
          <NavLink
            to="/chat"
            className="rf-btn !min-h-11 !border-white/25 !bg-white/10 !text-white"
          >
            Open Chat
          </NavLink>
        </div>
      </div>
    </div>
  );
}
