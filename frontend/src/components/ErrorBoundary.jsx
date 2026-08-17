import React from 'react';
import { Button } from './ui.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-panel p-8 shadow-lift">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Something went wrong</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              An unexpected error occurred in the interface. Your saved profile and history data are safe in the database.
            </p>
            {this.state.error?.message && (
              <pre className="overflow-x-auto rounded bg-field p-3 text-left font-mono text-xs text-ink-muted">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <Button variant="accent" onClick={this.handleReload}>
                Reload Application
              </Button>
              <Button variant="outline" onClick={this.handleHome}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
