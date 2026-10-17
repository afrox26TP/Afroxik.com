import { IconArrowUpRight, IconCheck, IconCopy, socialIcons } from "../ui/icons";
import { useT } from "../../lib/i18n";

export function WarpOverlayDemo({ socials, copiedKey, onCopy }) {
  const t = useT();

  return (
    <ul className="warp-contact-grid">
      {socials.map((social) => {
        const Icon = socialIcons[social.id];
        const copied = copiedKey === `dialog-${social.id}`;
        const ActionIcon = social.copy ? (copied ? IconCheck : IconCopy) : IconArrowUpRight;
        const content = (
          <>
            <span className="warp-contact-icon">
              <Icon />
            </span>
            <span className="warp-contact-text">
              <span className="warp-contact-kicker">{social.label}</span>
              <span className="warp-contact-value">{social.handle}</span>
            </span>
            <span className="warp-contact-action" aria-hidden="true">
              <ActionIcon />
            </span>
          </>
        );

        return (
          <li key={social.id}>
            {social.copy ? (
              <button
                type="button"
                className={`warp-contact-link${copied ? " is-copied" : ""}`}
                onClick={() => onCopy(social.copy, `dialog-${social.id}`)}
                aria-label={`${social.label}: ${social.handle} – ${t.copy}`}
              >
                {content}
                <span className="warp-contact-toast" role="status">
                  {copied ? t.copied : ""}
                </span>
              </button>
            ) : (
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="warp-contact-link"
                aria-label={`${social.label}: ${social.handle}`}
              >
                {content}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
