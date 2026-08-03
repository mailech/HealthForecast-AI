/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0265d2',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        sidebar: '#0f172a',
        card: '#1e293b',
      },
    },
  },
  plugins: [],
}
