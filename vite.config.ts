import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GH_PAGES ? '/audio-evaluation-tool/' : '/',
  plugins: [
    react(),
    // Plugin to handle SPA fallback for nested routes
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Handle routes like /compare/exp1, /abtest/exp1, /exp1, etc.
          // Skip API paths, file paths, vite HMR paths, and root
          if (req.url && 
              !req.url.startsWith('/api') && 
              !req.url.startsWith('/assets') && 
              !req.url.startsWith('/@') &&
              !req.url.startsWith('/src/') &&
              !req.url.startsWith('/node_modules/') &&
              !req.url.includes('.') &&
              req.url !== '/') {
            // Rewrite to root to serve index.html
            req.url = '/'
          }
          next()
        })
      }
    }
  ],
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
    host: true,
  }
})
