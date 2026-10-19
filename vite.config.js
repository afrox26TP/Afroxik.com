import { defineConfig } from 'vite'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import react from '@vitejs/plugin-react'

// Náhledy odkazů (Discord apod.) nespouští JavaScript, proto /en dostane při buildu vlastní kopii
// index.html s anglickými meta tagy. Cloudflare ji servíruje jako /en.
const englishMeta = {
  'lang="cs"': 'lang="en"',
  cs_CZ: 'en_US',
  'Afrox — projekty, hry a vývojové experimenty': 'Afrox — projects, games and dev experiments',
  'Afrox – projekty, aplikace, hry a vývojové experimenty.': 'Afrox – projects, apps, games and dev experiments.',
  'https://afrox26tp.com/"': 'https://afrox26tp.com/en"',
}

function englishHtml() {
  return {
    name: 'english-html',
    apply: 'build',
    async writeBundle({ dir }) {
      let html = await readFile(path.join(dir, 'index.html'), 'utf8')
      for (const [cs, en] of Object.entries(englishMeta)) {
        if (!html.includes(cs)) throw new Error(`en.html: index.html už neobsahuje ${cs}, uprav englishMeta ve vite.config.js`)
        html = html.replaceAll(cs, en)
      }
      await writeFile(path.join(dir, 'en.html'), html)
    },
  }
}

// Vývojový server na /play/ vrací index.html webu (SPA), ne hru. Cloudflare v produkci servíruje
// play/index.html sám, tady se adresa jen přepíše, ať jde hra v showcase vyzkoušet i lokálně.
function servePlayIndex() {
  return {
    name: 'serve-play-index',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/play/' || req.url?.startsWith('/play/?')) {
          req.url = req.url.replace('/play/', '/play/index.html')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    englishHtml(),
    servePlayIndex(),
  ],
  publicDir: 'Afroxik.com/public',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(import.meta.dirname, 'Afroxik.com/src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          if (id.includes('ogl')) return 'fx-vendor'
          return 'vendor'
        },
      },
    },
  },
})
