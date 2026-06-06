import { useEffect, useState } from 'react'
import { getPageData } from './lib/content'
import ProjectCard from './components/ProjectCard'
import ThemeToggle from './components/ThemeToggle'
import './index.css'

export default function App() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nodeCount, setNodeCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    async function loadContent() {
      const nextData = await getPageData()
      if (isMounted) {
        setData(nextData)
        setIsLoading(false)
      }
    }
    loadContent()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!data) return
    const target = data.projects.length
    if (!target) { setNodeCount(0); return }
    let n = 0
    const id = setInterval(() => {
      n = Math.min(n + 1, target)
      setNodeCount(n)
      if (n >= target) clearInterval(id)
    }, 80)
    return () => clearInterval(id)
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="loading-sandbox">Nacitam portfolio a projekty...</div>
      </div>
    )
  }

  const { profile, projects } = data

  return (
    <div className="app-atypical app-cyber-sandbox min-h-screen text-gray-900 dark:text-gray-100">
      <div className="cyber-bg-grid" aria-hidden="true" />
      <div className="cyber-bg-orb cyber-bg-orb--a" aria-hidden="true" />
      <div className="cyber-bg-orb cyber-bg-orb--b" aria-hidden="true" />
      <div className="cyber-bg-noise" aria-hidden="true" />

      {/* Header Navigation */}
      <header className="site-header-atypical site-header-sandbox bg-white/85 dark:bg-gray-900/75 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="header-glitch-name text-2xl font-bold text-gray-900 dark:text-white tracking-wide">{profile.name}</h1>
            <p className="typing-label text-xs text-cyan-700 dark:text-cyan-300 uppercase tracking-[0.26em] mt-1">
               · aplikace a Hry
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero / Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="atypical-panel atypical-panel--intro atypical-panel--matte cyber-panel p-8 bg-white/55 dark:bg-gray-900/55 border border-gray-200 dark:border-gray-700 max-w-4xl">
          <span className="panel-corner-tl" aria-hidden="true" />
          <span className="panel-corner-br" aria-hidden="true" />
          <span className="hero-scanner" aria-hidden="true" />
          <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-300 uppercase tracking-[0.2em] mb-3">
            <span className="hero-pulse-dot" aria-hidden="true" />{profile.role}
          </p>
          <h2 className="cyber-hero-title text-3xl sm:text-4xl text-gray-900 dark:text-white mb-4">
            Vyvijim aplikace, hry a nastroje.
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">{profile.intro}</p>

          <div className="sandbox-chips mt-8">
            <span>Status: aktivni</span>
            <span>Projektu: {nodeCount}</span>
            <span>Stack: Python, React, Javascript, Html, vite, GDscript etc...</span>
          </div>
          <div className="hero-telemetry-grid mt-6" aria-hidden="true">
            <span>build ok</span>
            <span>repo online</span>
            <span>ui tuned</span>
            <span>ship ready</span>
          </div>
          <div className="hero-hud-bar mt-7" aria-hidden="true">
            <span className="hero-hud-bar__fill" />
          </div>
        </div>
      </section>

      <div className="cyber-section-sep" aria-hidden="true" />

      {/* Projects Section */}
      <section id="projects" className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="atypical-panel atypical-panel--tech cyber-panel p-8 bg-white/55 dark:bg-gray-900/55 border border-gray-200 dark:border-gray-700">
          <div className="panel-ruler panel-ruler--top" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="project-matrix-head mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Moje aplikace a projekty</h2>
            <div className="matrix-head-right">
              <span className="matrix-hud-dot" aria-hidden="true" />
              <span className="matrix-hud-dot matrix-hud-dot--b" aria-hidden="true" />
              <span className="atypical-badge text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1">
                {projects.length} projektu
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} variant={idx % 3} style={{ '--ci': idx }} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Social Footer */}
      <footer className="bg-white/75 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="atypical-panel atypical-panel--soft cyber-panel p-8 bg-white/55 dark:bg-gray-900/55 border border-gray-200 dark:border-gray-700">
            <div className="panel-ruler panel-ruler--soft" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h2 className="cyber-contact-head text-2xl font-bold text-gray-900 dark:text-white mb-8">Kontakt a profily</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.discord && (
                <div className="atypical-contact-tile cyber-contact-tile border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Discord</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.discord}</p>
                </div>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="atypical-contact-tile cyber-contact-tile border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300 dark:hover:border-cyan-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">GitHub</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-cyan-600 dark:hover:text-cyan-300">
                    {profile.githubHandle || "afrox26tp"}
                  </p>
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="atypical-contact-tile cyber-contact-tile border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300 dark:hover:border-cyan-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Instagram</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-cyan-600 dark:hover:text-cyan-300">
                    {profile.instagramHandle || "tomik62pt"}
                  </p>
                </a>
              )}
              {profile.steam && (
                <a
                  href={profile.steam}
                  target="_blank"
                  rel="noreferrer"
                  className="atypical-contact-tile cyber-contact-tile border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300 dark:hover:border-cyan-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Steam</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-cyan-600 dark:hover:text-cyan-300">
                    {profile.steamHandle || "afrox26tp"}
                  </p>
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

