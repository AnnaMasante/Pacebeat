"use client";

import type { ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { BpmProgressionPoint } from "@/domain/value-objects/BpmProgressionPoint";
import type { Track } from "@/domain/entities/Track";

interface BpmProgressionChartProps {
  progression: BpmProgressionPoint[];
  tracks: Track[];
}

interface ChartPoint {
  elapsedMin: number;
  target: number;
  actual: number;
  title: string;
}

// Target vs actual is distinguished by stroke style (dashed neutral vs solid brand green),
// not by a second hue — two brand greens (#1DB954/#1ED760) are too close for CVD-safe
// categorical use, per the dataviz skill's color-formula checks.
export function BpmProgressionChart({ progression, tracks }: BpmProgressionChartProps) {
  const data: ChartPoint[] = progression.map((point) => ({
    elapsedMin: Math.round((point.elapsedMs / 60_000) * 10) / 10,
    target: Math.round(point.targetBpm),
    actual: Math.round(point.actualBpm),
    title: tracks[point.trackIndex]?.title ?? "",
  }));

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center gap-lg text-xs text-ink-medium">
        <LegendKey
          swatch={<span className="h-0 w-4 border-t-2 border-dashed border-ink-medium" />}
          label="Objectif"
        />
        <LegendKey
          swatch={<span className="h-0.5 w-4 rounded-pill bg-primary" />}
          label="BPM réel"
        />
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-hover)" vertical={false} />
            <XAxis
              dataKey="elapsedMin"
              stroke="var(--color-ink-low)"
              tick={{ fill: "var(--color-ink-low)", fontSize: 12 }}
              tickFormatter={(value: number) => `${value}min`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-ink-low)"
              tick={{ fill: "var(--color-ink-low)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-ink-medium)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="stepAfter"
              dataKey="actual"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendKey({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-xs">
      {swatch}
      {label}
    </span>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  return (
    <div className="rounded-micro bg-card px-sm py-xs text-xs text-ink-high shadow-glow">
      <p className="font-medium">{point.title}</p>
      <p className="tabular-nums text-ink-medium">
        Objectif {point.target} BPM · Réel {point.actual} BPM
      </p>
    </div>
  );
}
