interface ProgressBarProps {
  label?: string;
  done: number;
  total: number;
}

export function ProgressBar({ label, done, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className="flex w-full max-w-80 flex-col items-center gap-sm text-ink-medium"
      role="status"
      aria-live="polite"
    >
      <div className="h-2 w-full overflow-hidden rounded-pill bg-hover">
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label ? (
        <span className="font-body text-sm tabular-nums">
          {label}
          {total > 0 ? ` (${done}/${total})` : ""}
        </span>
      ) : null}
    </div>
  );
}
