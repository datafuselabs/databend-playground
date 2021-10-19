import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/queries': {
        target: "http://localhost:4000",
        changeOrigin: true,
      }
    }
  }
})
