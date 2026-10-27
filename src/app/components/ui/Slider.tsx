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
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="lp-label">
          {label}
        </label>
        <span className="text-3xl text-ink-high">{formatValue ? formatValue(value) : value}</span>
      </div>
      <div className="lp-stepper">
        <button
          type="button"
          className="lp-step"
          aria-label={`${label} : moins`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          -
        </button>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="lp-range"
        />
        <button
          type="button"
          className="lp-step"
          aria-label={`${label} : plus`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
}
