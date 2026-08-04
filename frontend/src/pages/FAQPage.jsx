import { PageHeader, Card, Button } from '../components/ui.jsx';
import FAQSection from '../components/FAQSection.jsx';
import { NavLink } from 'react-router-dom';
import { IconSparkles, IconHelp, IconShield, IconFileText } from '../components/ui.jsx';

export default function FAQPage() {
  return (
    <div className="space-y-10 rf-enter">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find quick answers to common questions about generating resumes, ATS optimization, and account privacy."
      />

      {/* Feature Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <IconSparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-navy text-sm">AI Profile Matching</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Learns your real experience and aligns it to target job requirements instantly.
          </p>
        </Card>

        <Card className="!p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <IconFileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-navy text-sm">ATS Optimized PDF</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Single-column clean formatting engineered to pass modern hiring algorithms.
          </p>
        </Card>

        <Card className="!p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <IconShield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-navy text-sm">Strict Privacy</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Your data is stored securely and never sold or used for public AI model training.
          </p>
        </Card>
      </div>

      {/* FAQ Interactive Accordion */}
      <FAQSection showHeader={false} />

      {/* CTA Box */}
      <Card accent className="text-center !p-8 sm:!p-10 space-y-4 max-w-3xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-navy flex items-center justify-center mx-auto">
          <IconHelp className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-navy">Still have questions?</h2>
        <p className="text-sm text-ink-muted max-w-md mx-auto">
          Ready to create your tailored resume and boost your interview call rates? Get started in under 2 minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NavLink to="/generate">
            <Button variant="primary" className="!px-6">
              <IconSparkles className="w-4 h-4 text-accent" />
              Generate Resume Now
            </Button>
          </NavLink>
          <NavLink to="/">
            <Button variant="secondary">Go to Profile</Button>
          </NavLink>
        </div>
      </Card>
    </div>
  );
}
