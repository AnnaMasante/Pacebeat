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

// Target vs actual is distinguished by stroke style (dashed neutral vs solid accent green),
// not by a second hue.
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
        <LegendKey swatch={<span className="h-0.5 w-4 bg-primary" />} label="BPM réel" />
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-rule)" vertical={false} />
            <XAxis
              dataKey="elapsedMin"
              stroke="var(--color-muted)"
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              tickFormatter={(value: number) => `${Math.round(value)}min`}
              minTickGap={32}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-muted)"
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
              domain={["dataMin - 5", "dataMax + 5"]}
              allowDecimals={false}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} />} />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-ink-2)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="stepAfter"
              dataKey="actual"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "var(--color-accent)",
                stroke: "var(--color-paper-2)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--color-accent)",
                stroke: "var(--color-paper-2)",
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
    <div className="lp-well px-md py-sm text-xs text-ink-high">
      <p>{point.title}</p>
      <p className="text-ink-medium">
        Objectif {point.target} BPM, réel {point.actual} BPM
      </p>
    </div>
  );
}
