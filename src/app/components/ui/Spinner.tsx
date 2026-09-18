export function Spinner({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-sm text-ink-medium"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-pill border-4 border-hover border-t-primary" />
      {label ? <span className="font-body text-sm">{label}</span> : null}
    </div>
  );
}
