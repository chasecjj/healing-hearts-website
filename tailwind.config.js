import scoriPreset from "@scoria/ui/tailwind.preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [scoriPreset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1191B1", // Teal
        accent: "#B96A5F", // Darkened Salmon for contrast
        background: "#F9F8F5", // Warm cream — HH brand base (diverges from Scoria neutral-50 #fafafa for emotional warmth)
        foreground: "#2D2D2D", // Dark Charcoal
        // ── Portal chassis tokens (Round 1) ───────────────────────────────
        rail: "#24201D",           // Two-rail: icon-only dark rail
        "rail-hover": "#2C2823",   // Rail icon hover
        "rail-active-bg": "#2F2823", // Rail selected-state bg
        drawer: "#DDD3C4",         // Two-rail: always-open label drawer
        "drawer-hover": "#D0C5B4", // Drawer item hover
        "drawer-active-bg": "#FDFCFA", // Drawer active pill (warm white)
        "elevation-1": "#F4F1EC", // Subtle elevation above background
        "elevation-2": "#FFFFFF", // White card surface
        "primary-dark": "#0D6E87",  // Teal darkened for AA on rail (3.4:1 on #24201D)
        "accent-dark": "#8C4A40",   // Coral darkened for AA on rail (3.1:1 on #24201D)
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        outfit: ['"Outfit"', "sans-serif"],
        drama: ['"Playfair Display"', "serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
    },
  },
  plugins: [],
};
