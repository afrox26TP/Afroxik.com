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
]

export async function getPageData() {
  return {
    profile: demoProfile,
    projects: demoProjects,
    source: "static",
  }
}
