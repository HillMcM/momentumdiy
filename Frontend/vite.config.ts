import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
      host: 'localhost'
    },
    // This is the key fix for client-side routing
    historyApiFallback: true
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
      output: {
        manualChunks: undefined
      }
    }
  },
  // Ensure all routes are handled by the frontend
  base: '/',
})
