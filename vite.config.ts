import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Project Pages URL: https://darkfall48.github.io/Portfolio/
  // Dev uses "/" so localhost:5173 works without a prefix.
  base: command === 'build' ? '/Portfolio/' : '/',
}))
