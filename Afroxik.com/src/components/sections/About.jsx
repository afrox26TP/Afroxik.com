import Reveal from "../ui/Reveal";
import { IconArrowRight, IconCheck, IconGamepad, IconGithub, socialIcons } from "../ui/icons";

function HudStage({ tag, glyph }) {
  return (
    <div className="hud-card__stage" aria-hidden="true">
      <div className="hud-card__glow" />
      <div className="hud-card__scan" />
      <span className="hud-card__tag">{tag}</span>
      <div className="hud-card__frame">
        <i className="hud-card__corner hud-card__corner--tl" />
        <i className="hud-card__corner hud-card__corner--tr" />
        <i className="hud-card__corner hud-card__corner--bl" />
        <i className="hud-card__corner hud-card__corner--br" />
        <span className="hud-card__mono">{glyph}</span>
      </div>
    </div>
  );
}

// Sekce „O mně“ – herní HUD karty (inspirace karty zakladatelů na Streamally) a toolbox (inspirace Komunita).
export default function About({ profile, socials, toolbox, projects, copiedKey, onCopy, onContact }) {
  const stats = [
    { value: String(projects.length).padStart(2, "0"), label: "projektů v portfoliu" },
    { value: String(toolbox.length).padStart(2, "0"), label: "nástrojů v toolboxu" },
    { value: String(profile.githubSince), label: "na GitHubu od roku" },
  ];

  return (
    <section className="section section--hairline" id="about" aria-labelledby="about-title">
      <div className="section__shell">
        <Reveal className="section__head section__head--center">
          <span className="kicker">O mně</span>
          <h2 id="about-title" className="section__title">
            Kdo za tím <span className="glow">stojí.</span>
          </h2>
        </Reveal>

        <div className="about-grid">
          <Reveal mode="self">
            <article className="hud-card">
              <HudStage tag="player_01" glyph={profile.name.charAt(0)} />
              <div className="hud-card__body">
                <span className="hud-card__role">{profile.role}</span>
                <h3 className="hud-card__name">{profile.name}</h3>
                <p className="hud-card__meta">
                  <IconGithub /> @{profile.handle}
                </p>
                <p className="hud-card__bio">{profile.bio}</p>
                <div className="hud-card__socials">
                  {socials.map((social) => {
                    const Icon = socialIcons[social.id];
                    if (social.copy) {
                      const copied = copiedKey === `about-${social.id}`;
                      return (
                        <button
                          key={social.id}
                          type="button"
                          className={`icon-btn${copied ? " is-copied" : ""}`}
                          onClick={() => onCopy(social.copy, `about-${social.id}`)}
                          aria-label={`${social.label}: ${social.handle} – zkopírovat`}
                          title={copied ? "Zkopírováno!" : `${social.label}: ${social.handle}`}
                        >
                          {copied ? <IconCheck /> : <Icon />}
                        </button>
                      );
                    }
                    return (
                      <a
                        key={social.id}
                        className="icon-btn"
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${social.label}: ${social.handle}`}
                        title={`${social.label}: ${social.handle}`}
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal mode="self" style={{ "--delay": "90ms" }}>
            <article className="hud-card hud-card--join">
              <HudStage tag="player_02 · ty?" glyph="?" />
              <div className="hud-card__body">
                <span className="hud-card__role">Volný slot</span>
                <h3 className="hud-card__name">Pojď do party</h3>
                <p className="hud-card__meta">
                  <IconGamepad /> Hry · Weby · AI
                </p>
                <p className="hud-card__bio">
                  Máš nápad na hru, web nebo AI bota? Nebo chceš jen probrat projekt? Napiš mi.
                </p>
                <button type="button" className="text-cta" onClick={onContact}>
                  Napsat zprávu <IconArrowRight />
                </button>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal as="dl" className="stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <dt className="stat__label">{stat.label}</dt>
              <dd className="stat__value">{stat.value}</dd>
            </div>
          ))}
        </Reveal>

        <Reveal className="toolbox">
          <div className="toolbox__head">
            <span className="kicker">Toolbox</span>
            <p className="toolbox__copy">Jazyky a nástroje, které se v mých projektech točí nejvíc.</p>
          </div>
          <ul className="toolbox__list">
            {toolbox.map((tool, index) => (
              <li key={tool} className="tool-pill" style={{ "--i": index }}>
                {tool}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
