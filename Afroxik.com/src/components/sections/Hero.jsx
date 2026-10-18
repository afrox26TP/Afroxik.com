import { IconArrowRight } from "../ui/icons";
import { useT } from "../../lib/i18n";

export default function Hero({ ref, profile, onContact }) {
  const t = useT();

  return (
    <section ref={ref} className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__inner">
        <span className="kicker kicker--accent hero__kicker">{profile.role}</span>

        <div className="hero__title-wrap">
          <h1 id="hero-title" className="hero__name">
            {profile.name}
          </h1>
          <div className="hero__tags" aria-hidden="true">
            {profile.heroTags.map((tag, index) => (
              <span key={tag} className={`hero-tag hero-tag--${index + 1}`}>
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <p className="hero__lead">
          {profile.tagline[0]} <span className="dim">{profile.tagline[1]}</span>
        </p>

        <p className="hero__status">
          <span className="hero__prompt" aria-hidden="true">
            &gt;
          </span>
          <span>
            {profile.intro}
            <span className="hero__caret" aria-hidden="true" />
          </span>
        </p>

        <div className="hero__actions">
          <a className="pill-button pill-button--blue liquid liquid--glass" href="#projects">
            <span className="pill-button__chip liquid liquid--metal">{t.sections.projects}</span>
            <span className="pill-button__label">{t.hero.projects}</span>
            <IconArrowRight className="pill-button__arrow" />
          </a>
          <button type="button" className="pill-button pill-button--violet liquid liquid--glass" onClick={onContact}>
            <span className="pill-button__chip liquid liquid--metal">{t.sections.contact}</span>
            <span className="pill-button__label">{t.hero.contact}</span>
            <IconArrowRight className="pill-button__arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}
