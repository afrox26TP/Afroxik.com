import { IconGauge } from "./icons";

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "high", label: "High" },
  { id: "low", label: "Low" },
];

export default function PerformanceToggle({ value, onChange, className = "" }) {
  const index = Math.max(0, MODES.findIndex((mode) => mode.id === value));

  return (
    <div
      className={`perf-toggle ${className}`.trim()}
      role="group"
      aria-label="Výkon efektů"
      title="Výkon efektů"
      style={{ "--idx": index }}
    >
      <span className="perf-toggle__icon" aria-hidden="true">
        <IconGauge />
      </span>
      <span className="perf-toggle__track">
        <span className="perf-toggle__highlight" aria-hidden="true" />
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-pressed={value === mode.id}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </span>
    </div>
  );
}
