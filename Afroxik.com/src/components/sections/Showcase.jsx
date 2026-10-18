import { useCallback, useEffect, useRef } from "react";
import { IconArrowUpRight, IconClose, IconExpand, IconPlay } from "../ui/icons";
import { useT } from "../../lib/i18n";

// Screenshot hlavního projektu, který se při scrollu „narovná“ ze 3D náklonu (inspirace Streamally).
// Po kliknutí na ▶ se místo screenshotu spustí hra v iframe (stejná doména, /play/); na mobilu se otevře zvlášť.
// Stav hry drží App (vypíná při hraní efekty pozadí), proto `playing` + `onPlayingChange`.
export default function Showcase({ project, lowMotion, embed = false, playing = false, onPlayingChange }) {
  const t = useT();
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const screenRef = useRef(null);
  const { showcase } = project;
  const canEmbed = embed && Boolean(showcase.play) && Boolean(onPlayingChange);

  const startGame = useCallback(() => {
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

    const update = () => {
      raf = 0;
      const viewport = window.innerHeight || 1;
      const raw = (viewport - section.getBoundingClientRect().top) / (viewport * 0.7);
      const progress = Math.min(1, Math.max(0, raw));
      const eased = 1 - (1 - progress) ** 3;
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
        <div ref={cardRef} className="showcase__card">
          <div className="showcase__bar">
            <span className="showcase__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="showcase__path">{playing ? showcase.play : project.repo}</span>
            {playing && (
              <>
                <button type="button" className="showcase__open" onClick={goFullscreen}>
                  <IconExpand /> {t.showcase.fullscreen}
                </button>
                <button type="button" className="showcase__open" onClick={stopGame}>
                  <IconClose /> {t.showcase.close}
                </button>
              </>
            )}
            <a className="showcase__open" href={project.url} target="_blank" rel="noreferrer">
              GitHub <IconArrowUpRight />
            </a>
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
                    <span className="showcase__start-pill">
                      <IconPlay /> {t.showcase.start}
                    </span>
                  </button>
                )}
              </>
            )}
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
                  <button type="button" className="pill-button pill-button--blue" onClick={playing ? stopGame : startGame}>
                    <span className="pill-button__chip">{playing ? t.showcase.close : t.showcase.play.chip}</span>
                    <span className="pill-button__label">{playing ? t.showcase.closeLabel : t.showcase.play.label}</span>
                    {playing ? <IconClose className="pill-button__arrow" /> : <IconPlay className="pill-button__arrow" />}
                  </button>
                ) : (
                  <a className="pill-button pill-button--blue" href={showcase.play} target="_blank" rel="noreferrer">
                    <span className="pill-button__chip">{t.showcase.play.chip}</span>
                    <span className="pill-button__label">{t.showcase.play.label}</span>
                    <IconArrowUpRight className="pill-button__arrow" />
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
