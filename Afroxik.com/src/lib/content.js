// Veškerý obsah webu na jednom místě – texty, projekty, kontakty.

const profile = {
  name: "Afrox",
  handle: "afrox26TP",
  role: "Student · Vývojář · Gamer",
  tagline: ["Projekty, aplikace, hry", "a vývojové experimenty."],
  intro: "Pan_Majitel. Nezlob Kote v bote, vidim te kolacku.",
  bio: "Student, vývojář a nadšenec do technologií a her. Píšu v Godotu, Pythonu i JavaScriptu – od tahové grand strategy přes scrapery až po weby a AI experimenty.",
  githubSince: 2022,
  heroTags: ["Godot", "Python", "React", "WebGL"],
};

// Discord nemá veřejnou URL podle jména, proto se handle kopíruje do schránky.
const socials = [
  { id: "discord", label: "Discord", handle: "afrox26TPV2", copy: "afrox26TPV2" },
  { id: "github", label: "GitHub", handle: "afrox26TP", href: "https://github.com/afrox26TP" },
  { id: "instagram", label: "Instagram", handle: "Tomi", href: "https://www.instagram.com/tomik62pt/" },
  { id: "steam", label: "Steam", handle: "afrox26tp", href: "https://steamcommunity.com/id/1234dg7548/" },
];

const toolbox = ["Godot", "GDScript", "Python", "Scrapy", "JavaScript", "React", "Vite", "WebGL", "CSS", "Git"];

const projects = [
  {
    id: "rp-2025-26",
    title: "RP-2025-26",
    repo: "afrox26TP/RP-2025-26",
    url: "https://github.com/afrox26TP/RP-2025-26",
    description: "Tahová grand strategy hra vyvíjená v Godotu jako ročníková práce pro školu.",
    tags: ["Godot", "GDScript"],
    year: 2025,
    image: "/images/project-screenshot.webp",
    accent: ["#59a8ff", "#7cecff"],
    showcase: {
      src: "/images/rp-2025-26.webp",
      srcSet: "/images/project-screenshot.webp 1200w, /images/rp-2025-26.webp 1800w",
      width: 1800,
      height: 970,
      kicker: "Featured · Ročníková práce",
    },
  },
  {
    id: "map-generator-godot",
    title: "map_generator_godot",
    repo: "afrox26TP/map_generator_godot",
    url: "https://github.com/afrox26TP/map_generator_godot",
    description: "Godot nástroj pro generování map a rychlé testování herních scénářů.",
    tags: ["Python", "Godot"],
    year: 2025,
    image: "/images/project-console.webp",
    accent: ["#7cecff", "#3d6dff"],
  },
  {
    id: "sauto-scrapper",
    title: "Sauto_Scrapper",
    repo: "afrox26TP/Sauto_Scrapper",
    url: "https://github.com/afrox26TP/Sauto_Scrapper",
    description: "Automatizovaný scraper pro stahování a čištění dat ze Sauto.",
    tags: ["Python", "Scrapy"],
    year: 2026,
    image: "/images/project-sauto.svg",
    accent: ["#4d8fff", "#7cecff"],
  },
  {
    id: "octopus-ai",
    title: "Octopus-AI",
    repo: "afrox26TP/Octopus-AI",
    url: "https://github.com/afrox26TP/Octopus-AI",
    description: "AI projekt pro automatizaci, experimenty a zpracování dat.",
    tags: ["Python", "JavaScript"],
    year: 2026,
    image: "/images/project-octopus-ai.svg",
    accent: ["#9b7bff", "#7cecff"],
  },
  {
    id: "24-7-solutions",
    title: "24-7-solutions",
    repo: "afrox26TP/24-7-solutions",
    url: "https://github.com/afrox26TP/24-7-solutions",
    description: "Projekt pro webová a aplikační řešení s důrazem na dostupnost.",
    tags: ["JavaScript", "CSS"],
    year: 2026,
    image: "/images/project-247-solutions.svg",
    accent: ["#59a8ff", "#9b7bff"],
  },
  {
    id: "muzeer",
    title: "Muzeer",
    repo: "BugHunter34/Muzeer",
    url: "https://github.com/BugHunter34/Muzeer",
    description: "Hudební aplikace pro správu, objevování a přehrávání skladeb.",
    tags: ["JavaScript"],
    year: 2026,
    image: "/images/project-muzeer.webp",
    accent: ["#f472b6", "#9b7bff"],
  },
  {
    id: "opuscode",
    title: "OpusCode",
    repo: "BugHunter34/OpusCode",
    url: "https://github.com/BugHunter34/OpusCode",
    description: "Nástroj pro práci s kódem, analýzu a developer workflow.",
    tags: ["JavaScript", "CSS"],
    year: 2026,
    image: "/images/project-opus.webp",
    imagePosition: "left top",
    accent: ["#9b7bff", "#59a8ff"],
  },
];

export const navSections = [
  { id: "projects", label: "Projekty" },
  { id: "about", label: "O mně" },
  { id: "contact", label: "Kontakt" },
];

export async function getPageData() {
  return {
    profile,
    socials,
    toolbox,
    projects,
    source: "static",
  };
}
