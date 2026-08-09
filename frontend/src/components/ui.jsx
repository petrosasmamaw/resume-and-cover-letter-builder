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
      <rect width="64" height="64" rx="12" fill="#001e00" />
      <path
        d="M18 16h20c4.4 0 8 3.6 8 8v2c0 3.3-2 6.2-5 7.4 3 1.3 5 4.2 5 7.6v2c0 4.4-3.6 8-8 8H18V16z"
        fill="#14a800"
        opacity="0.35"
      />
      <path
        d="M20 20h16c2.2 0 4 1.8 4 4v1.5c0 2.2-1.8 4-4 4H20V20zm0 14.5h17c2.2 0 4 1.8 4 4V44c0 2.2-1.8 4-4 4H20V34.5z"
        fill="#F5FBF3"
      />
      <path
        d="M24 24.5h8M24 39h10"
        stroke="#001e00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="46" cy="46" r="9" fill="#14a800" />
      <path
        d="M43 46.2l2.1 2.1 4.2-4.5"
        stroke="#ffffff"
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
      <Logo className={compact ? 'h-8 w-8 shrink-0' : 'h-9 w-9 shrink-0'} />
      <div className="min-w-0">
        <p
          className={`font-display font-bold tracking-tight leading-none text-navy ${
            compact ? 'text-lg' : 'text-xl md:text-[1.35rem]'
          }`}
        >
          ResumeForge
        </p>
        {showTagline && !compact && (
          <p className="hidden sm:block text-[12px] font-medium text-ink-muted mt-0.5 truncate">
            Real profile. Per-job fit.
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

/* ─── Skeleton Primitives & Page Loader Components ───────── */
export function Skeleton({ className = 'h-4 w-full', ...props }) {
  return <div className={`rf-skeleton ${className}`} {...props} />;
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 rf-enter">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 !rounded-lg" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <Card accent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 !rounded-xl" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-32 w-full !rounded-xl" />
          <Skeleton className="h-11 w-44 !rounded-lg" />
        </div>
      </Card>

      <Card accent>
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 !rounded-xl" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function GenerateSkeleton() {
  return (
    <div className="space-y-6 rf-enter">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40 !rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Card>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 w-full !rounded-xl" />
              <Skeleton className="h-16 w-full !rounded-xl" />
              <Skeleton className="h-16 w-full !rounded-xl" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-36 mb-3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full !rounded-xl" />
              <Skeleton className="h-20 w-full !rounded-xl" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
            <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-11 w-full !rounded-lg" /></div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-44 w-full !rounded-xl" />
          </div>
          <Skeleton className="h-12 w-52 !rounded-lg" />
        </div>
      </Card>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-6 rf-enter">
      <div className="space-y-2">
        <Skeleton className="h-10 w-32 !rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-6">
        <div className="space-y-2.5">
          <Skeleton className="h-20 w-full !rounded-xl" />
          <Skeleton className="h-20 w-full !rounded-xl" />
          <Skeleton className="h-20 w-full !rounded-xl" />
          <Skeleton className="h-20 w-full !rounded-xl" />
        </div>
        <Card className="min-h-[350px]">
          <div className="space-y-4">
            <Skeleton className="h-7 w-56 !rounded-md" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-48 w-full !rounded-xl mt-4" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LoadingState({ type = 'profile' }) {
  if (type === 'generate') return <GenerateSkeleton />;
  if (type === 'history') return <HistorySkeleton />;
  return <ProfileSkeleton />;
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
      {eyebrow ? (
        <p className="text-sm font-medium text-ink-muted mb-1">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-xl font-bold text-navy tracking-tight leading-tight">
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
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-navy">
        <Logo className="h-8 w-8" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
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
                <p className="text-sm font-semibold text-ink leading-tight">{opt.label}</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  {opt.hint}
                </p>
              </div>
              {active && (
                <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
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

/* ─── Extra UI Icons ─────────────────────────────────────── */
export function IconHome({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function IconHelp({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconSparkles({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  );
}

export function IconShield({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconFileText({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconTrendingUp({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function IconZap({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconCheck({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconChevronDown({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

