import type { ReactNode } from "react";
import type { CurveShape } from "@/domain/value-objects/CurveShape";
import { SegmentedControl, type SegmentedOption } from "@/app/components/ui/SegmentedControl";

const OPTIONS: SegmentedOption<CurveShape>[] = [
  {
    value: "increasing",
    label: "Croissante",
    icon: <CurveIcon path="M3 17 L10 10 L14 14 L21 5" />,
  },
  {
    value: "decreasing",
    label: "Décroissante",
    icon: <CurveIcon path="M3 5 L10 12 L14 8 L21 17" />,
  },
  {
    value: "stable",
    label: "Stable",
    icon: <CurveIcon path="M3 12 H21" />,
  },
];

function CurveIcon({ path }: { path: string }): ReactNode {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CurveShapePickerProps {
  value: CurveShape;
  onChange: (value: CurveShape) => void;
}

export function CurveShapePicker({ value, onChange }: CurveShapePickerProps) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}
