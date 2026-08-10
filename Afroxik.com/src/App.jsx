import { useEffect, useRef, useState } from "react";
import { getPageData } from "../../src/lib/content";
import PlasmaBackground from "./components/PlasmaBackground";
import LiquidGlass from "./components/ui/liquid-glass";
import BorderGlow from "./components/ui/BorderGlow";
import {
  WarpDialog,
  WarpDialogContent,
  WarpDialogTrigger,
} from "@/components/molecule-ui/warp-dialog";
import { WarpOverlayDemo } from "./components/molecule-ui/WarpOverlayDemo";

function detectLowEnd() {
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = navigator.deviceMemory ?? 4;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const verySlowNetwork = connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
  const weakCpu = cores <= 2;
  const lowMemory = mem > 0 && mem <= 3;
  return weakCpu || lowMemory || saveData || verySlowNetwork;
}
const IS_LOW_END = detectLowEnd();
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PARTICLE_COLORS = [
  { r: "77, 163, 255",  w: 55 },
  { r: "50, 102, 255",  w: 25 },
  { r: "92, 230, 255",  w: 15 },
  { r: "255, 255, 255", w: 5 },
];

function pickColor() {
  let roll = Math.random() * 100;
  for (const c of PARTICLE_COLORS) {
    roll -= c.w;
    if (roll <= 0) return c.r;
  }
  return PARTICLE_COLORS[0].r;
}

const PERFORMANCE_STORAGE_KEY = "afrox-performance-mode";

