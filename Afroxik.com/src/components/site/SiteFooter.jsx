import { BrandMark, IconArrowUp } from "../ui/icons";

const YEAR = new Date().getFullYear();

// Skleněná patička se svítící linkou nahoře (inspirace Streamally).
export default function SiteFooter({ profile, sections, projects, socials, copiedKey, onCopy, onContact }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="footer-brand">
          <a href="#top" className="brand brand--lg" aria-label={`${profile.name} – zpět nahoru`}>
            <BrandMark className="brand__mark" />
            <span className="brand__name" aria-hidden="true">
              {profile.name}
            </span>
          </a>
          <p className="footer-brand__tagline">{profile.tagline.join(" ")}</p>
        </div>

        <nav className="footer-col" aria-label="Sekce">
          <h2 className="footer-col__title">Navigace</h2>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a className="footer-link" href={`#${section.id}`}>
                  {section.label}
                </a>
              </li>
            ))}
            <li>
              <button type="button" className="footer-link" onClick={onContact}>
                Všechny kontakty
              </button>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Vybrané projekty">
          <h2 className="footer-col__title">Projekty</h2>
          <ul>
            {projects.slice(0, 4).map((project) => (
              <li key={project.id}>
                <a className="footer-link" href={project.url} target="_blank" rel="noreferrer">
                  {project.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Sociální sítě">
          <h2 className="footer-col__title">Sítě</h2>
          <ul>
            {socials.map((social) => (
              <li key={social.id}>
                {social.copy ? (
                  <button
                    type="button"
                    className="footer-link"
                    onClick={() => onCopy(social.copy, `footer-${social.id}`)}
                    aria-label={`${social.label}: ${social.handle} – zkopírovat`}
                  >
                    {copiedKey === `footer-${social.id}` ? "Zkopírováno!" : social.label}
                  </button>
                ) : (
                  <a className="footer-link" href={social.href} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>
          © {YEAR} {profile.name}
        </span>
        <span>Postaveno v Reactu, Vite a WebGL.</span>
        <a href="#top" className="to-top">
          Nahoru <IconArrowUp />
        </a>
      </div>
    </footer>
  );
}
