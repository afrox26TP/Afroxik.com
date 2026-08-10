import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MainApp from '../Afroxik.com/src/App'
import './base.css'
import '../Afroxik.com/src/index.css'

if (window.location.pathname === '/dev' || window.location.pathname.startsWith('/dev/')) {
  window.history.replaceState(null, '', '/')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
