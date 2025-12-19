/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Azul Primário
          900: '#0c4a6e', // Azul Profundo
        }
      }
    },
  },
  plugins: [],
}