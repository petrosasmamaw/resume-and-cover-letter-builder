/**
 * Shared UI primitives for ResumeForge.
 * Presentation only — no business logic.
 */

/* ─── Logo ─────────────────────────────────────────────── */
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
        fill="#14b8a6"
        opacity="0.4"
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
      <circle cx="46" cy="46" r="9" fill="#f59e0b" />
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

/* ─── BrandMark ─────────────────────────────────────────── */
export function BrandMark({ showTagline = true, compact = false }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Logo className={compact ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0'} />
      <div className="min-w-0">
        <p
          className={`font-display font-bold tracking-tight leading-none text-navy ${
            compact ? 'text-xl' : 'text-2xl md:text-[1.6rem]'
          }`}
        >
          ResumeForge
        </p>
        {showTagline && !compact && (
          <p className="hidden sm:block text-[11px] font-medium text-ink-muted mt-0.5 truncate">
            AI-powered tailored resumes & letters
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Spinner ───────────────────────────────────────────── */
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
        strokeOpacity="0.15"
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

/* ─── LoadingState ──────────────────────────────────────── */
export function LoadingState({ label = 'Loading…' }) {
  return (
    <div
      className="rf-enter flex flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] border border-line bg-panel/80 px-6 py-20 text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
        <Spinner className="h-8 w-8 text-accent relative z-10" />
      </div>
      <span className="text-sm font-semibold tracking-wide text-ink-muted">{label}</span>
    </div>
  );
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="rf-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="rf-page-title">{title}</h1>
        {subtitle && <p className="rf-page-sub">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────── */
export function Card({
  children,
  className = '',
  as: Tag = 'section',
  accent = false,
  hoverable = false,
  ...props
}) {
  return (
    <Tag
      className={[
        'rf-card p-5 sm:p-6 md:p-7',
        accent ? 'rf-card-accent' : '',
        hoverable ? 'rf-card-hover' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* ─── CardTitle ─────────────────────────────────────────── */
export function CardTitle({ children, eyebrow }) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-1.5">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-bold text-navy tracking-tight leading-tight">
        {children}
      </h2>
    </div>
  );
}

/* ─── Alert ─────────────────────────────────────────────── */
const ALERT_ICONS = {
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 mt-0.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8h.01M12 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function Alert({ tone = 'error', children }) {
  const map = {
    error: 'rf-alert-error',
    success: 'rf-alert-success',
    warning: 'rf-alert-warning',
    info: 'rf-alert-info',
  };
  return (
    <div className={`rf-alert ${map[tone] || map.error}`} role="alert">
      {ALERT_ICONS[tone]}
      <span>{children}</span>
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────────── */
export function Field({ label, as = 'input', className = '', ...props }) {
  const Comp = as;
  return (
    <label className="block">
      {label && <span className="rf-label">{label}</span>}
      <Comp className={`rf-input ${className}`} {...props} />
    </label>
  );
}

/* ─── Button ────────────────────────────────────────────── */
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

/* ─── EmptyState ────────────────────────────────────────── */
export function EmptyState({ title, description, action }) {
  return (
    <div className="rf-enter rf-card p-10 sm:p-14 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-soft to-accent/10 text-navy shadow-soft">
        <Logo className="h-9 w-9" />
      </div>
      <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
      {description && (
        <p className="mt-2.5 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* ─── ChoiceCards ───────────────────────────────────────── */
export function ChoiceCards({ options, value, onChange }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink leading-tight">{opt.label}</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  {opt.hint}
                </p>
              </div>
              {active && (
                <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── SectionHeader ─────────────────────────────────────── */
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div>
        <h3 className="text-base font-bold text-navy">{title}</h3>
        {description && (
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
