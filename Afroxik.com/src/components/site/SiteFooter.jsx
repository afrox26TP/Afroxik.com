import { BrandMark, IconArrowUp } from "../ui/icons";
import { useT } from "../../lib/i18n";

const YEAR = new Date().getFullYear();

// Skleněná patička se svítící linkou nahoře (inspirace Streamally).
export default function SiteFooter({ profile, sections, projects, socials, copiedKey, onCopy, onContact }) {
  const t = useT();

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="footer-brand">
          <a href="#top" className="brand brand--lg" aria-label={`${profile.name} – ${t.backToTop}`}>
            <BrandMark className="brand__mark" />
            <span className="brand__name" aria-hidden="true">
              {profile.name}
            </span>
          </a>
          <p className="footer-brand__tagline">{profile.tagline.join(" ")}</p>
        </div>

        <nav className="footer-col" aria-label={t.footer.sections}>
          <h2 className="footer-col__title">{t.footer.navigation}</h2>
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
                {t.allContacts}
              </button>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label={t.footer.projects}>
          <h2 className="footer-col__title">{t.sections.projects}</h2>
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

        <nav className="footer-col" aria-label={t.footer.socialsLabel}>
          <h2 className="footer-col__title">{t.footer.socials}</h2>
          <ul>
            {socials.map((social) => (
              <li key={social.id}>
                {social.copy ? (
                  <button
                    type="button"
                    className="footer-link"
                    onClick={() => onCopy(social.copy, `footer-${social.id}`)}
                    aria-label={`${social.label}: ${social.handle} – ${t.copy}`}
                  >
                    {copiedKey === `footer-${social.id}` ? t.copied : social.label}
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
        <span>{t.footer.built}</span>
        <a href="#top" className="to-top">
          {t.footer.toTop} <IconArrowUp />
        </a>
      </div>
    </footer>
  );
}
