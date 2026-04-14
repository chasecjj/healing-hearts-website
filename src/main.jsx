import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPixels } from './lib/pixels.js'

// Initialize retargeting pixels (no-ops until placeholder IDs are replaced)
initPixels();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
