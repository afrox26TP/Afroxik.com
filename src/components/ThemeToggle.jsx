import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, setIsDark } = useTheme()

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="theme-toggle-atypical theme-toggle-sandbox p-2.5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-shell">
        <span className="theme-toggle-copy">
          <span className="theme-toggle-copy-label">Mode</span>
          <span className="theme-toggle-copy-value">{isDark ? 'Dark' : 'Light'}</span>
        </span>
        <span className="theme-toggle-glyph" aria-hidden="true">
          {isDark ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.707a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2 2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2 2.828a1 1 0 111.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zm-8.485 2.121a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm2.121 2.121a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.121 2.121a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.293-1.707a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-2-2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-2-2.828a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span className="theme-toggle-bars" aria-hidden="true">
          <span className={isDark ? 'is-active' : ''} />
          <span className="is-active" />
          <span className={!isDark ? 'is-active' : ''} />
        </span>
      </span>
    </button>
  )
}
