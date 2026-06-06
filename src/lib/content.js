import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

let cachedSupabase = null
let cachedHasConfig = null

async function getSupabaseRuntime() {
  if (cachedHasConfig != null) {
    return {
      supabase: cachedSupabase,
      hasSupabaseConfig: cachedHasConfig,
    }
  }

  const hasEnvConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  if (!hasEnvConfig) {
    cachedHasConfig = false
    cachedSupabase = null
    return {
      supabase: null,
      hasSupabaseConfig: false,
    }
  }

  cachedSupabase = supabase
  cachedHasConfig = true
  return {
    supabase: cachedSupabase,
    hasSupabaseConfig: cachedHasConfig,
  }
}

const demoProfile = {
  name: "Afrox",
  role: "Student, vyvojář, nadšenec do technologií a her",
  intro: "Pan_Majitel. Nezlob Kote v bote, vidim te kolacku.",
  github: "https://github.com/afrox26TP",
  githubHandle: "afrox26TP",
  discord: "afrox26TPV2",
  instagram: "https://www.instagram.com/tomik62pt/",
  instagramHandle: "Tomi",
  steam: "https://steamcommunity.com/id/1234dg7548/",
  steamHandle: "afrox26tp",
}

const demoProjects = [
  {
    id: 1,
    label: "github",
    title: "RP-2025-26",
    description: "Tahova grand strategy hra vyvijena v Godotu jako rocnikova prace pro skolu.",
    url: "https://github.com/afrox26TP/RP-2025-26",
  },
  {
    id: 2,
    label: "github",
    title: "map_generator_godot",
    description: "Godot nastroj pro generovani map a rychle testovani hernich scenaru.",
    url: "https://github.com/afrox26TP/map_generator_godot",
  },
  {
    id: 3,
    label: "github",
    title: "Sauto_Scrapper",
    description: "Automatizovany scraper pro stahovani a cisteni dat ze Sauto.",
    url: "https://github.com/afrox26TP/Sauto_Scrapper",
  },
  {
    id: 4,
    label: "github",
    title: "Octopus-AI",
    description: "AI projekt pro automatizaci, experimenty a zpracovani dat.",
    url: "https://github.com/afrox26TP/Octopus-AI",
  },
  {
    id: 5,
    label: "github",
    title: "24-7-solutions",
    description: "Projekt pro webove a aplikacni reseni s durazem na dostupnost.",
    url: "https://github.com/afrox26TP/24-7-solutions",
  },
  {
    id: 6,
    label: "github",
    title: "Muzeer",
    description: "Hudebni aplikace pro spravu, objevovani a prehravani skladeb.",
    url: "https://github.com/BugHunter34/Muzeer",
  },
  {
    id: 7,
    label: "github",
    title: "OpusCode",
    description: "Nastroj pro praci s kodem, analyzu a developer workflow.",
    url: "https://github.com/BugHunter34/OpusCode",
  },
]

function sortByPosition(items) {
  return [...items].sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
}

export async function getPageData() {
  const { supabase, hasSupabaseConfig } = await getSupabaseRuntime()

  if (!hasSupabaseConfig || !supabase) {
    return {
      profile: demoProfile,
      projects: demoProjects,
      source: "demo",
    }
  }

  try {
    const [profileResult, projectsResult] = await Promise.all([
      supabase.from("profile").select("*").limit(1).maybeSingle(),
      supabase.from("projects").select("*").eq("published", true),
    ])

    if (profileResult.error || projectsResult.error) {
      throw profileResult.error || projectsResult.error
    }

    return {
      profile: profileResult.data ?? demoProfile,
      projects: sortByPosition(projectsResult.data ?? demoProjects),
      source: "supabase",
    }
  } catch {
    return {
      profile: demoProfile,
      projects: demoProjects,
      source: "demo",
    }
  }
}
