import type { CSSProperties } from "react";
import type { CurveShape } from "@/domain/value-objects/CurveShape";

const MIN_HEIGHT = 18;
const MAX_HEIGHT = 100;
const STABLE_HEIGHT = 58;

function barHeight(shape: CurveShape, index: number, count: number): number {
  const progress = index / (count - 1);
  if (shape === "stable") return STABLE_HEIGHT;
  const rising = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * progress;
  return shape === "increasing" ? rising : MAX_HEIGHT + MIN_HEIGHT - rising;
}

interface BeatCurveProps {
  shape: CurveShape;
  count: number;
  small?: boolean;
}

export function BeatCurve({ shape, count, small = false }: BeatCurveProps) {
  return (
    <div className={small ? "lp-bars lp-bars--s" : "lp-bars"} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="lp-bar"
          data-lit={small || index % 4 === 0 ? "" : undefined}
          style={{ "--h": barHeight(shape, index, count), "--i": index } as CSSProperties}
        />
      ))}
    </div>
  );
}