function useParticles(canvasRef, lowEnd) {
  useEffect(() => {
    if (PREFERS_REDUCED_MOTION) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf;
    let resizeRaf = 0;
    let isPaused = document.hidden;
    let frame = 0;

    const mouse = { x: width / 2, y: height / 2, active: false };
    const REPEL_RADIUS = 120;
    const ATTRACT_RING = 190;
    const REPEL_FORCE = 3.8;
    const ATTRACT_FORCE = 0.6;
    const SPEED_LIMIT = 4.5;
    const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS;
    const ATTRACT_RING_SQ = ATTRACT_RING * ATTRACT_RING;
    const CURSOR_RADIUS = 220;
    const CURSOR_RADIUS_SQ = CURSOR_RADIUS * CURSOR_RADIUS;

    const LAYERS = lowEnd
      ? [
          { count: 16, speedMult: 0.35, rMult: 0.7, alphaMult: 0.7 },
          { count: 20, speedMult: 0.70, rMult: 1.0, alphaMult: 1.0 },
          { count: 12, speedMult: 1.30, rMult: 1.5, alphaMult: 1.4 },
        ]
      : [
          { count: 40, speedMult: 0.35, rMult: 0.7, alphaMult: 0.7 },
          { count: 45, speedMult: 0.70, rMult: 1.0, alphaMult: 1.0 },
          { count: 30, speedMult: 1.30, rMult: 1.5, alphaMult: 1.4 },
        ];
    const LINK_DIST = lowEnd ? 110 : 155;
    const LINK_CELL_SIZE = LINK_DIST;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    const LINK_BOOST_RADIUS = 200;
    const LINK_BOOST_RADIUS_SQ = LINK_BOOST_RADIUS * LINK_BOOST_RADIUS;
    const LINK_NEIGHBOR_OFFSETS = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ];

    const particles = [];
    for (const layer of LAYERS) {
      for (let i = 0; i < layer.count; i++) {
        const bvx = (Math.random() - 0.5) * 0.55 * layer.speedMult;
        const bvy = (Math.random() - 0.5) * 0.55 * layer.speedMult;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: bvx,
          vy: bvy,
          baseVx: bvx,
          baseVy: bvy,
          r: (Math.random() * 1.4 + 0.5) * layer.rMult,
          alphaMult: layer.alphaMult,
          speedMult: layer.speedMult,
          color: pickColor(),
          trail: [],
          trailMax: lowEnd ? 0 : Math.floor(6 + Math.random() * 8),
        });
      }
    }
    const COUNT = particles.length;

    const auras = Array.from({ length: lowEnd ? 0 : 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 240 + 130,
      alpha: Math.random() * 0.07 + 0.025,
      hue: ["77, 163, 255", "50, 102, 255", "92, 230, 255"][Math.floor(Math.random() * 3)],
    }));

    const meteors = [];
    function spawnMeteor() {
      const fromTop = Math.random() > 0.4;
      const angle = fromTop
        ? Math.PI / 4 + (Math.random() - 0.5) * 0.6
        : Math.PI * 1.5 + (Math.random() - 0.5) * 0.6;
      const spd = Math.random() * 8 + 6;
      meteors.push({
        x: fromTop ? Math.random() * width : -60,
        y: fromTop ? -60 : Math.random() * (height * 0.6),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        len: Math.random() * 180 + 80,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        color: Math.random() > 0.5 ? "77, 163, 255" : "92, 230, 255",
      });
    }

    const bursts = [];
    function spawnBurst(cx, cy) {
      const N = lowEnd ? 14 : 32;
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 + Math.random() * 0.2;
        const speed = Math.random() * 5 + 1.5;
        bursts.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: Math.random() * 0.022 + 0.014,
          r: Math.random() * 2.6 + 0.7,
          color: pickColor(),
          trail: [],
          trailMax: lowEnd ? 0 : Math.floor(4 + Math.random() * 6),
        });
      }
      for (let i = 0; i < (lowEnd ? 3 : 8); i++) {
        const angle = (i / 8) * Math.PI * 2;
        bursts.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * (Math.random() * 1.2 + 0.4),
          vy: Math.sin(angle) * (Math.random() * 1.2 + 0.4),
          life: 1,
          decay: 0.007 + Math.random() * 0.005,
          r: Math.random() * 4 + 2,
          color: "77, 163, 255",
          trail: [],
          trailMax: lowEnd ? 0 : 10,
        });
      }
    }

    function drawTrail(trail, color) {
      if (trail.length < 2) return;
      for (let t = 1; t < trail.length; t++) {
        const a = (t / trail.length) * 0.35;
        ctx.beginPath();
        ctx.moveTo(trail[t - 1].x, trail[t - 1].y);
        ctx.lineTo(trail[t].x, trail[t].y);
        ctx.strokeStyle = `rgba(${color}, ${a})`;
        ctx.lineWidth = (t / trail.length) * 1.2;
        ctx.stroke();
      }
    }

    const FRAME_MS = lowEnd ? 50 : 33;
    let lastDrawTime = 0;
    const linkBuckets = new Map();
    function draw(timestamp) {
      raf = 0;
      if (isPaused) return;
      if (timestamp - lastDrawTime < FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = timestamp;
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (!lowEnd && frame % 220 === 0 && Math.random() > 0.35) spawnMeteor();

      for (const a of auras) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -a.r) a.x = width + a.r;
        else if (a.x > width + a.r) a.x = -a.r;
        if (a.y < -a.r) a.y = height + a.r;
        else if (a.y > height + a.r) a.y = -a.r;
        const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r);
        grad.addColorStop(0, `rgba(${a.hue}, ${a.alpha})`);
        grad.addColorStop(1, `rgba(${a.hue}, 0)`);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      for (let m = meteors.length - 1; m >= 0; m--) {
        const mt = meteors[m];
        mt.x += mt.vx; mt.y += mt.vy;
        mt.life -= mt.decay;
        if (mt.life <= 0 || mt.x > width + 200 || mt.y > height + 200) {
          meteors.splice(m, 1);
          continue;
        }
        const tx = mt.x - (mt.vx / Math.hypot(mt.vx, mt.vy)) * mt.len;
        const ty = mt.y - (mt.vy / Math.hypot(mt.vx, mt.vy)) * mt.len;
        const mg = ctx.createLinearGradient(tx, ty, mt.x, mt.y);
        mg.addColorStop(0, `rgba(${mt.color}, 0)`);
        mg.addColorStop(0.6, `rgba(${mt.color}, ${mt.life * 0.5})`);
        mg.addColorStop(1, `rgba(255, 255, 255, ${mt.life * 0.95})`);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(mt.x, mt.y);
        ctx.strokeStyle = mg;
        ctx.lineWidth = 1.5 * mt.life;
        ctx.stroke();
        const tg = ctx.createRadialGradient(mt.x, mt.y, 0, mt.x, mt.y, 10);
        tg.addColorStop(0, `rgba(255, 255, 255, ${mt.life * 0.9})`);
        tg.addColorStop(1, `rgba(${mt.color}, 0)`);
        ctx.beginPath();
        ctx.arc(mt.x, mt.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = tg;
        ctx.fill();
      }

      linkBuckets.clear();

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdistSq = mdx * mdx + mdy * mdy;

        if (mdistSq < REPEL_RADIUS_SQ && mdistSq > 0) {
          const mdist = Math.sqrt(mdistSq);
          const force = (1 - mdist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (mdx / mdist) * force * 0.1;
          p.vy += (mdy / mdist) * force * 0.1;
        } else if (mouse.active && mdistSq > REPEL_RADIUS_SQ && mdistSq < ATTRACT_RING_SQ) {
          const mdist = Math.sqrt(mdistSq);
          const t = (mdist - REPEL_RADIUS) / (ATTRACT_RING - REPEL_RADIUS);
          const force = (1 - t) * ATTRACT_FORCE * p.speedMult;
          p.vx -= (mdx / mdist) * force * 0.06;
          p.vy -= (mdy / mdist) * force * 0.06;
        }

        p.vx += (p.baseVx - p.vx) * 0.016;
        p.vy += (p.baseVy - p.vy) * 0.016;

        const maxSpeed = SPEED_LIMIT * p.speedMult;
        const spdSq = p.vx * p.vx + p.vy * p.vy;
        if (spdSq > maxSpeed * maxSpeed) {
          const spd = Math.sqrt(spdSq);
          p.vx = (p.vx / spd) * maxSpeed;
          p.vy = (p.vy / spd) * maxSpeed;
        }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailMax) p.trail.shift();
        drawTrail(p.trail, p.color);

        const nearCursor = mouse.active && mdistSq < CURSOR_RADIUS_SQ
          ? (1 - Math.sqrt(mdistSq) / CURSOR_RADIUS) * 0.55
          : 0;
        const alpha = Math.min(1, (0.4 + nearCursor) * p.alphaMult);
        const radius = p.r + nearCursor * 1.8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, alpha + 0.15)})`;
        ctx.fill();

        const cellX = Math.floor(p.x / LINK_CELL_SIZE);
        const cellY = Math.floor(p.y / LINK_CELL_SIZE);
        const key = (cellX + 500) * 1000 + (cellY + 500);
        let bucket = linkBuckets.get(key);
        if (!bucket) {
          bucket = { cx: cellX, cy: cellY, items: [] };
          linkBuckets.set(key, bucket);
        }
        bucket.items.push(i);
      }

      for (const bucket of linkBuckets.values()) {
        for (const [offsetX, offsetY] of LINK_NEIGHBOR_OFFSETS) {
          const neighbor = linkBuckets.get((bucket.cx + offsetX + 500) * 1000 + (bucket.cy + offsetY + 500));
          if (!neighbor) continue;

          const sameBucket = neighbor === bucket;
          for (let a = 0; a < bucket.items.length; a++) {
            const i = bucket.items[a];
            const p = particles[i];
            const startIndex = sameBucket ? a + 1 : 0;

            for (let b = startIndex; b < neighbor.items.length; b++) {
              const q = particles[neighbor.items[b]];
              const dx = p.x - q.x;
              const dy = p.y - q.y;
              if (Math.abs(dx) > LINK_DIST || Math.abs(dy) > LINK_DIST) continue;

              const distSq = dx * dx + dy * dy;
              if (distSq >= LINK_DIST_SQ) continue;

              const dist = Math.sqrt(distSq);
              const t = 1 - dist / LINK_DIST;
              if (t < 0.05) continue;
              const linkNearSq = ((p.x + q.x) / 2 - mouse.x) ** 2 + ((p.y + q.y) / 2 - mouse.y) ** 2;
              const linkBoost = mouse.active && linkNearSq < LINK_BOOST_RADIUS_SQ
                ? (1 - Math.sqrt(linkNearSq) / LINK_BOOST_RADIUS) * 0.4
                : 0;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(${p.color}, ${t * (0.28 + linkBoost)})`;
              ctx.lineWidth = t * (1.1 + linkBoost * 1.5);
              ctx.stroke();
            }
          }
        }
      }

      for (let b = bursts.length - 1; b >= 0; b--) {
        const bp = bursts[b];
        bp.x += bp.vx; bp.y += bp.vy;
        bp.vx *= 0.95; bp.vy *= 0.95;
        bp.life -= bp.decay;
        if (bp.life <= 0) { bursts.splice(b, 1); continue; }

        bp.trail.push({ x: bp.x, y: bp.y });
        if (bp.trail.length > bp.trailMax) bp.trail.shift();
        drawTrail(bp.trail, bp.color);

        const gr = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, bp.r * bp.life * 3);
        gr.addColorStop(0, `rgba(${bp.color}, ${bp.life * 0.7})`);
        gr.addColorStop(1, `rgba(${bp.color}, 0)`);
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.r * bp.life * 3, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.r * bp.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${bp.color}, ${bp.life})`;
        ctx.fill();
      }

      if (!raf) raf = requestAnimationFrame(draw);

    }

    raf = requestAnimationFrame(draw);

    function onMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onPointerLeave() {
      mouse.active = false;
    }
    function onClick(e) {
      spawnBurst(e.clientX, e.clientY);
    }
    function onResize() {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        if (nextWidth === width && nextHeight === height) return;
        width = canvas.width = nextWidth;
        height = canvas.height = nextHeight;
      });
    }
    function onVisibilityChange() {
      isPaused = document.hidden;
      if (isPaused) mouse.active = false;
      if (isPaused) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [canvasRef, lowEnd]);
}

export default function App() {
  const [performanceMode, setPerformanceMode] = useState(() => {
    try {
      const storedMode = window.localStorage.getItem(PERFORMANCE_STORAGE_KEY);
      return storedMode === "auto" || storedMode === "high" || storedMode === "low"
        ? storedMode
        : "auto";
    } catch {
      return "auto";
    }
  });
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloading, setIsPreloading] = useState(true);
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 900 : false,
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)").matches
      : false,
  );
  const plasmaReadyRef = useRef(false);
  const fontsReadyRef = useRef(false);
  const dataReadyRef = useRef(false);
  const warmupTimerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const updateViewport = () => setIsCompactViewport(window.innerWidth < 900);
    updateViewport();

    const pointerMedia =
      typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)") : null;
    const updatePointer = () => setIsCoarsePointer(Boolean(pointerMedia?.matches));
    updatePointer();

    window.addEventListener("resize", updateViewport, { passive: true });
    pointerMedia?.addEventListener("change", updatePointer);

    return () => {
      window.removeEventListener("resize", updateViewport);
      pointerMedia?.removeEventListener("change", updatePointer);
    };
  }, []);

  const useLowPerformanceMode =
    performanceMode === "low"
      ? true
      : performanceMode === "high"
        ? false
        : IS_LOW_END;
  const shouldUseFullFx = !useLowPerformanceMode && !isCompactViewport && !isCoarsePointer;
  const forceHighSvgFilter = performanceMode === "high" && shouldUseFullFx;
  const glassRenderKey = `perf-${performanceMode}`;

  const handlePerformanceChange = (nextMode) => {
    setPerformanceMode(nextMode);
    try {
      window.localStorage.setItem(PERFORMANCE_STORAGE_KEY, nextMode);
    } catch {
      // Ignore storage issues in private browsing or blocked storage contexts.
    }
  };

  // Starts a 1s warmup timer once plasma + fonts + data are all ready
  const tryStartWarmup = () => {
    if (warmupTimerRef.current !== null) return;
    if (!plasmaReadyRef.current || !fontsReadyRef.current || !dataReadyRef.current) return;
    warmupTimerRef.current = window.setTimeout(() => setIsPreloading(false), 1000);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      const nextData = await getPageData();
      if (isMounted) {
        setData(nextData);
        setIsLoading(false);
        dataReadyRef.current = true;
        tryStartWarmup();
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fontsReadyPromise = document.fonts?.ready;
    if (fontsReadyPromise && typeof fontsReadyPromise.then === "function") {
      fontsReadyPromise
        .then(() => {
          fontsReadyRef.current = true;
          tryStartWarmup();
        })
        .catch(() => {
          fontsReadyRef.current = true;
          tryStartWarmup();
        });
    } else {
      // Keep loading flow moving on browsers without the Font Loading API.
      fontsReadyRef.current = true;
      tryStartWarmup();
    }
    // Safety-net: force-unblock after 4s regardless
    const fallback = window.setTimeout(() => setIsPreloading(false), 4000);
    return () => {
      window.clearTimeout(fallback);
      if (warmupTimerRef.current) window.clearTimeout(warmupTimerRef.current);
    };
  }, []);

  useParticles(canvasRef, useLowPerformanceMode);

  const projects = data?.projects ?? [];
  const profile = data?.profile ?? {
    name: "",
    intro: "",
    discord: "",
    github: "",
    githubHandle: "",
    instagram: "",
    instagramHandle: "",
    steam: "",
    steamHandle: "",
  };

  const isContentReady = !isLoading && !isPreloading && !!data;

  return (
    <div className={`fx-page text-white${useLowPerformanceMode ? " low-end" : ""}`}>

      <div className="performance-toggle" role="group" aria-label="Performance mode">
        <span className="performance-label">Performance</span>
        <button
          type="button"
          className={`performance-btn${performanceMode === "auto" ? " is-active" : ""}`}
          onClick={() => handlePerformanceChange("auto")}
        >
          Auto
        </button>
        <button
          type="button"
          className={`performance-btn${performanceMode === "high" ? " is-active" : ""}`}
          onClick={() => handlePerformanceChange("high")}
        >
          High
        </button>
        <button
          type="button"
          className={`performance-btn${performanceMode === "low" ? " is-active" : ""}`}
          onClick={() => handlePerformanceChange("low")}
        >
          Low
        </button>
      </div>

      <PlasmaBackground
        color="#4d8fff"
        speed={0.6}
        direction="forward"
        scale={1.1}
        opacity={1}
        mouseInteractive={shouldUseFullFx}
        lowEnd={useLowPerformanceMode}
        onReady={() => { plasmaReadyRef.current = true; tryStartWarmup(); }}
      />

      {!useLowPerformanceMode && <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />}

      {!isContentReady && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      )}

      <div
        className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-10"
        aria-hidden={!isContentReady}
        style={{ visibility: isContentReady ? "visible" : "hidden" }}
      >
        {/* Hero / Intro Section */}
        <LiquidGlass
          key={`${glassRenderKey}-hero`}
          as="header"
          className="hero-shell mb-24 reveal-up p-8"
          borderRadius={18}
          
          saturation={1.18}
          displace={0.42}
          lowPerformance={useLowPerformanceMode}
          forceSvgFilter={forceHighSvgFilter}
          style={{ "--delay": "80ms" }}
        >
          <h1 className="hero-title">{profile.name}</h1>
          <p className="hero-subtitle">{profile.intro}</p>
        </LiquidGlass>

        {/* Projects Section */}
        <LiquidGlass
          key={`${glassRenderKey}-projects`}
          as="section"
          id="projects"
          className="section-shell reveal-up mb-24"
          borderRadius={14}
          
          saturation={1.18}
          displace={0.42}
          lowPerformance={useLowPerformanceMode}
          forceSvgFilter={forceHighSvgFilter}
          style={{ "--delay": "180ms" }}
        >
          <div className="section-head">
            <div>
              <h2 className="section-title">Projects</h2>
            </div>
            <span className="section-badge">{projects.length} items</span>
          </div>

          <div className="project-grid-fx">
            {projects.map((project, index) => (
              <BorderGlow
                key={`${glassRenderKey}-${project.id ?? index}`}
                disabled={!shouldUseFullFx}
                borderRadius={12}
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                glowColor="40 80 80"
                glowRadius={40}
                glowIntensity={1}
                coneSpread={25}
                className="reveal-up"
                style={{ "--delay": `${280 + index * 120}ms` }}
              >
                <LiquidGlass
                  as="a"
                  href={project.url || "#"}
                  target={project.url && project.url !== "#" ? "_blank" : undefined}
                  rel={project.url && project.url !== "#" ? "noreferrer" : undefined}
                  onClick={(event) => {
                    if (!project.url || project.url === "#") {
                      event.preventDefault();
                      return;
                    }
                    event.preventDefault();
                    window.open(project.url, "_blank", "noopener,noreferrer");
                  }}
                  className="project-card-fx"
                  borderRadius={12}
                  saturation={1.15}
                  displace={0.42}
                  lowPerformance={useLowPerformanceMode}
                  forceSvgFilter={forceHighSvgFilter}
                >
                  {project.previewImage && (
                    <img
                      src={project.previewImage}
                      alt={`${project.title} preview`}
                      className="project-thumb"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="project-label">{project.label}</span>
                  <h3 className="project-title-fx">{project.title}</h3>
                  <p className="project-copy-fx">{project.description}</p>
                  <span className="project-link-fx">Open -&gt;</span>
                </LiquidGlass>
              </BorderGlow>
            ))}
          </div>
        </LiquidGlass>

        {/* Contact / Social Footer */}
        <LiquidGlass
          key={`${glassRenderKey}-contact`}
          as="footer"
          className="contact-shell reveal-up"
          borderRadius={14}
          
          saturation={1.18}
          displace={0.42}
          lowPerformance={useLowPerformanceMode}
          forceSvgFilter={forceHighSvgFilter}
          style={{ "--delay": "420ms" }}
        >
          <div className="contact-content">
            <h2 className="contact-title">Get in touch</h2>
            <p className="contact-copy">One button. All contact channels. Pick whatever is fastest for you.</p>
            <WarpDialog>
              <WarpDialogTrigger asChild>
                <button
                  type="button"
                  className="contact-trigger"
                >
                  Contact me!
                </button>
              </WarpDialogTrigger>
              <WarpDialogContent>
                <WarpOverlayDemo />
              </WarpDialogContent>
            </WarpDialog>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
