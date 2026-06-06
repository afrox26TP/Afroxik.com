import BorderGlow from './ui/BorderGlow'
import LiquidGlass from './ui/liquid-glass'

const variants = [
  {
    borderRadius: 28,
    colors: ['#67e8f9', '#22d3ee', '#5eead4'],
    glowColor: '186 84 76',
    className: 'project-card-neo project-card-neo--a',
  },
  {
    borderRadius: 18,
    colors: ['#c4b5fd', '#60a5fa', '#93c5fd'],
    glowColor: '225 70 78',
    className: 'project-card-neo project-card-neo--b',
  },
  {
    borderRadius: 34,
    colors: ['#fda4af', '#fdba74', '#fcd34d'],
    glowColor: '24 90 72',
    className: 'project-card-neo project-card-neo--c',
  },
]

export default function ProjectCard({ project, variant = 0, style }) {
  const styleVariant = variants[variant] || variants[0]
  const projectCode = `PX-${String(project.id).padStart(2, '0')}`

  return (
    <div className="cyber-card-wrap" style={style}>
      <BorderGlow
        borderRadius={styleVariant.borderRadius}
        colors={styleVariant.colors}
        glowColor={styleVariant.glowColor}
        glowRadius={34}
        glowIntensity={0.7}
        coneSpread={28}
      >
        <LiquidGlass
          as="a"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          borderRadius={24}
          saturation={1.08}
          displace={0.36}
          className={`${styleVariant.className} flex flex-col p-6 h-full`}
          style={{ textDecoration: 'none' }}
        >
          <div className="project-card-hud-row" aria-hidden="true">
            <span className="project-card-hud-code">{projectCode}</span>
            <span className="project-card-hud-track">
              <span />
              <span />
              <span />
            </span>
          </div>

          <span className="project-card-tag text-xs font-semibold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider">
            {project.label}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-3">{project.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
          <div className="project-card-metrics" aria-hidden="true">
            <span>status: active</span>
            <span>type: {project.label}</span>
          </div>
          <div className="project-card-foot">
            <span className="inline-flex items-center text-cyan-600 dark:text-cyan-300 font-medium text-sm hover:text-cyan-700 dark:hover:text-cyan-200 tracking-wider uppercase">
              Otevrit projekt
            </span>
            <span className="project-card-notch" aria-hidden="true" />
          </div>

          <span className="project-card-scanline" aria-hidden="true" />
          <span className="project-card-corner" aria-hidden="true">
            /&gt;
          </span>
        </LiquidGlass>
      </BorderGlow>
    </div>
  )
}
