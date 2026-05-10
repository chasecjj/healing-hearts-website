import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // zxcvbn-ts ships CJS internals (require frequency_lists.json) — pre-bundle
    // so Vite converts to ESM at install time, avoiding "require is not defined"
    // in the browser at runtime. Per Wave 9 R2 finding F-001 (2026-05-10).
    include: ['zxcvbn-ts'],
  },
})
