import { useEffect, useRef } from "react";
import { IconArrowUpRight } from "../ui/icons";
import { useT } from "../../lib/i18n";

// Screenshot hlavního projektu, který se při scrollu „narovná“ ze 3D náklonu (inspirace Streamally).
export default function Showcase({ project, lowMotion }) {
  const t = useT();
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const { showcase } = project;

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
            <span className="showcase__path">{project.repo}</span>
            <a className="showcase__open" href={project.url} target="_blank" rel="noreferrer">
              GitHub <IconArrowUpRight />
            </a>
          </div>
          <div className="showcase__screen">
            <img
              src={showcase.src}
              srcSet={showcase.srcSet}
              sizes="(min-width: 1140px) 1060px, 94vw"
              width={showcase.width}
              height={showcase.height}
              alt={`${project.title} – ${t.showcase.screenshot}`}
              decoding="async"
            />
          </div>
        </div>

        <div className="showcase__caption">
          <div>
            <span className="kicker kicker--accent">{t.showcase.kicker}</span>
            <h2 id="showcase-title" className="showcase__title">
              {project.title}
            </h2>
            {project.description && <p className="showcase__desc">{project.description}</p>}
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
