import BorderGlow from "../ui/BorderGlow";
import Reveal from "../ui/Reveal";
import { IconArrowUpRight, IconGithub } from "../ui/icons";

// Dlouhé názvy (map_generator_godot) se smí zalomit za podtržítkem nebo pomlčkou.
function breakable(title) {
  const parts = title.split(/(?<=[_-])/);
  return parts.flatMap((part, index) => (index < parts.length - 1 ? [part, <wbr key={index} />] : [part]));
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
  return (
    <a
      className="project-card"
      href={project.url}
      target="_blank"
      rel="noreferrer"
      style={{ "--accent-a": project.accent[0], "--accent-b": project.accent[1] }}
    >
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
        <h3 className="project-card__title">{breakable(project.title)}</h3>
        {project.description && <p className="project-card__desc">{project.description}</p>}
        <div className="project-card__foot">
          <ul className="tag-list" aria-label="Technologie">
            {project.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
          <span className="project-card__open">
            Otevřít <IconArrowUpRight />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Projects({ projects, githubUrl, fullFx }) {
  // Projekt ze showcase nad sekcí se v mřížce neopakuje.
  const gridProjects = projects.filter((project) => !project.showcase);
  const count = String(gridProjects.length).padStart(2, "0");

  return (
    <section className="section" id="projects" aria-labelledby="projects-title">
      <div className="section__shell">
        <Reveal className="section__head">
          <div>
            <span className="kicker">Další projekty · {count}</span>
            <h2 id="projects-title" className="section__title">
              Na čem jsem <span className="dim">makal.</span>
            </h2>
          </div>
          <p className="section__lead">
            Hry v Godotu, weby v JavaScriptu, scrapery a AI experimenty v Pythonu. Karta tě hodí rovnou na GitHub.
          </p>
        </Reveal>

        {projects.length === 0 ? (
          // GitHub neodpověděl a v prohlížeči není ani uložená verze.
          <div className="project-empty">
            <p>Projekty se teď nepodařilo načíst z GitHubu. Najdeš je přímo na mém profilu.</p>
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
