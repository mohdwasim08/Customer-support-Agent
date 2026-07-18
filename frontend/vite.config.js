import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // ─── Development Server ──────────────────────────────────────────────────────
  server: {
    host: true,         // Bind to 0.0.0.0 — allows access from LAN and tunnels
    allowedHosts: true, // Accept requests from any hostname (tunnels, cloud previews)
    proxy: {
      // Proxy ADK API calls to backend during development
      '/apps': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/run_sse': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },

  // ─── Preview Server (after vite build) ───────────────────────────────────────
  preview: {
    host: true,
    allowedHosts: true,
    port: 4173,
  },

  // ─── Production Build ────────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable sourcemaps in production
    minify: 'oxc',     // Vite 8 built-in Rust-based minifier (replaces esbuild)
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
})
