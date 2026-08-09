import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button, IconCheck, IconHelp } from '../components/ui.jsx';
import FAQSection from '../components/FAQSection.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="rf-enter">
      {/* First viewport — brand + headline + one CTA + radar only */}
      <section className="rf-hero-bleed text-white">
        <img
          src="/images/hero-desk.jpg"
          alt=""
          width={1600}
          height={1067}
          fetchPriority="high"
        />
        <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-7xl flex-col justify-end gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-8 lg:py-14">
          <div className="max-w-xl space-y-5">
            <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              ResumeForge
            </p>
            <h1 className="font-display text-[1.85rem] sm:text-[2.55rem] lg:text-[2.85rem] font-bold leading-[1.12] tracking-tight">
              Paste the job. Lock your real experience to the fit that wins interviews.
            </h1>
            <div className="pt-1">
              {isAuthenticated ? (
                <NavLink
                  to="/generate"
                  className="rf-btn rf-btn-accent !min-h-12 !px-6 !text-base w-full sm:w-auto"
                >
                  Generate for this job
                </NavLink>
              ) : (
                <NavLink
                  to="/signup"
                  className="rf-btn rf-btn-accent !min-h-12 !px-6 !text-base w-full sm:w-auto"
                >
                  Create free account
                </NavLink>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[220px] shrink-0 sm:max-w-[240px] lg:mx-0">
            <div className="rf-radar w-full">
              <div className="rf-radar-sweep" aria-hidden />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <p className="text-[11px] font-bold tracking-wide text-[#9fd49a]">
                  FIT SIGNAL
                </p>
                <p className="mt-1 font-display text-4xl font-bold text-white">92%</p>
                <p className="mt-1 text-xs leading-snug text-white/70">
                  Synthetic demo dial — your score comes from your profile + JD
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 md:space-y-20 md:py-16 lg:px-8">
        {/* Deferred hero support — below first viewport */}
        <section className="max-w-2xl space-y-4">
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            One honest profile. Resumes, cover letters, and Upwork-ready answers — tailored
            per application, never inventing employers or metrics.
          </p>
          <ul className="flex flex-col gap-y-2 text-sm text-ink sm:flex-row sm:flex-wrap sm:gap-x-5">
            <li className="inline-flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-accent" /> Profile is ground truth
            </li>
            <li className="inline-flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-accent" /> Upwork-safe contact mode
            </li>
            <li className="inline-flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-accent" /> ATS-safe PDF export
            </li>
          </ul>
          {!isAuthenticated ? (
            <p className="text-sm text-ink-muted">
              Already forging applications?{' '}
              <NavLink
                to="/login"
                className="font-bold text-accent-dim underline-offset-2 hover:underline"
              >
                Log in
              </NavLink>
            </p>
          ) : null}
        </section>

        <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="order-2 overflow-hidden md:order-1">
            <img
              src="/images/resume-work.jpg"
              alt="Laptop and notes on a desk during an application session"
              className="h-56 w-full object-cover sm:h-72"
              loading="lazy"
              width={1400}
              height={900}
            />
          </div>
          <div className="order-1 space-y-4 md:order-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Built for the desks where applications actually get done
            </h2>
            <p className="text-base leading-relaxed text-ink-muted">
              Freelancers on marketplaces and candidates emailing companies share the same
              problem: every posting wants a different story from the same career. ResumeForge
              keeps one source of truth, then tunes emphasis with Special notes for that job only.
            </p>
            <ul className="space-y-3 text-sm text-ink">
              {[
                'Profile skills, roles, and projects stay yours — AI reorders and rephrases, it does not invent.',
                'Chat answers Upwork client questions from that same profile, ready to paste.',
                'Hide contact channels when a marketplace bans off-site details.',
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Single non-card sequence */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Three moves from blank to sent
            </h2>
            <p className="text-ink-muted">
              Mobile-first workflow: save once, tailor often, download when ready.
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {[
              {
                title: 'Save your career once',
                body: 'Skills, roles, projects, education — your Profile is the only fact base Generate and Chat read.',
              },
              {
                title: 'Paste the posting',
                body: 'Add title, company, description. Optional Special notes or Chat drafts them from your experience.',
              },
              {
                title: 'Generate & ship',
                body: 'Preview resume and cover letter, toggle Upwork-safe contact, download ATS-safe PDF.',
              },
            ].map((step, index) => (
              <li
                key={step.title}
                className="grid gap-2 py-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:py-6"
              >
                <span className="font-display text-sm font-bold text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-navy">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Features as paired photo + list — no icon card grid */}
        <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Everything that stays true under pressure
            </h2>
            <p className="text-ink-muted">
              Tools for the last ten minutes before you hit Submit — not another fluff writer.
            </p>
            <dl className="space-y-5 pt-2">
              {[
                {
                  title: 'AI that respects your résumé',
                  body: 'Tailors wording and order for the posting without fabricating experience.',
                },
                {
                  title: 'Requirement match view',
                  body: 'See where your profile already covers the job — and what Special notes should emphasize.',
                },
                {
                  title: 'ATS-safe templates',
                  body: 'Single-column layouts parsers and humans can both scan cleanly.',
                },
                {
                  title: 'Special notes + Upwork-safe contact',
                  body: 'Emphasize one project for this job only; strip email, phone, and links when marketplaces demand it.',
                },
              ].map((item) => (
                <div key={item.title} className="space-y-1 pt-4 first:pt-0 border-t border-line first:border-t-0">
                  <dt className="font-bold text-navy">{item.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative overflow-hidden lg:sticky lg:top-24">
            <img
              src="/images/apply-together.jpg"
              alt="Collaborators reviewing application materials at a desk"
              className="h-64 w-full object-cover sm:h-80 lg:h-[28rem]"
              loading="lazy"
            />
            <div className="absolute bottom-4 right-4 w-24 sm:w-28">
              <div className="rf-radar !aspect-square w-full opacity-95">
                <div className="rf-radar-sweep" aria-hidden />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold tracking-wide text-[#9fd49a]">FIT</p>
                  <p className="font-display text-xl font-bold text-white">—</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <img
            src="/images/hero-desk.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-navy-deep/82" />
          <div className="relative max-w-2xl space-y-3 px-1 py-10 sm:py-12">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Same career. Different signal every time.
            </h2>
            <p className="leading-relaxed text-white/85">
              Use Chat to answer client screens from your profile, Generate for the documents,
              History when you need last week’s version. One workspace for both marketplace
              proposals and company applications.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Questions people ask before trusting AI with a résumé
            </h2>
          </div>
          <FAQSection limit={4} showHeader={false} />
          <div className="text-center">
            <NavLink to="/faq">
              <Button variant="ghost" className="!text-sm">
                <IconHelp className="h-4 w-4 text-accent" />
                Browse all answers
              </Button>
            </NavLink>
          </div>
        </section>

        <section className="border-y border-line py-10 text-center sm:py-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Ready to dial in the next application?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Free to start. Save your profile, paste a job, and ship a tailored package today.
          </p>
          <div className="mt-5">
            {isAuthenticated ? (
              <NavLink
                to="/generate"
                className="rf-btn rf-btn-accent inline-flex !min-h-12 !px-7"
              >
                Open Generate
              </NavLink>
            ) : (
              <NavLink
                to="/signup"
                className="rf-btn rf-btn-accent inline-flex !min-h-12 !px-7"
              >
                Create free account
              </NavLink>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
