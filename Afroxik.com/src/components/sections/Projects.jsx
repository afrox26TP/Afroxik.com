import BorderGlow from "../ui/BorderGlow";
import Reveal from "../ui/Reveal";
import { IconArrowUpRight, IconGithub } from "../ui/icons";
import { useT } from "../../lib/i18n";

// Dlouhé názvy (map_generator_godot) se smí zalomit za podtržítkem nebo pomlčkou.
function breakable(title) {
  const parts = title.split(/(?<=[_-])/);
  return parts.flatMap((part, index) => (index < parts.length - 1 ? [part, <wbr key={index} />] : [part]));
}

// Kdy byl projekt naposledy pushnutý, slovy („před 3 dny“, „včera“).
const AGE_UNITS = [
  ["year", 365],
  ["month", 30],
  ["week", 7],
];

function timeAgo(date, locale) {
  const days = (Date.parse(date) - Date.now()) / 86400000;
  const [unit, size] = AGE_UNITS.find(([, size]) => -days >= size) ?? ["day", 1];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(days / size), unit);
}

// Světelný kužel sleduje kurzor nad kartou (inspirace Streamally).
function trackSpotlight(event) {
  const card = event.target.closest?.(".project-card");
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  card.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function ProjectCard({ project }) {
  const t = useT();

  return (
    <article className="project-card" style={{ "--accent-a": project.accent[0], "--accent-b": project.accent[1] }}>
      <span className="project-card__glow" aria-hidden="true" />
      {project.image && (
        <div className="project-card__media">
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
          />
        </div>
      )}
      <div className="project-card__body">
        <span className="project-card__repo">
          <IconGithub />
          <span className="project-card__repo-name">{project.repo}</span>
          <span className="project-card__year">{project.year}</span>
        </span>
        <h3 className="project-card__title">
          {/* Odkaz na GitHub pokrývá přes ::after celou kartu, tlačítko Web leží nad ním. */}
          <a className="project-card__link" href={project.url} target="_blank" rel="noreferrer">
            {breakable(project.title)}
          </a>
        </h3>
        {project.description && <p className="project-card__desc">{project.description}</p>}
        {project.pushedAt && (
          <time className="project-card__updated" dateTime={project.pushedAt}>
            {t.projects.updated} {timeAgo(project.pushedAt, t.locale)}
          </time>
        )}
        <div className="project-card__foot">
          <ul className="tag-list" aria-label={t.tech}>
            {project.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          {project.homepage && (
            <a
              className="project-card__web"
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} – ${t.projects.web}`}
            >
              {t.projects.web} <IconArrowUpRight />
            </a>
          )}
          <span className="project-card__open" aria-hidden="true">
            {t.projects.open} <IconArrowUpRight />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Projects({ projects, githubUrl, fullFx }) {
  const t = useT();
  // Projekt ze showcase nad sekcí se v mřížce neopakuje. Dokud nedorazí GitHub (null), je mřížka prázdná.
  const gridProjects = (projects ?? []).filter((project) => !project.showcase);
  const count = String(gridProjects.length).padStart(2, "0");

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="section__shell">
        <Reveal className="section__head">
          <div>
            <span className="kicker">
              {t.projects.kicker} · {count}
            </span>
            <h2 id="projects-title" className="section__title">
              {t.projects.title[0]} <span className="dim">{t.projects.title[1]}</span>
            </h2>
          </div>
          <p className="section__lead">{t.projects.lead}</p>
        </Reveal>

        {projects?.length === 0 ? (
          // GitHub neodpověděl a v prohlížeči není ani uložená verze.
          <div className="project-empty">
            <p>{t.projects.empty}</p>
            <a className="btn-ghost" href={githubUrl} target="_blank" rel="noreferrer">
              <IconGithub /> GitHub <IconArrowUpRight />
            </a>
          </div>
        ) : (
          <div className="project-grid" onPointerMove={fullFx ? trackSpotlight : undefined}>
            {gridProjects.map((project, index) => (
              <Reveal key={project.id} mode="self" className="project-cell" style={{ "--delay": `${(index % 3) * 90}ms` }}>
                <BorderGlow
                  disabled={!fullFx}
                  borderRadius={20}
                  colors={project.accent}
                  glowColor="212 100 72"
                  glowRadius={36}
                  glowIntensity={0.85}
                  coneSpread={25}
                  className="project-glow"
                >
                  <ProjectCard project={project} />
                </BorderGlow>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
