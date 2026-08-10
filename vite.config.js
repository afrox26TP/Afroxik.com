import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const nestedPublic = path.resolve(import.meta.dirname, 'Afroxik.com/public')

function serveSharedAssets() {
  return {
    name: 'serve-shared-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const match = request.url?.match(/^\/(fonts|images)\/([^/?#]+)$/)
        if (!match) return next()

        const directory = match[1]
        const fileName = path.basename(decodeURIComponent(match[2]))
        const filePath = path.join(nestedPublic, directory, fileName)
        if (!fs.existsSync(filePath)) return next()

        const extension = path.extname(fileName).toLowerCase()
        const contentTypes = {
          '.woff2': 'font/woff2',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
        }
        response.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream')
        response.setHeader('Cache-Control', 'public, max-age=3600')
        return fs.createReadStream(filePath).pipe(response)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serveSharedAssets(),
    viteStaticCopy({
      targets: [
        { src: 'Afroxik.com/public/fonts/*', dest: 'fonts', rename: { stripBase: true } },
        { src: 'Afroxik.com/public/images/*', dest: 'images', rename: { stripBase: true } },
      ],
    }),
  ],
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
