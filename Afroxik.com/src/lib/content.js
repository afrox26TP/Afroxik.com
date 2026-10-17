// Veškerý obsah webu na jednom místě – texty a kontakty. Projekty se načítají z GitHubu.

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

// Projekty = veřejná repa z GitHubu, nejnověji pushnutá první. Profilové README není projekt.
const hiddenRepos = ["afrox26TP"];

// Repa z cizích účtů, na kterých jsem dělal. Mezi mými je GitHub nevrátí, proto se načtou zvlášť.
const extraRepos = ["BugHunter34/Muzeer", "BugHunter34/OpusCode"];

// Repo, které se ukáže jako velký 3D screenshot pod úvodem. Texty bere z GitHubu, screenshot je lokální.
const featured = {
  repo: "RP-2025-26",
  src: "/images/rp-2025-26.webp",
  srcSet: "/images/project-screenshot.webp 1200w, /images/rp-2025-26.webp 1800w",
  width: 1800,
  height: 970,
  kicker: "Featured · Ročníková práce",
};

const accents = [
  ["#59a8ff", "#7cecff"],
  ["#7cecff", "#3d6dff"],
  ["#4d8fff", "#7cecff"],
  ["#9b7bff", "#7cecff"],
  ["#59a8ff", "#9b7bff"],
  ["#f472b6", "#9b7bff"],
  ["#9b7bff", "#59a8ff"],
];

const REPOS_URL = `https://api.github.com/users/${profile.handle}/repos?per_page=100&sort=pushed`;
// Klíč obsahuje cizí repa, takže se změna jejich seznamu projeví hned, ne až po vypršení cache.
const REPOS_CACHE_KEY = `afrox-github-repos-v1:${extraRepos}`;
// GitHub bez tokenu povolí 60 dotazů za hodinu z jedné IP, proto si prohlížeč seznam chvíli pamatuje.
const REPOS_CACHE_MS = 10 * 60 * 1000;

function toProject(repo) {
  return {
    id: repo.name,
    title: repo.name,
    repo: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    tags: [repo.language, ...(repo.topics ?? [])].filter(Boolean),
    year: new Date(repo.created_at).getFullYear(),
  };
}

function readCachedRepos() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(REPOS_CACHE_KEY));
    return Array.isArray(cached?.repos) ? cached : null;
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout?.(5000) });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return response.json();
}

async function loadRepos() {
  const cached = readCachedRepos();
  if (cached && Date.now() - cached.savedAt < REPOS_CACHE_MS) return cached.repos;

  try {
    // Cizí repo, které zmizí nebo se přejmenuje, se prostě vynechá.
    const [own, ...extra] = await Promise.all([
      fetchJson(REPOS_URL),
      ...extraRepos.map((name) => fetchJson(`https://api.github.com/repos/${name}`).catch(() => null)),
    ]);
    const repos = [...own.filter((repo) => !repo.fork), ...extra.filter(Boolean)]
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .map(toProject);
    try {
      window.localStorage.setItem(REPOS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
    } catch {
      // Ignore storage issues in private browsing or blocked storage contexts.
    }
    return repos;
  } catch {
    // Výpadek nebo vyčerpaný limit – poslouží poslední uložený seznam.
    return cached?.repos ?? [];
  }
}

export const navSections = [
  { id: "projects", label: "Projekty" },
  { id: "about", label: "O mně" },
  { id: "contact", label: "Kontakt" },
];

export async function getPageData() {
  const projects = (await loadRepos())
    .filter((project) => !hiddenRepos.includes(project.id))
    .map((project, index) => ({
      ...project,
      accent: accents[index % accents.length],
      showcase: project.id === featured.repo ? featured : undefined,
    }));

  return {
    profile,
    socials,
    toolbox,
    projects,
    source: "github",
  };
}
