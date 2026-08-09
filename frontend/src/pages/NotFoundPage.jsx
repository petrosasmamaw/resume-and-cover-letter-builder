import { NavLink } from 'react-router-dom';
import { Card, Button, Logo, IconHome } from '../components/ui.jsx';

export default function NotFoundPage() {
  return (
    <div className="py-12 sm:py-20 max-w-lg mx-auto rf-enter">
      <Card className="text-center !p-8 sm:!p-12 space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft text-navy shadow-soft">
          <Logo className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-navy">Page not found</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            That URL isn’t in ResumeForge. Head home to generate, chat, or update your profile.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NavLink to="/">
            <Button variant="primary">
              <IconHome className="w-4 h-4" />
              Back to Home
            </Button>
          </NavLink>
        </div>
      </Card>
    </div>
  );
}
