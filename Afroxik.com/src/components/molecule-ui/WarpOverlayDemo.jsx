function IconDiscord(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.1.1 0 0 0-.1.1c-.2.3-.4.7-.5 1a18.3 18.3 0 0 0-5.4 0c-.1-.3-.3-.7-.5-1a.1.1 0 0 0-.1-.1A19.7 19.7 0 0 0 3.9 4.4.1.1 0 0 0 3.8 4.5c-2.3 3.4-2.9 6.7-2.6 10 .0 0 .0.1.1.1a19.9 19.9 0 0 0 5.8 3.1.1.1 0 0 0 .1 0c.5-.7 1-1.4 1.4-2.1a.1.1 0 0 0 0-.1 12.3 12.3 0 0 1-2-.9.1.1 0 0 1 0-.2c.1-.1.2-.2.3-.3a.1.1 0 0 1 .1 0c4.1 1.9 8.5 1.9 12.6 0a.1.1 0 0 1 .1 0c.1.1.2.2.3.3a.1.1 0 0 1 0 .2c-.7.4-1.3.7-2 .9a.1.1 0 0 0 0 .1c.4.7.9 1.4 1.4 2.1a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 5.8-3.1.1.1 0 0 0 .1-.1c.4-4-.7-7.4-2.8-10.1a.1.1 0 0 0-.1-.1ZM8.3 13.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/>
    </svg>
  )
}

function IconGithub(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1 3 .8.1-.7.4-1 .7-1.2-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.8c-.1-.3-.4-1.3.1-2.7 0 0 .8-.2 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.2 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.8c0 3.9-2.4 4.7-4.7 5 .4.4.8 1.1.8 2.2v3.2c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>
    </svg>
  )
}

function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.75 6.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/>
    </svg>
  )
}

function IconSteam(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-9.7 7.6l5.4 2.2a3.7 3.7 0 0 1 2.3-.8l2.4-3.3V7.5a2.6 2.6 0 1 1 2.6 2.6h-.1l-2.9 2.1a3.7 3.7 0 0 1-5.8 2l-4.1 1.7A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.7 12.4l-2.5-1a5.4 5.4 0 0 0-.4-4.1 5.5 5.5 0 0 0-2.9-2.6L13 9.1a4.6 4.6 0 0 1-.1-.5 4.5 4.5 0 0 1 0-.8 8.2 8.2 0 0 1-.9-3.8ZM8.6 14a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm0 1a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Z"/>
    </svg>
  )
}

const socialLinks = [
  {
    label: "Discord",
    handle: "afrox26TPV2",
    href: "https://discord.com/users/afrox26TPV2",
    icon: IconDiscord,
  },
  {
    label: "GitHub",
    handle: "afrox26TP",
    href: "https://github.com/afrox26TP",
    icon: IconGithub,
  },
  {
    label: "Instagram",
    handle: "Tomi",
    href: "https://www.instagram.com/tomik62pt/",
    icon: IconInstagram,
  },
  {
    label: "Steam",
    handle: "afrox26tp",
    href: "https://steamcommunity.com/id/1234dg7548/",
    icon: IconSteam,
  },
]

export function WarpOverlayDemo() {
  return (
    <div className="warp-contact-grid">
        {socialLinks.map(({ label, handle, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="warp-contact-link"
            aria-label={`${label}: ${handle}`}
          >
            <span className="warp-contact-icon">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <span className="warp-contact-value">{handle}</span>
            </div>
          </a>
        ))}
    </div>
  )
}