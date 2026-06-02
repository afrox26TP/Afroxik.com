import { memo, useRef, useState, useMemo, useCallback, useEffect } from "react";

function buildBoxShadow(glowColor, intensity) {
  const match = glowColor.match(/([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?/);
  const [h, s, l] = match ? [match[1], match[2], match[3]] : ["40", "80", "80"];
  const base = `${h}deg ${s}% ${l}%`;
  const layers = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) =>
      `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${Math.min(alpha * intensity, 100)}%)`
    )
    .join(", ");
}

const GRADIENT_POSITIONS = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors) {
  const g = GRADIENT_POSITIONS.map((pos, i) =>
    `radial-gradient(at ${pos}, ${colors[Math.min(COLOR_MAP[i], colors.length - 1)]} 0px, transparent 50%)`
  );
  g.push(`linear-gradient(${colors[0]} 0 100%)`);
  return g;
}

function BorderGlow({
  children,
  className = "",
  disabled = false,
  edgeSensitivity = 30,
  glowColor = "40 80 80",
  borderRadius = 12,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  colors = ["#c084fc", "#f472b6", "#38bdf8"],
  style = {},
  ...rest
}) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const pointerRef = useRef(null);
  const frameRef = useRef(0);
  const boundsRef = useRef(null);

  if (disabled) {
    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{
          borderRadius: `${borderRadius}px`,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  const colorSens = edgeSensitivity + 20;

  const applyPointerGlow = useCallback(() => {
    frameRef.current = 0;

    const el = ref.current;
    const point = pointerRef.current;
    if (!el || !point || !hoveredRef.current) return;

    const r = boundsRef.current || el.getBoundingClientRect();
    const x = point.x - r.left;
    const y = point.y - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    const borderOpacity = Math.max(0, (proximity * 100 - colorSens) / (100 - colorSens));
    const glowOpacity = Math.max(0, (proximity * 100 - edgeSensitivity) / (100 - edgeSensitivity));

    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    el.style.setProperty("--bg-angle", `${deg.toFixed(3)}deg`);
    el.style.setProperty("--bg-border-opacity", String(borderOpacity));
    el.style.setProperty("--bg-glow-opacity", String(glowOpacity));
  }, [colorSens, edgeSensitivity]);

  const onPointerMove = useCallback((e) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(applyPointerGlow);
    }
  }, [applyPointerGlow]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const updateBounds = () => {
      boundsRef.current = el.getBoundingClientRect();
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const mesh = useMemo(() => buildMeshGradients(colors), [colors]);
  const conicMask = `conic-gradient(from var(--bg-angle) at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`;
  const glowMask = "conic-gradient(from var(--bg-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)";
  const t = hovered ? "opacity 0.25s ease-out" : "opacity 0.75s ease-in-out";
  const boxShadow = useMemo(() => buildBoxShadow(glowColor, glowIntensity), [glowColor, glowIntensity]);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        "--bg-angle": "45deg",
        "--bg-border-opacity": 0,
        "--bg-glow-opacity": 0,
        ...style,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={(e) => {
        hoveredRef.current = true;
        setHovered(true);
        pointerRef.current = { x: e.clientX, y: e.clientY };
        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(applyPointerGlow);
        }
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
        setHovered(false);
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
        const el = ref.current;
        if (el) {
          el.style.setProperty("--bg-border-opacity", "0");
          el.style.setProperty("--bg-glow-opacity", "0");
        }
      }}
      {...rest}
    >
      {/* gradient border overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          border: "1px solid transparent",
          background: ["transparent padding-box", ...mesh.map((g) => `${g} border-box`)].join(", "),
          opacity: "var(--bg-border-opacity)",
          maskImage: conicMask,
          WebkitMaskImage: conicMask,
          pointerEvents: "none",
          zIndex: 2,
          transition: t,
        }}
      />

      {/* outer glow */}
      <span
        style={{
          position: "absolute",
          borderRadius: "inherit",
          pointerEvents: "none",
          inset: `-${glowRadius}px`,
          maskImage: glowMask,
          WebkitMaskImage: glowMask,
          opacity: "var(--bg-glow-opacity)",
          mixBlendMode: "plus-lighter",
          zIndex: 2,
          transition: t,
        }}
      >
        <span
          style={{
            position: "absolute",
            borderRadius: "inherit",
            inset: `${glowRadius}px`,
            boxShadow,
          }}
        />
      </span>

      {children}
    </div>
  );
}

export default memo(BorderGlow);
