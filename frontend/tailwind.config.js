/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb',
        'primary-dark': '#1d4ed8',
        'success': '#059669',
        'danger': '#dc2626',
        'warning': '#d97706',
        'background': '#0f172a',
        'surface': '#1e293b',
        'border': '#334155',
        'text': '#f8fafc',
        'text-secondary': '#94a3b8',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} 