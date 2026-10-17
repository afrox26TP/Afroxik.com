import { useEffect, useRef, useState } from "react";

// Úvodní loader s procenty (inspirace Lepshee). Procenta plynule dohánějí skutečný stav načítání.
export default function Preloader({ progress, done, name }) {
  const rootRef = useRef(null);
  const percentRef = useRef(null);
  const targetRef = useRef(0);
  const [finishing, setFinishing] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    targetRef.current = done ? 1 : progress;
  }, [progress, done]);

  useEffect(() => {
    const root = rootRef.current;
    const percent = percentRef.current;
    if (!root || !percent) return undefined;

    let value = 0;
    let last = performance.now();
    let raf = 0;
    let hideTimer = 0;

    // Časový (ne snímkový) easing – na pomalém zařízení se loader nevleče.
    const tick = (now) => {
      const dt = Math.min(250, now - last);
      last = now;
      const target = targetRef.current;
      if (target > value) {
        const eased = (target - value) * (1 - Math.exp(-dt / 220));
        value = Math.min(target, value + Math.max(eased, dt * 0.0006));
      }
      root.style.setProperty("--progress", value.toFixed(4));
      percent.textContent = `${Math.round(value * 100)}%`;

      if (target >= 1 && value >= 0.999) {
        setFinishing(true);
        hideTimer = window.setTimeout(() => setGone(true), 700);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className={`preloader${finishing ? " is-done" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Načítání stránky"
    >
      <div className="preloader__inner">
        <p className="preloader__title">
          Loaduju <span>{name}</span>
        </p>
        <div className="preloader__line" aria-hidden="true">
          <span className="preloader__fill" />
        </div>
        <span ref={percentRef} className="preloader__percent" aria-hidden="true">
          0%
        </span>
      </div>
    </div>
  );
}
