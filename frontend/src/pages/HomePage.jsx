import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Button,
  Card,
  IconCheck,
  IconFileText,
  IconTrendingUp,
  IconShield,
  IconZap,
  IconHelp,
  IconSparkles,
} from '../components/ui.jsx';
import FAQSection from '../components/FAQSection.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 md:space-y-20 rf-enter">
      {/* Hero — brand-led, marketplace composition */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6 pb-14 md:pt-10 md:pb-16 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, #f5fbf3 0%, #ffffff 42%, #eef3ee 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 -z-10 hidden md:block opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 40%, rgb(20 168 0 / 0.18), transparent 55%)',
          }}
        />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 lg:gap-14 items-center">
          <div className="space-y-6 max-w-xl">
            <p className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-navy">
              ResumeForge
            </p>
            <h1 className="font-display text-[1.85rem] sm:text-[2.4rem] lg:text-[2.75rem] font-semibold tracking-tight text-navy leading-[1.15]">
              Build job-ready resumes that match the role you want
            </h1>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
              Paste a job description. We tailor your real profile into an ATS-friendly
              resume and cover letter — like a pro application workspace.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isAuthenticated ? (
                <NavLink to="/generate">
                  <Button variant="accent" className="!px-6 !min-h-11 !text-[0.95rem]">
                    Find your next fit
                  </Button>
                </NavLink>
              ) : (
                <>
                  <NavLink to="/signup">
                    <Button variant="accent" className="!px-6 !min-h-11 !text-[0.95rem]">
                      Get started
                    </Button>
                  </NavLink>
                  <NavLink to="/login">
                    <Button variant="secondary" className="!px-5 !min-h-11">
                      Log in
                    </Button>
                  </NavLink>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted pt-1">
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-accent" /> Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-accent" /> ATS-safe PDFs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="w-4 h-4 text-accent" /> Upwork-safe contact mode
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-line bg-panel shadow-lift overflow-hidden">
              <div className="px-5 py-3.5 border-b border-line bg-accent-pale flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-accent-dim">Job match preview</p>
                  <p className="text-sm font-semibold text-navy">Senior Frontend Engineer</p>
                </div>
                <span className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-accent text-white text-sm font-bold shadow-soft">
                  92%
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <IconCheck className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">Strong overlap</p>
                    <p className="text-sm text-ink-muted">
                      React, TypeScript, and API work pulled from your profile
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <IconSparkles className="w-3 h-3" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy">Special notes ready</p>
                    <p className="text-sm text-ink-muted">
                      Emphasize shipping velocity; deprioritize unrelated tooling
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1">
                    Next step
                  </p>
                  <p className="text-sm text-ink">
                    Generate → PDF resume + cover letter in under two minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto text-center">
        {[
          { value: '10k+', label: 'Documents generated' },
          { value: '98%', label: 'ATS-friendly layouts' },
          { value: '3.5x', label: 'More interview callbacks' },
          { value: '<2m', label: 'Average create time' },
        ].map((s) => (
          <div key={s.label} className="space-y-1">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-navy">
              {s.value}
            </p>
            <p className="text-sm text-ink-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="max-w-xl">
          <p className="rf-eyebrow">How it works</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy mt-1">
            From master profile to tailored application
          </h2>
          <p className="rf-page-sub !mt-2">
            One profile. Unlimited targeted resumes and letters for the jobs you apply to.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: '1',
              title: 'Save your experience once',
              body: 'Skills, roles, projects, and education stay in your Profile — your source of truth.',
            },
            {
              n: '2',
              title: 'Paste the job you want',
              body: 'Add title, company, and description. Optionally draft Special notes in Chat first.',
            },
            {
              n: '3',
              title: 'Generate & download',
              body: 'Get a matched resume and cover letter, then export ATS-safe PDF when ready.',
            },
          ].map((step) => (
            <div
              key={step.n}
              className="rounded-lg border border-line bg-panel p-5 sm:p-6 space-y-3"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white text-sm font-bold">
                {step.n}
              </span>
              <h3 className="font-display text-lg font-semibold text-navy">{step.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="max-w-xl">
          <p className="rf-eyebrow">Features</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy mt-1">
            Built for serious applications
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: IconSparkles,
              title: 'AI tailoring',
              body: 'Rewrites bullets around the job without inventing employers or metrics.',
            },
            {
              icon: IconTrendingUp,
              title: 'Requirement match',
              body: 'See how your profile lines up with the posting before you send.',
            },
            {
              icon: IconFileText,
              title: 'ATS layouts',
              body: 'Single-column templates recruiters and parsers can actually read.',
            },
            {
              icon: IconZap,
              title: 'Cover letters',
              body: 'Matching letters with length controls and optional humanize polish.',
            },
            {
              icon: IconCheck,
              title: 'Special notes',
              body: 'Per-application instructions — emphasize one project for this job only.',
            },
            {
              icon: IconShield,
              title: 'Upwork-safe mode',
              body: 'Hide contact channels when marketplaces ban off-platform sharing.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-line bg-panel p-5 space-y-3 hover:border-line-strong transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-navy">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <FAQSection limit={4} />
        <div className="text-center">
          <NavLink to="/faq">
            <Button variant="ghost" className="!text-sm">
              <IconHelp className="w-4 h-4 text-accent" />
              View all FAQs
            </Button>
          </NavLink>
        </div>
      </section>

      <section>
        <Card className="!p-8 sm:!p-10 text-center space-y-4 border-line bg-panel">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy">
            Ready for your next application?
          </h2>
          <p className="text-ink-muted max-w-lg mx-auto">
            Create a free account, save your profile, and generate a tailored package for any role.
          </p>
          <div className="pt-1">
            {isAuthenticated ? (
              <NavLink to="/generate">
                <Button variant="accent" className="!px-7 !min-h-11">
                  Open generator
                </Button>
              </NavLink>
            ) : (
              <NavLink to="/signup">
                <Button variant="accent" className="!px-7 !min-h-11">
                  Create free account
                </Button>
              </NavLink>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
