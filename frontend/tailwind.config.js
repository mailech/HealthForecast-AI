/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
        medical: {
          teal: '#0d9488',
          blue: '#2563eb',
          slate: '#0f172a',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48'
        }
      }
    },
  },
  plugins: [],
}
