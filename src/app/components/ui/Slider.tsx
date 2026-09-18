interface SliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Slider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
}: SliderProps) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-body text-sm tracking-wide text-ink-medium">
          {label}
        </label>
        <span className="font-display text-lg font-semibold tabular-nums text-ink-high">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-pill bg-hover accent-primary"
      />
    </div>
  );
}
