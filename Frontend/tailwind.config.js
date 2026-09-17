/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smartcal: {
          bg: '#F8F3D9',       // Light cream canvas
          surface: '#EBE5C2',  // Soft parchment / bento surface
          accent: '#B9B28A',   // Muted gold/olive border & highlights
          dark: '#504B38',     // Deep espresso / text / high contrast
          darker: '#3B3728',   // Extra deep contrast
          muted: '#8C8563',    // Secondary text
          lightglass: 'rgba(248, 243, 217, 0.75)',
          surfaceglass: 'rgba(235, 229, 194, 0.65)',
          accentglass: 'rgba(185, 178, 138, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(80, 75, 56, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(80, 75, 56, 0.16)',
        'glass-glow': '0 0 25px rgba(185, 178, 138, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
