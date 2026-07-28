export function RequirementMatch({ items }) {
  if (!items?.length) return null;

  return (
    <section className="rounded-lg border border-line bg-panel p-4">
      <h3 className="text-sm font-semibold text-navy mb-3">
        Requirement match checklist
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-accent text-accent text-[10px]">
              ✓
            </span>
            <div>
              <p className="font-medium text-ink">{item.requirement}</p>
              <p className="text-ink-muted">{item.candidate_match}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
