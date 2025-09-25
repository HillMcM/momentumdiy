import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    // Force cache busting for development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    rollupOptions: {
      input: {
        main: './public/app.html'
      },
      output: {
        manualChunks: undefined,
        // Force cache busting
        entryFileNames: `assets/[name]-[hash]-v5.js`,
        chunkFileNames: `assets/[name]-[hash]-v5.js`,
        assetFileNames: `assets/[name]-[hash]-v5.[ext]`
      }
    }
  },
  // Ensure all routes are handled by the frontend
  base: '/',
})
