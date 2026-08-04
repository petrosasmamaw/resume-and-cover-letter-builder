import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Button,
  Card,
  IconSparkles,
  IconCheck,
  IconFileText,
  IconTrendingUp,
  IconShield,
  IconZap,
  IconHelp,
} from '../components/ui.jsx';
import FAQSection from '../components/FAQSection.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('match');

  return (
    <div className="space-y-16 md:space-y-24 rf-enter">
      {/* ── 1. HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-4 pb-8 md:pt-8 md:pb-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft text-navy text-xs font-bold uppercase tracking-wider border border-line-accent shadow-xs">
          <IconSparkles className="w-4 h-4 text-accent animate-pulse" />
          <span>AI-Powered Career Tools</span>
        </div>

        <h1 className="rf-page-title !text-3xl sm:!text-5xl lg:!text-6xl font-extrabold tracking-tight text-navy leading-[1.1]">
          Turn Your Real Experience Into <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy via-accent to-navy-light">
            ATS-Tailored Resumes
          </span>{' '}
          in Seconds
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Stop manually retyping your resume for every job. ResumeForge analyzes job postings, scores your match, and builds custom resumes & cover letters tailored to get you interviewed.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <NavLink to="/generate">
              <Button variant="accent" className="!px-6 !py-3.5 !text-base shadow-lift">
                <IconSparkles className="w-5 h-5" />
                Generate Tailored Document
              </Button>
            </NavLink>
          ) : (
            <>
              <NavLink to="/signup">
                <Button variant="accent" className="!px-7 !py-3.5 !text-base shadow-lift">
                  <IconSparkles className="w-5 h-5" />
                  Get Started Free
                </Button>
              </NavLink>
              <NavLink to="/login">
                <Button variant="secondary" className="!px-6 !py-3.5 !text-base">
                  Sign In to Account
                </Button>
              </NavLink>
            </>
          )}
        </div>

        {/* Feature Badges under CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-ink-muted font-medium pt-4">
          <span className="flex items-center gap-1.5">
            <IconCheck className="w-4 h-4 text-accent" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <IconCheck className="w-4 h-4 text-accent" /> ATS Friendly PDF export
          </span>
          <span className="flex items-center gap-1.5">
            <IconCheck className="w-4 h-4 text-accent" /> 100% Private & secure
          </span>
        </div>

        {/* ── Interactive Demo Preview Box ───────────────────── */}
        <div className="pt-6 max-w-3xl mx-auto">
          <Card className="!p-0 border-navy/20 shadow-deep text-left overflow-hidden bg-panel">
            {/* Window bar */}
            <div className="bg-surface px-4 py-3 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-bold text-navy ml-2">ResumeForge Match Engine</span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-line rounded-lg p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('match')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'match' ? 'bg-navy text-white' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Requirement Match
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'preview' ? 'bg-navy text-white' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Tailored Document
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-5 sm:p-7">
              {activeTab === 'match' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-accent-soft/40 border border-line-accent">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">Overall Match Score</span>
                      <h4 className="text-2xl font-black text-navy">92% Match Rating</h4>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent text-white font-bold flex items-center justify-center text-sm shadow-soft">
                      92%
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                      <p className="font-bold text-emerald-800 mb-1.5">✓ Key Strengths Matched</p>
                      <ul className="space-y-1 text-emerald-700">
                        <li>• React 19 & State Management</li>
                        <li>• Node.js REST API Development</li>
                        <li>• PostgreSQL Database Design</li>
                      </ul>
                    </div>
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                      <p className="font-bold text-amber-800 mb-1.5">⚡ Recommendations</p>
                      <ul className="space-y-1 text-amber-700">
                        <li>• Emphasize Docker experience</li>
                        <li>• Highlight CI/CD automated deployments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-sans text-xs sm:text-sm">
                  <div className="border-b border-line pb-3">
                    <h3 className="text-base font-bold text-navy">ALEX MORGAN</h3>
                    <p className="text-ink-muted text-xs">Senior Full-Stack Engineer • alex@example.com • San Francisco, CA</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-navy uppercase tracking-wider text-[11px]">Professional Summary</p>
                    <p className="text-ink-muted leading-relaxed text-xs">
                      Results-driven Full-Stack Engineer with 6+ years of experience delivering scalable web applications using React, Node.js, and PostgreSQL. Demonstrated success in optimizing API latency by 40% and deploying containerized microservices.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent bg-accent-soft px-2.5 py-1 rounded-md">
                      <IconCheck className="w-3.5 h-3.5" /> Tailored specifically for Senior Software Engineer role
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* ── 2. METRICS & PROOF BAR ────────────────────────────── */}
      <section className="rf-card p-6 sm:p-8 bg-gradient-to-r from-navy-deep via-navy to-navy-mid text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-accent-soft">10,000+</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Resumes Generated</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-accent-soft">98.4%</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">ATS Pass Rate</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-accent-soft">3.5x</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">More Interviews</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-accent-soft">&lt; 2 Min</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Avg. Creation Time</p>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ───────────────────────────────────── */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Simple 3-Step Process</span>
          <h2 className="rf-page-title !text-2xl sm:!text-4xl">How ResumeForge Works</h2>
          <p className="rf-page-sub text-sm mx-auto">
            From single master profile to targeted resume and cover letter in three easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-navy font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-navy text-base">Fill Your Profile Once</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Add your work history, key projects, technical skills, and education. This serves as your single source of truth.
            </p>
          </Card>

          <Card className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-navy font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-navy text-base">Paste Any Job Description</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Paste the target job details. Our AI analyzes required skills, experience level, and role expectations automatically.
            </p>
          </Card>

          <Card className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-navy font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-navy text-base">Get Tailored PDF & Letter</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Instantly view your requirement match score, missing keywords, and download an ATS-optimized PDF resume and cover letter.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 4. KEY FEATURES GRID ──────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Powerful Features</span>
          <h2 className="rf-page-title !text-2xl sm:!text-4xl">Everything You Need to Get Hired</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconSparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Smart AI Tailoring</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Rephrases bullet points to highlight relevant impact and keywords matching the target role description.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconTrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Requirement Match Analysis</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Get an instant 0–100% match score with detailed breakdowns of matched strengths and suggested improvements.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconFileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">ATS-Friendly Layout</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Clean, single-column document templates designed specifically to pass automated applicant tracking systems.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconZap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Matching Cover Letters</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Generates personalized cover letters addressing key hiring manager requirements in professional tone options.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Version History</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Keep track of every resume and cover letter generated for different companies and role applications.
            </p>
          </Card>

          <Card hoverable className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
              <IconShield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Data Security & Privacy</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Your profile information belongs to you. Stored securely and never used to train public language models.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 5. FAQ SECTION PREVIEW ────────────────────────────── */}
      <section className="space-y-6 pt-4">
        <FAQSection limit={4} />
        <div className="text-center pt-2">
          <NavLink to="/faq">
            <Button variant="ghost" className="!text-xs">
              <IconHelp className="w-4 h-4 text-accent" />
              View All Frequently Asked Questions
            </Button>
          </NavLink>
        </div>
      </section>

      {/* ── 6. FINAL CALL TO ACTION ───────────────────────────── */}
      <section>
        <Card accent className="text-center !p-8 sm:!p-12 space-y-5 bg-gradient-to-b from-white to-accent-pale/50">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft text-navy flex items-center justify-center mx-auto shadow-soft">
            <IconSparkles className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-navy">
            Ready to Land Your Next Interview?
          </h2>
          <p className="text-sm sm:text-base text-ink-muted max-w-lg mx-auto leading-relaxed">
            Create your master profile now and generate tailored resumes and cover letters for free.
          </p>
          <div className="pt-2">
            {isAuthenticated ? (
              <NavLink to="/generate">
                <Button variant="primary" className="!px-8 !py-3.5 !text-base">
                  Go to Generator
                </Button>
              </NavLink>
            ) : (
              <NavLink to="/signup">
                <Button variant="primary" className="!px-8 !py-3.5 !text-base">
                  Create Free Account
                </Button>
              </NavLink>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
