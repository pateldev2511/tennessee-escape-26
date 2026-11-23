import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/tennessee-escape-26/
export default defineConfig({
  base: '/tennessee-escape-26/',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2020', cssCodeSplit: true },
})
