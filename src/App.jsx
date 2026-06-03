import { useEffect, useState } from 'react'
import { getPageData } from './lib/content'
import ProjectCard from './components/ProjectCard'
import ThemeToggle from './components/ThemeToggle'
import './index.css'

export default function App() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-gray-600 dark:text-gray-300 text-lg">Loading...</div>
      </div>
    )
  }

  const { profile, projects } = data

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero / Intro Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            {profile.role}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl">{profile.intro}</p>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="p-8 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h2>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {projects.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Social Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="p-8 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Get in touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.discord && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Discord</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{profile.discord}</p>
                </div>
              )}
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">GitHub</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {profile.githubHandle || "afrox26tp"}
                  </p>
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Instagram</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {profile.instagramHandle || "tomik62pt"}
                  </p>
                </a>
              )}
              {profile.steam && (
                <a
                  href={profile.steam}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Steam</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400">
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

