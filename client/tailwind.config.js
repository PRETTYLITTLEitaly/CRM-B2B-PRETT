/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0c0d12',
          secondary: '#16181d',
        },
        accent: {
          DEFAULT: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.3)',
        },
        text: {
          main: '#f8fafc',
          dim: '#94a3b8',
        },
        border: '#2d3139',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
