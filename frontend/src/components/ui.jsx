/**
 * Shared UI primitives for ResumeForge redesign.
 * Keep logic-free — presentation only.
 */

export function Logo({ className = 'h-9 w-9', title = 'ResumeForge' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <rect width="64" height="64" rx="14" fill="#0C3B3A" />
      <path
        d="M18 16h20c4.4 0 8 3.6 8 8v2c0 3.3-2 6.2-5 7.4 3 1.3 5 4.2 5 7.6v2c0 4.4-3.6 8-8 8H18V16z"
        fill="#1FA2A0"
        opacity="0.35"
      />
      <path
        d="M20 20h16c2.2 0 4 1.8 4 4v1.5c0 2.2-1.8 4-4 4H20V20zm0 14.5h17c2.2 0 4 1.8 4 4V44c0 2.2-1.8 4-4 4H20V34.5z"
        fill="#F0FDFC"
      />
      <path
        d="M24 24.5h8M24 39h10"
        stroke="#0C3B3A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="46" cy="46" r="9" fill="#F0B429" />
      <path
        d="M43 46.2l2.1 2.1 4.2-4.5"
        stroke="#0C3B3A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandMark({ showTagline = true, compact = false }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Logo className={compact ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0'} />
      <div className="min-w-0">
        <p
          className={`font-display text-navy tracking-tight leading-none ${
            compact ? 'text-xl' : 'text-2xl md:text-3xl'
          }`}
        >
          ResumeForge
        </p>
        {showTagline && !compact && (
          <p className="hidden sm:block text-[11px] text-ink-muted mt-1 truncate">
            Tailored resumes & cover letters
          </p>
        )}
      </div>
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={`rf-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div
      className="rf-enter flex items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-line bg-panel/80 px-6 py-16 text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-5 w-5 text-accent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="rf-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="rf-page-title">{title}</h1>
        {subtitle && <p className="rf-page-sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '', as: Tag = 'section', ...props }) {
  return (
    <Tag className={`rf-card p-4 sm:p-5 md:p-6 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, eyebrow }) {
  return (
    <div className="mb-4">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent mb-1">
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-semibold text-navy tracking-tight">{children}</h2>
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const map = {
    error: 'rf-alert-error',
    success: 'rf-alert-success',
    warning: 'rf-alert-warning',
    info: 'rf-alert-info',
  };
  return (
    <div className={`rf-alert ${map[tone] || map.error}`} role="alert">
      {children}
    </div>
  );
}

export function Field({ label, as = 'input', className = '', ...props }) {
  const Comp = as;
  return (
    <label className="block text-sm">
      {label && <span className="rf-label">{label}</span>}
      <Comp className={`rf-input ${className}`} {...props} />
    </label>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  loading,
  ...props
}) {
  const variants = {
    primary: 'rf-btn-primary',
    accent: 'rf-btn-accent',
    secondary: 'rf-btn-secondary',
    ghost: 'rf-btn-ghost',
    danger: 'rf-btn-danger',
  };
  return (
    <button
      className={`rf-btn ${variants[variant] || variants.primary} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rf-enter rf-card p-8 sm:p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-navy">
        <Logo className="h-8 w-8" />
      </div>
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ChoiceCards({ options, value, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rf-choice ${active ? 'rf-choice-active' : ''}`}
            aria-pressed={active}
          >
            <p className="text-sm font-semibold text-ink">{opt.label}</p>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              {opt.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}
