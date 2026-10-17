import Reveal from "../ui/Reveal";
import { IconArrowUpRight, IconDiscord, IconGithub } from "../ui/icons";
import { useT } from "../../lib/i18n";

// Velký Discord handle, který se po kliknutí zkopíruje (inspirace e-mailem na Lepshee).
export default function Contact({ socials, copiedKey, onCopy, onContact }) {
  const t = useT();
  const discord = socials.find((social) => social.id === "discord");
  const github = socials.find((social) => social.id === "github");
  const copied = copiedKey === "contact-discord";

  return (
    <section className="section section--hairline contact" id="contact" aria-labelledby="contact-title">
      <div className="section__shell">
        <Reveal className="contact__inner">
          <span className="kicker">{t.sections.contact}</span>
          <h2 id="contact-title" className="section__title contact__title">
            {t.contact.title[0]} <span className="dim">{t.contact.title[1]}</span>
          </h2>

          {discord && (
            <div className={`copy-handle${copied ? " is-copied" : ""}`}>
              <span className="copy-handle__label">
                <IconDiscord /> {t.contact.discord}
              </span>
              <button
                type="button"
                className="copy-handle__value"
                onClick={() => onCopy(discord.copy, "contact-discord")}
                aria-label={`${t.contact.copyDiscord}: ${discord.handle}`}
              >
                {discord.handle}
              </button>
              <span className="copy-tooltip" role="status">
                {copied ? t.copied : ""}
              </span>
            </div>
          )}

          <div className="contact__actions">
            <button type="button" className="btn-colorful" onClick={onContact}>
              {t.allContacts}
            </button>
            {github && (
              <a className="btn-ghost" href={github.href} target="_blank" rel="noreferrer">
                <IconGithub /> GitHub <IconArrowUpRight />
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
