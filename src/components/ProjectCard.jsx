import BorderGlow from './ui/BorderGlow'
import LiquidGlass from './ui/liquid-glass'

export default function ProjectCard({ project }) {
  return (
    <BorderGlow
      borderRadius={12}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      glowColor="40 80 80"
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
    >
      <LiquidGlass
        as="a"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        borderRadius={12}
        saturation={1.15}
        displace={0.42}
        className="block p-6 h-full"
        style={{ textDecoration: 'none' }}
      >
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {project.label}
        </span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-300">
          Open →
        </span>
      </LiquidGlass>
    </BorderGlow>
  )
}
