import Reveal from "../ui/Reveal";
import { IconArrowUpRight, IconDiscord, IconGithub } from "../ui/icons";

// Velký Discord handle, který se po kliknutí zkopíruje (inspirace e-mailem na Lepshee).
export default function Contact({ socials, copiedKey, onCopy, onContact }) {
  const discord = socials.find((social) => social.id === "discord");
  const github = socials.find((social) => social.id === "github");
  const copied = copiedKey === "contact-discord";

  return (
    <section className="section section--hairline contact" id="contact" aria-labelledby="contact-title">
      <div className="section__shell">
        <Reveal className="contact__inner">
          <span className="kicker">Kontakt</span>
          <h2 id="contact-title" className="section__title contact__title">
            Ozvi se. <span className="dim">Jedno tlačítko, všechny kanály.</span>
          </h2>

          {discord && (
            <div className={`copy-handle${copied ? " is-copied" : ""}`}>
              <span className="copy-handle__label">
                <IconDiscord /> Discord · klikni a zkopíruj
              </span>
              <button
                type="button"
                className="copy-handle__value"
                onClick={() => onCopy(discord.copy, "contact-discord")}
                aria-label={`Zkopírovat Discord: ${discord.handle}`}
              >
                {discord.handle}
              </button>
              <span className="copy-tooltip" role="status">
                {copied ? "Zkopírováno!" : ""}
              </span>
            </div>
          )}

          <div className="contact__actions">
            <button type="button" className="btn-colorful" onClick={onContact}>
              Všechny kontakty
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
