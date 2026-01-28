import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to handle SPA fallback for nested routes
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Handle routes like /exp1, /exp2, /exp-name, etc.
          // Skip API paths, file paths, and root
          if (req.url && 
              !req.url.startsWith('/api') && 
              !req.url.startsWith('/assets') && 
              !req.url.startsWith('/@') &&
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
    port: 30767,
  }
})
