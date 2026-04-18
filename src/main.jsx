import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPixels } from './lib/pixels.js'

// Initialize analytics pixels. No-ops until VITE_META_PIXEL_ID and
// VITE_GA_MEASUREMENT_ID env vars are set in Vercel (see docs/pixel-ga-swap-in.md).
initPixels();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
