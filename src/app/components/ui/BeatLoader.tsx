import type { CSSProperties } from "react";

const BAR_COUNT = 24;

function barHeight(index: number): number {
  return 30 + 70 * Math.abs(Math.sin(index * 0.9));
}

interface BeatLoaderProps {
  label: string;
  progress?: number;
}

export function BeatLoader({ label, progress }: BeatLoaderProps) {
  return (
    <div role="status" className="flex w-full flex-col gap-md">
      <div className="lp-bars lp-bars--s" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <span
            key={index}
            className="lp-bar"
            data-lit={progress === undefined || index / BAR_COUNT < progress ? "" : undefined}
            style={{ "--h": barHeight(index), "--i": index } as CSSProperties}
          />
        ))}
      </div>
      <p className="text-sm text-ink-medium">{label}</p>
    </div>
  );
}
