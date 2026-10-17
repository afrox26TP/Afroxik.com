import { IconArrowRight } from "../ui/icons";

export default function Hero({ ref, profile, onContact }) {
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
          <a className="pill-button pill-button--blue" href="#projects">
            <span className="pill-button__chip">Projekty</span>
            <span className="pill-button__label">mrkni, co stavím</span>
            <IconArrowRight className="pill-button__arrow" />
          </a>
          <button type="button" className="pill-button pill-button--violet" onClick={onContact}>
            <span className="pill-button__chip">Kontakt</span>
            <span className="pill-button__label">napiš mi</span>
            <IconArrowRight className="pill-button__arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}
