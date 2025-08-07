/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'minecraft-green': '#54c754',
        'minecraft-dark': '#1d1d1d',
        'minecraft-gray': '#555555',
        'minecraft-light': '#aaaaaa',
      },
      fontFamily: {
        'minecraft': ['Minecraft', 'monospace'],
      },
    },
  },
  plugins: [],
} 