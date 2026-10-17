import { useId } from "react";

function Stroke({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDiscord(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.1.1 0 0 0-.1.1c-.2.3-.4.7-.5 1a18.3 18.3 0 0 0-5.4 0c-.1-.3-.3-.7-.5-1a.1.1 0 0 0-.1-.1A19.7 19.7 0 0 0 3.9 4.4.1.1 0 0 0 3.8 4.5c-2.3 3.4-2.9 6.7-2.6 10 .0 0 .0.1.1.1a19.9 19.9 0 0 0 5.8 3.1.1.1 0 0 0 .1 0c.5-.7 1-1.4 1.4-2.1a.1.1 0 0 0 0-.1 12.3 12.3 0 0 1-2-.9.1.1 0 0 1 0-.2c.1-.1.2-.2.3-.3a.1.1 0 0 1 .1 0c4.1 1.9 8.5 1.9 12.6 0a.1.1 0 0 1 .1 0c.1.1.2.2.3.3a.1.1 0 0 1 0 .2c-.7.4-1.3.7-2 .9a.1.1 0 0 0 0 .1c.4.7.9 1.4 1.4 2.1a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 5.8-3.1.1.1 0 0 0 .1-.1c.4-4-.7-7.4-2.8-10.1a.1.1 0 0 0-.1-.1ZM8.3 13.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

export function IconGithub(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1 3 .8.1-.7.4-1 .7-1.2-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.8c-.1-.3-.4-1.3.1-2.7 0 0 .8-.2 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.2 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.8c0 3.9-2.4 4.7-4.7 5 .4.4.8 1.1.8 2.2v3.2c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.75 6.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
    </svg>
  );
}

export function IconSteam(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M12 2a10 10 0 0 0-9.7 7.6l5.4 2.2a3.7 3.7 0 0 1 2.3-.8l2.4-3.3V7.5a2.6 2.6 0 1 1 2.6 2.6h-.1l-2.9 2.1a3.7 3.7 0 0 1-5.8 2l-4.1 1.7A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.7 12.4l-2.5-1a5.4 5.4 0 0 0-.4-4.1 5.5 5.5 0 0 0-2.9-2.6L13 9.1a4.6 4.6 0 0 1-.1-.5 4.5 4.5 0 0 1 0-.8 8.2 8.2 0 0 1-.9-3.8ZM8.6 14a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm0 1a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Z" />
    </svg>
  );
}

export const socialIcons = {
  discord: IconDiscord,
  github: IconGithub,
  instagram: IconInstagram,
  steam: IconSteam,
};

export function IconArrowRight(props) {
  return (
    <Stroke {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Stroke>
  );
}

export function IconArrowUpRight(props) {
  return (
    <Stroke {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Stroke>
  );
}

export function IconArrowUp(props) {
  return (
    <Stroke {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Stroke>
  );
}

export function IconCopy(props) {
  return (
    <Stroke {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Stroke>
  );
}

export function IconCheck(props) {
  return (
    <Stroke {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Stroke>
  );
}

export function IconMenu(props) {
  return (
    <Stroke {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Stroke>
  );
}

export function IconClose(props) {
  return (
    <Stroke {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Stroke>
  );
}

export function IconGauge(props) {
  return (
    <Stroke {...props}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </Stroke>
  );
}

export function IconCat(props) {
  return (
    <Stroke {...props}>
      <path d="M5 9.5V4.5l4 3a8.5 8.5 0 0 1 6 0l4-3v5a7.5 7.5 0 1 1-14 0Z" />
      <path d="M9.5 13h.01M14.5 13h.01M11 16c.6.5 1.4.5 2 0" />
    </Stroke>
  );
}

export function IconGlobe(props) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Stroke>
  );
}

export function IconGamepad(props) {
  return (
    <Stroke {...props}>
      <path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59C2.6 9.42 2 14.46 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.41-1.41A2 2 0 0 1 9.83 16h4.34a2 2 0 0 1 1.41.59L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.55-.6-6.58-.69-7.26A4 4 0 0 0 17.32 5Z" />
    </Stroke>
  );
}

// Tečkové „A“ ve stylu písma Doto.
const BRAND_DOTS = [
  [12, 8], [16, 8], [20, 8],
  [8, 12], [24, 12],
  [8, 16], [12, 16], [16, 16], [20, 16], [24, 16],
  [8, 20], [24, 20],
  [8, 24], [24, 24],
];

// letter={false} vykreslí jen rámeček (v navigaci v něm bydlí kočka).
export function BrandMark({ className = "", letter = true, ...props }) {
  const gradientId = `brand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cecff" />
          <stop offset="1" stopColor="#3d6dff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#071330" />
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8.25" fill="none" stroke={`url(#${gradientId})`} strokeOpacity="0.6" strokeWidth="1.5" />
      {letter && (
        <g fill={`url(#${gradientId})`}>
          {BRAND_DOTS.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.65" />
          ))}
        </g>
      )}
    </svg>
  );
}
