import { IconGauge } from "./icons";
import { useT } from "../../lib/i18n";

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "high", label: "High" },
  { id: "low", label: "Low" },
];

export default function PerformanceToggle({ value, onChange, className = "" }) {
  const t = useT();
  const index = Math.max(0, MODES.findIndex((mode) => mode.id === value));

  return (
    <div
      className={`perf-toggle ${className}`.trim()}
      role="group"
      aria-label={t.nav.perf}
      title={t.nav.perf}
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
