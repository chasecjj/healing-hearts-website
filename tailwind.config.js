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
        background: "#FFFFFF", // White
        foreground: "#2D2D2D", // Dark Charcoal
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
