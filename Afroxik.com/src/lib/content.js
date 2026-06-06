let cachedSupabase = null;
let cachedHasConfig = null;

async function getSupabaseRuntime() {
  if (cachedHasConfig != null) {
    return {
      supabase: cachedSupabase,
      hasSupabaseConfig: cachedHasConfig,
    };
  }

  const hasEnvConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!hasEnvConfig) {
    cachedHasConfig = false;
    cachedSupabase = null;
    return {
      supabase: null,
      hasSupabaseConfig: false,
    };
  }

  const mod = await import("./supabase");
  cachedSupabase = mod.supabase;
  cachedHasConfig = mod.hasSupabaseConfig;
  return {
    supabase: cachedSupabase,
    hasSupabaseConfig: cachedHasConfig,
  };
}

const demoProfile = {
  name: "Afrox",
  role: "architect of digital futures",
  intro: "Pan_Majitel. Nezlob Kote v bote, vidim te kolacku.",
  github: "https://github.com/afrox26TP",
  githubHandle: "afrox26TP",
  discord: "afrox26TPV2",
  instagram: "https://www.instagram.com/tomik62pt/",
  instagramHandle: "Tomi",
  steam: "https://steamcommunity.com/id/1234dg7548/",
  steamHandle: "afrox26tp",
};

const demoProjects = [
  {
    label: "github",
    title: "RP-2025-26",
    description: "Tahova grand strategy hra vyvijena v Godotu jako rocnikova prace pro skolu.",
    url: "https://github.com/afrox26TP/RP-2025-26",
    previewImage: "/images/rp-2025-26.png",
  },
  {
    id: 2,
    label: "github",
    title: "map_generator_godot",
    description: "Godot nastroj pro generovani map a rychle testovani hernich scenaru.",
    url: "https://github.com/afrox26TP/map_generator_godot",
    previewImage: "/images/console.png",
  },
  {
    id: 3,
    label: "github",
    title: "Sauto_Scrapper",
    description: "Automatizovany scraper pro stahovani a cisteni dat ze Sauto.",
    url: "https://github.com/afrox26TP/Sauto_Scrapper",
    previewImage: "/images/project-sauto.svg",
  },
  {
    id: 4,
    label: "github",
    title: "Octopus-AI",
    description: "AI projekt pro automatizaci, experimenty a zpracovani dat.",
    url: "https://github.com/afrox26TP/Octopus-AI",
    previewImage: "/images/project-octopus-ai.svg",
  },
  {
    id: 5,
    label: "github",
    title: "24-7-solutions",
    description: "Projekt pro webove a aplikacni reseni s durazem na dostupnost.",
    url: "https://github.com/afrox26TP/24-7-solutions",
    previewImage: "/images/project-247-solutions.svg",
  },
  {
    id: 6,
    label: "github",
    title: "Muzeer",
    description: "Hudebni aplikace pro spravu, objevovani a prehravani skladeb.",
    url: "https://github.com/BugHunter34/Muzeer",
    previewImage: "/images/muzeer.png",
  },
  {
    id: 7,
    label: "github",
    title: "OpusCode",
    description: "Nastroj pro praci s kodem, analyzu a developer workflow.",
    url: "https://github.com/BugHunter34/OpusCode",
    previewImage: "/images/project-opus.webp",
  },
];

function sortByPosition(items) {
  return [...items].sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
}

export async function getPageData() {
  const { supabase, hasSupabaseConfig } = await getSupabaseRuntime();

  if (!hasSupabaseConfig || !supabase) {
    return {
      profile: demoProfile,
      projects: demoProjects,
      source: "demo",
    };
  }

  try {
    const [profileResult, projectsResult] = await Promise.all([
      supabase.from("profile").select("*").limit(1).maybeSingle(),
      supabase.from("projects").select("*").eq("published", true),
    ]);

    if (profileResult.error || projectsResult.error) {
      throw profileResult.error || projectsResult.error;
    }

    return {
      profile: profileResult.data ?? demoProfile,
      projects: sortByPosition(projectsResult.data ?? demoProjects),
      source: "supabase",
    };
  } catch {
    return {
      profile: demoProfile,
      projects: demoProjects,
      source: "demo",
    };
  }
}