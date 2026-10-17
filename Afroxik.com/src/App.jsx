import { useCallback, useEffect, useRef, useState } from "react";
import { getPageData, navSections } from "./lib/content";
import { IS_LOW_END, PREFERS_REDUCED_MOTION } from "./lib/device";
import { useParticles } from "./hooks/useParticles";
import { useCopy } from "./hooks/useCopy";
import { useInView } from "./hooks/useInView";
import { useActiveSection } from "./hooks/useActiveSection";
import PlasmaBackground from "./components/PlasmaBackground";
import Preloader from "./components/site/Preloader";
import ScrollProgress from "./components/site/ScrollProgress";
import SiteNav from "./components/site/SiteNav";
import SiteFooter from "./components/site/SiteFooter";
import CatBuddy from "./components/site/CatBuddy";
import Hero from "./components/sections/Hero";
import Showcase from "./components/sections/Showcase";
import Projects from "./components/sections/Projects";
import About from "./components/sections/About";
import Contact from "./components/sections/Contact";
import { WarpDialog, WarpDialogContent } from "@/components/molecule-ui/warp-dialog";
import { WarpOverlayDemo } from "./components/molecule-ui/WarpOverlayDemo";

const PERFORMANCE_STORAGE_KEY = "afrox-performance-mode";
const CAT_STORAGE_KEY = "afrox-cat";
const SECTION_IDS = navSections.map((section) => section.id);
// Plasma + fonty + data – teprve pak zmizí preloader.
const READY_SIGNALS = 3;

function readStoredPerformanceMode() {
  try {
    const storedMode = window.localStorage.getItem(PERFORMANCE_STORAGE_KEY);
    return storedMode === "auto" || storedMode === "high" || storedMode === "low" ? storedMode : "auto";
  } catch {
    return "auto";
  }
}

