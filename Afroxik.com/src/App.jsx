import { useCallback, useEffect, useRef, useState } from "react";
import { getCachedProjects, getProjects, navSections, profile as profileData, socials, toolbox } from "./lib/content";
import { LangContext, texts } from "./lib/i18n";
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
const LANG_STORAGE_KEY = "afrox-lang";
// Plasma + fonty – teprve pak zmizí preloader. Na GitHub se nečeká, projekty se doplní, až dorazí.
const READY_SIGNALS = 2;

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

// Adresa /en je vždy anglicky, jinak rozhoduje uložená volba a nakonec jazyk prohlížeče.
function readInitialLang() {
  if (/^\/en(\/|$)/.test(window.location.pathname)) return "en";
  try {
    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (storedLang === "cs" || storedLang === "en") return storedLang;
  } catch {
    // Ignore storage issues in private browsing or blocked storage contexts.
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => /^(cs|sk)\b/i.test(language ?? "")) ? "cs" : "en";
}

export default function App() {
  const [performanceMode, setPerformanceMode] = useState(readStoredPerformanceMode);
  const [catEnabled, setCatEnabled] = useState(readStoredCatEnabled);
  const [lang, setLang] = useState(readInitialLang);
  // Hned projekty z minulé návštěvy, čerstvé z GitHubu je pak nahradí.
  const [projects, setProjects] = useState(getCachedProjects);
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
  const activeSection = useActiveSection(navSections);

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

  const handleLangToggle = useCallback(() => {
    const next = lang === "cs" ? "en" : "cs";
    setLang(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage issues in private browsing or blocked storage contexts.
    }
  }, [lang]);

  // Jazyk se propisuje do <html lang>, titulku stránky a adresy (/en pro angličtinu).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = texts[lang].title;
    const path = lang === "en" ? "/en" : "/";
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", `${path}${window.location.search}${window.location.hash}`);
    }
  }, [lang]);

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
    getProjects().then((nextProjects) => {
      if (isMounted) setProjects(nextProjects);
    });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const isContentReady = !isPreloading;
  const t = texts[lang];
  const profile = { ...profileData, ...t.profile };
  const sections = navSections.map((id) => ({ id, label: t.sections[id] }));
  const featured = projects?.find((project) => project.showcase);

  const pageClassName = [
    "fx-page",
    useLowPerformanceMode && "low-end",
    shouldUseFullFx && "fx-full",
    isContentReady && "is-ready",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <LangContext.Provider value={t}>
      <div className={pageClassName}>
        <Preloader progress={0.12 + (readyCount / READY_SIGNALS) * 0.72} done={isContentReady} name="Afrox" />
        <a className="skip-link" href="#projects">
          {t.skipLink}
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
          name={profile.name}
          sections={sections}
          active={activeSection}
          performanceMode={performanceMode}
          onPerformanceChange={handlePerformanceChange}
          catEnabled={catEnabled}
          onCatToggle={handleCatToggle}
          onLangToggle={handleLangToggle}
          onContact={openContact}
        />

        <main className="site-main" id="main">
          <Hero ref={setHeroElement} profile={profile} onContact={openContact} />
          {featured && <Showcase project={featured} lowMotion={lowMotion} />}
          <Projects
            projects={projects}
            githubUrl={socials.find((social) => social.id === "github")?.href}
            fullFx={shouldUseFullFx}
          />
          <About
            profile={profile}
            socials={socials}
            toolbox={toolbox}
            projects={projects ?? []}
            copiedKey={copiedKey}
            onCopy={copy}
            onContact={openContact}
            lowMotion={lowMotion}
          />
          <Contact socials={socials} copiedKey={copiedKey} onCopy={copy} onContact={openContact} />
        </main>

        <SiteFooter
          profile={profile}
          sections={sections}
          projects={projects ?? []}
          socials={socials}
          copiedKey={copiedKey}
          onCopy={copy}
          onContact={openContact}
        />

        {/* Schovaná kočka nezmizí – odletí do loga v navigaci a tancuje tam. */}
        <CatBuddy mode={catMode} animate={!lowMotion} home={!catEnabled} />

        <WarpDialog open={contactOpen} onOpenChange={setContactOpen}>
          <WarpDialogContent title={t.contactMe} description={t.dialog.description}>
            <WarpOverlayDemo socials={socials} copiedKey={copiedKey} onCopy={copy} />
          </WarpDialogContent>
        </WarpDialog>
      </div>
    </LangContext.Provider>
  );
}
