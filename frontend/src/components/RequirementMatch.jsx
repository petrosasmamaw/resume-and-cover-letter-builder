import { useState } from 'react';

/* ── SVG check icon ──────────────────────────────────────── */
function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function RequirementMatch({ items }) {
  const [open, setOpen] = useState(true);

  if (!items?.length) return null;

  const count = items.length;

  return (
    <section className="rf-card overflow-hidden rf-enter">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-5 sm:p-6 hover:bg-surface/50 transition-colors duration-150 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-soft to-accent/20 text-navy">
            <CheckIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-0.5">
              Match analysis
            </p>
            <h3 className="text-base font-bold text-navy leading-tight">
              Requirement checklist
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {items.slice(0, Math.min(count, 8)).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ opacity: 0.3 + (i / count) * 0.7 }}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-navy bg-accent-soft border border-line-accent px-2 py-0.5 rounded-full">
              {count} match{count !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* Chevron */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className={`shrink-0 text-ink-muted transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Mobile count */}
      {open && (
        <div className="sm:hidden px-5 pb-2 -mt-2">
          <span className="text-xs font-bold text-navy bg-accent-soft border border-line-accent px-2.5 py-0.5 rounded-full">
            {count} requirement{count !== 1 ? 's' : ''} matched
          </span>
        </div>
      )}

      {/* Collapsible body */}
      {open && (
        <ul className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3 border-t border-line">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 pt-3 text-sm"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-soft to-accent/20 text-navy">
                <CheckIcon className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink leading-snug">
                  {item.requirement}
                </p>
                <p className="text-ink-muted mt-0.5 leading-relaxed text-xs">
                  {item.candidate_match}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