function readStoredCatEnabled() {
  try {
    return window.localStorage.getItem(CAT_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export default function App() {
  const [performanceMode, setPerformanceMode] = useState(readStoredPerformanceMode);
  const [catEnabled, setCatEnabled] = useState(readStoredCatEnabled);
  const [data, setData] = useState(null);
  const [readyCount, setReadyCount] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [heroElement, setHeroElement] = useState(null);
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 900 : false,
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)").matches
      : false,
  );
  const readySignalsRef = useRef(new Set());
  const warmupTimerRef = useRef(null);
  const canvasRef = useRef(null);

  const [copiedKey, copy] = useCopy();
  const heroInView = useInView(heroElement);
  const activeSection = useActiveSection(SECTION_IDS, Boolean(data));

  useEffect(() => {
    const updateViewport = () => setIsCompactViewport(window.innerWidth < 900);
    const pointerMedia = typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)") : null;
    const updatePointer = () => setIsCoarsePointer(Boolean(pointerMedia?.matches));

    window.addEventListener("resize", updateViewport, { passive: true });
    pointerMedia?.addEventListener("change", updatePointer);
    return () => {
      window.removeEventListener("resize", updateViewport);
      pointerMedia?.removeEventListener("change", updatePointer);
    };
  }, []);

  const useLowPerformanceMode =
    performanceMode === "low" ? true : performanceMode === "high" ? false : IS_LOW_END;
  const shouldUseFullFx = !useLowPerformanceMode && !isCompactViewport && !isCoarsePointer;
  const lowMotion = PREFERS_REDUCED_MOTION || useLowPerformanceMode;

  const handlePerformanceChange = useCallback((nextMode) => {
    setPerformanceMode(nextMode);
    try {
      window.localStorage.setItem(PERFORMANCE_STORAGE_KEY, nextMode);
    } catch {
      // Ignore storage issues in private browsing or blocked storage contexts.
    }
  }, []);

  const handleCatToggle = useCallback(() => {
    const next = !catEnabled;
    setCatEnabled(next);
    try {
      window.localStorage.setItem(CAT_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Ignore storage issues in private browsing or blocked storage contexts.
    }
  }, [catEnabled]);

  // Kočka létá za myší jen na počítači s plnými efekty, jinak sedí na nápisu nebo v rohu.
  const catMode = shouldUseFullFx && !PREFERS_REDUCED_MOTION ? "follow" : "dock";

  // Každý signál se započítá jen jednou (StrictMode spouští efekty dvakrát).
  const markReady = useCallback((signal) => {
    const signals = readySignalsRef.current;
    if (signals.has(signal)) return;
    signals.add(signal);
    setReadyCount(signals.size);
    if (signals.size === READY_SIGNALS && warmupTimerRef.current === null) {
      // Krátký warmup, ať shader stihne naběhnout před odkrytím stránky.
      warmupTimerRef.current = window.setTimeout(() => setIsPreloading(false), 1000);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPageData().then((nextData) => {
      if (!isMounted) return;
      setData(nextData);
      markReady("data");
    });
    return () => {
      isMounted = false;
    };
  }, [markReady]);

  useEffect(() => {
    const fontsReady = document.fonts?.ready;
    const done = () => markReady("fonts");
    if (fontsReady && typeof fontsReady.then === "function") fontsReady.then(done, done);
    else Promise.resolve().then(done);

    // Pojistka: po 4 s stránku odkryjeme v každém případě.
    const fallback = window.setTimeout(() => setIsPreloading(false), 4000);
    return () => {
      window.clearTimeout(fallback);
      if (warmupTimerRef.current !== null) {
        window.clearTimeout(warmupTimerRef.current);
        warmupTimerRef.current = null;
      }
    };
  }, [markReady]);

  const handlePlasmaReady = useCallback(() => markReady("plasma"), [markReady]);
  const openContact = useCallback(() => setContactOpen(true), []);

  useParticles(canvasRef, useLowPerformanceMode);

  const isContentReady = !isPreloading && Boolean(data);
  const profile = data?.profile;
  const featured = data?.projects.find((project) => project.showcase);

  const pageClassName = [
    "fx-page",
    useLowPerformanceMode && "low-end",
    shouldUseFullFx && "fx-full",
    isContentReady && "is-ready",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClassName}>
      <Preloader progress={0.12 + (readyCount / READY_SIGNALS) * 0.72} done={isContentReady} name="Afrox" />
      <a className="skip-link" href="#projects">
        Přeskočit na projekty
      </a>

      <PlasmaBackground
        color="#4d8fff"
        speed={0.6}
        direction="forward"
        scale={1.1}
        opacity={1}
        mouseInteractive={shouldUseFullFx}
        lowEnd={useLowPerformanceMode}
        paused={!heroInView}
        onReady={handlePlasmaReady}
      />
      <div className="page-backdrop" aria-hidden="true" />
      {!useLowPerformanceMode && <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />}
      <ScrollProgress />

      <SiteNav
        name={profile?.name ?? "Afrox"}
        sections={navSections}
        active={activeSection}
        performanceMode={performanceMode}
        onPerformanceChange={handlePerformanceChange}
        catEnabled={catEnabled}
        onCatToggle={handleCatToggle}
        onContact={openContact}
      />

      {data && (
        <>
          <main className="site-main" id="main">
            <Hero ref={setHeroElement} profile={profile} onContact={openContact} />
            {featured && <Showcase project={featured} lowMotion={lowMotion} />}
            <Projects projects={data.projects} fullFx={shouldUseFullFx} />
            <About
              profile={profile}
              socials={data.socials}
              toolbox={data.toolbox}
              projects={data.projects}
              copiedKey={copiedKey}
              onCopy={copy}
              onContact={openContact}
            />
            <Contact socials={data.socials} copiedKey={copiedKey} onCopy={copy} onContact={openContact} />
          </main>

          <SiteFooter
            profile={profile}
            sections={navSections}
            projects={data.projects}
            socials={data.socials}
            copiedKey={copiedKey}
            onCopy={copy}
            onContact={openContact}
          />

          {catEnabled && <CatBuddy mode={catMode} animate={!lowMotion} />}

          <WarpDialog open={contactOpen} onOpenChange={setContactOpen}>
            <WarpDialogContent>
              <WarpOverlayDemo socials={data.socials} copiedKey={copiedKey} onCopy={copy} />
            </WarpDialogContent>
          </WarpDialog>
        </>
      )}
    </div>
  );
}
