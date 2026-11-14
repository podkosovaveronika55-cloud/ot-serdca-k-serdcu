import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base нужен для GitHub Pages: сайт живёт по адресу https://<логин>.github.io/<репозиторий>/
// Значение задаётся переменной окружения BASE_PATH (в CI — это /имя-репозитория/).
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 900,
  },
})
