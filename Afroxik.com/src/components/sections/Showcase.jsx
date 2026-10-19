import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrandMark,
  IconArrowUpRight,
  IconBattery,
  IconClose,
  IconGamepad,
  IconGithub,
  IconMaximize,
  IconMinimize,
  IconPlay,
  IconVolume,
  IconWifi,
} from "../ui/icons";
import MetalLayer from "../ui/MetalLayer";
import { useT } from "../../lib/i18n";

const OPEN_START = 0.62;
const OPEN_END = 0.08;

// Ikona aplikace z exportu hry; když chybí, je místo ní herní ovladač.
function AppIcon({ src, className }) {
  if (!src) return <IconGamepad className={className} />;
  return <img className={className} src={src} alt="" width="128" height="128" draggable="false" />;
}

// Hodiny v hlavním panelu ukazují skutečný čas a datum, přepínají se vždy na celou minutu.
function TaskbarClock({ locale }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60000 - (Date.now() % 60000));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className="taskbar__clock">
      <span>{now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span>
      <span>{now.toLocaleDateString(locale, { day: "numeric", month: "numeric", year: "numeric" })}</span>
    </span>
  );
}

// Hlavní projekt na displeji 3D notebooku: zavřený notebook se při scrollu otevře a pohled srovná (inspirace Streamally).
// Displej je plocha Windows 11 – maximalizované okno se screenshotem nebo hrou a dole hlavní panel s odkazem na GitHub.
// Po kliknutí na ▶ se místo screenshotu spustí hra v iframe (stejná doména, /play/); na mobilu se otevře zvlášť.
// Stav hry drží App (vypíná při hraní efekty pozadí), proto `playing` + `onPlayingChange`.
export default function Showcase({ project, lowMotion, embed = false, playing = false, onPlayingChange }) {
  const t = useT();
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const screenRef = useRef(null);
  const appButtonRef = useRef(null);
  const [minimized, setMinimized] = useState(false);
  const { showcase } = project;
  const canEmbed = embed && Boolean(showcase.play) && Boolean(onPlayingChange);
  const appName = showcase.app ?? project.title;

  const startGame = useCallback(() => {
    setMinimized(false);
    onPlayingChange(true);
    screenRef.current?.scrollIntoView({ block: "center", behavior: lowMotion ? "instant" : "smooth" });
  }, [onPlayingChange, lowMotion]);

  const stopGame = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    onPlayingChange(false);
  }, [onPlayingChange]);

  const goFullscreen = useCallback(() => {
    screenRef.current?.requestFullscreen?.();
  }, []);

  // — schová okno do hlavního panelu (běžící hru zavře) a fokus přesune na jeho ikonu.
  const minimize = useCallback(() => {
    if (playing) stopGame();
    setMinimized(true);
    requestAnimationFrame(() => appButtonRef.current?.focus());
  }, [playing, stopGame]);

  // ☐ = celá obrazovka; když hra neběží, rovnou ji spustí. Bez vložené hry (mobil) ji otevře v nové záložce.
  const maximize = useCallback(() => {
    if (canEmbed) {
      if (!playing) startGame();
      goFullscreen();
    } else if (showcase.play) {
      window.open(showcase.play, "_blank", "noopener");
    }
  }, [canEmbed, playing, startGame, goFullscreen, showcase.play]);

  // ✕ zavře běžící hru, jinak zavře okno na plochu.
  const close = useCallback(() => {
    if (playing) stopGame();
    else minimize();
  }, [playing, stopGame, minimize]);

  const toggleWindow = useCallback(() => {
    if (minimized) setMinimized(false);
    else minimize();
  }, [minimized, minimize]);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return undefined;

    if (lowMotion || typeof IntersectionObserver === "undefined") {
      card.style.setProperty("--p", "1");
      return undefined;
    }

    let raf = 0;
    let listening = false;

    // Zavřený notebook se nejdřív celý vynoří; víko se otevírá, až když horní hrana sekce jede z OPEN_START
    // do OPEN_END výšky okna (smoothstep, ať se pant rozjede i dobrzdí plynule).
    const update = () => {
      raf = 0;
      const viewport = window.innerHeight || 1;
      const raw = (viewport * OPEN_START - section.getBoundingClientRect().top) / (viewport * (OPEN_START - OPEN_END));
      const progress = Math.min(1, Math.max(0, raw));
      const eased = progress * progress * (3 - 2 * progress);
      card.style.setProperty("--p", eased.toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("scroll", schedule, { passive: true });
      window[method]("resize", schedule);
    };

    const observer = new IntersectionObserver(([entry]) => {
      listen(entry.isIntersecting);
      if (entry.isIntersecting) schedule();
    });
    observer.observe(section);
    update();

    return () => {
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(raf);
    };
  }, [lowMotion]);

  return (
    <section ref={sectionRef} className="showcase" aria-labelledby="showcase-title">
      <div className="showcase__persp">
        {/* Obal se měří pro náklon za kurzorem (lib/pointer3d.js); při hraní se notebook nenaklání. */}
        <div className="showcase__stage" data-tilt={playing ? undefined : "3"}>
          {/* 3D notebook: víko se při scrollu otevírá (--p), na displeji je plocha Windows s oknem hry. */}
          <div ref={cardRef} className={`laptop${playing ? " is-playing" : ""}`}>
            <div className="laptop__lid">
              <div className="laptop__face">
                <span className="laptop__camera" aria-hidden="true" />
                <div className={`desktop${minimized ? " is-minimized" : ""}`}>
                  {/* Zástupce hry na ploše – vidět je, když je okno zavřené nebo minimalizované. */}
                  <button
                    type="button"
                    className="desktop__shortcut"
                    onClick={() => setMinimized(false)}
                    aria-label={`${appName} – ${t.showcase.openWindow}`}
                    inert={!minimized}
                  >
                    <AppIcon src={showcase.icon} className="desktop__shortcut-icon" />
                    <span>{appName}</span>
                  </button>

                  <div className="win" inert={minimized}>
                    <div className="win__titlebar">
                      <span className="win__title">
                        <AppIcon src={showcase.icon} className="win__icon" />
                        <span className="win__name">{appName}</span>
                      </span>
                      <span className="win__controls">
                        <button
                          type="button"
                          className="win__control"
                          onClick={minimize}
                          aria-label={t.showcase.minimize}
                          title={t.showcase.minimize}
                        >
                          <IconMinimize />
                        </button>
                        <button
                          type="button"
                          className="win__control"
                          onClick={maximize}
                          aria-label={t.showcase.fullscreen}
                          title={t.showcase.fullscreen}
                        >
                          <IconMaximize />
                        </button>
                        <button
                          type="button"
                          className="win__control win__control--close"
                          onClick={close}
                          aria-label={playing ? `${t.showcase.close} ${t.showcase.closeLabel}` : t.showcase.close}
                          title={t.showcase.close}
                        >
                          <IconClose />
                        </button>
                      </span>
                    </div>
                    <div ref={screenRef} className={`showcase__screen${playing ? " is-playing" : ""}`}>
                      {playing ? (
                        <iframe
                          className="showcase__game"
                          src={showcase.play}
                          title={t.showcase.frameTitle}
                          allow="fullscreen; autoplay"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <img
                            src={showcase.src}
                            srcSet={showcase.srcSet}
                            sizes="(min-width: 1140px) 1060px, 94vw"
                            width={showcase.width}
                            height={showcase.height}
                            alt={`${project.title} – ${t.showcase.screenshot}`}
                            fetchPriority="high"
                            decoding="async"
                          />
                          {canEmbed && (
                            <button type="button" className="showcase__start" onClick={startGame} aria-label={t.showcase.start}>
                              <span className="showcase__start-pill liquid liquid--glass">
                                <span className="showcase__start-icon liquid liquid--drop">
                                  <IconPlay />
                                </span>
                                {t.showcase.start}
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="taskbar">
                    <span className="taskbar__apps">
                      <span className="taskbar__item taskbar__start" aria-hidden="true">
                        <BrandMark />
                      </span>
                      <button
                        ref={appButtonRef}
                        type="button"
                        className={`taskbar__item${minimized ? "" : " is-open"}${playing ? " is-active" : ""}`}
                        onClick={toggleWindow}
                        aria-label={`${appName} – ${minimized ? t.showcase.openWindow : t.showcase.minimize}`}
                        title={appName}
                      >
                        <AppIcon src={showcase.icon} />
                      </button>
                      <a
                        className="taskbar__item"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${t.showcase.github} – ${project.repo}`}
                        title={t.showcase.github}
                      >
                        <IconGithub />
                      </a>
                    </span>
                    <span className="taskbar__tray" aria-hidden="true">
                      <IconWifi />
                      <IconVolume />
                      <IconBattery />
                      <TaskbarClock locale={t.locale} />
                    </span>
                  </div>
                </div>
                <span className="laptop__label" aria-hidden="true">
                  Afrox
                </span>
              </div>
              <div className="laptop__cover" aria-hidden="true">
                <BrandMark className="laptop__logo" />
              </div>
            </div>
            <div className="laptop__base" aria-hidden="true">
              <span className="laptop__keyboard" />
              <span className="laptop__trackpad" />
            </div>
          </div>
        </div>

        <div className="showcase__caption">
          <div>
            <span className="kicker kicker--accent">{t.showcase.kicker}</span>
            <h2 id="showcase-title" className="showcase__title">
              {project.title}
            </h2>
            {project.description && <p className="showcase__desc">{project.description}</p>}
            {showcase.play && (
              <div className="showcase__actions">
                {canEmbed ? (
                  <button type="button" className="pill-button metal-pill" onClick={playing ? stopGame : startGame}>
                    <MetalLayer still={lowMotion} />
                    <span className="metal-pill__core">
                      <span className="pill-button__chip metal-ink">{playing ? t.showcase.close : t.showcase.play.chip}</span>
                      <span className="pill-button__label">{playing ? t.showcase.closeLabel : t.showcase.play.label}</span>
                      {playing ? <IconClose className="pill-button__arrow" /> : <IconPlay className="pill-button__arrow" />}
                    </span>
                  </button>
                ) : (
                  <a className="pill-button metal-pill" href={showcase.play} target="_blank" rel="noreferrer">
                    <MetalLayer still={lowMotion} />
                    <span className="metal-pill__core">
                      <span className="pill-button__chip metal-ink">{t.showcase.play.chip}</span>
                      <span className="pill-button__label">{t.showcase.play.label}</span>
                      <IconArrowUpRight className="pill-button__arrow" />
                    </span>
                  </a>
                )}
                <small className="showcase__note">
                  {canEmbed ? t.showcase.noteEmbed : t.showcase.noteTab}
                  {canEmbed && (
                    <>
                      {" "}
                      <a className="showcase__newtab" href={showcase.play} target="_blank" rel="noreferrer">
                        {t.showcase.newWindow} <IconArrowUpRight />
                      </a>
                    </>
                  )}
                </small>
              </div>
            )}
          </div>
          <ul className="tag-list" aria-label={t.tech} style={{ "--accent-a": project.accent[0] }}>
            {project.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
