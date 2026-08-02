export function RequirementMatch({ items }) {
  if (!items?.length) return null;

  return (
    <section className="rf-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-navy text-sm font-bold">
          ✓
        </span>
        <h3 className="text-sm font-semibold text-navy">
          Requirement match checklist
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/15 text-navy text-[11px] font-bold">
              ✓
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{item.requirement}</p>
              <p className="text-ink-muted mt-0.5 leading-relaxed">
                {item.candidate_match}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
