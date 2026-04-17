/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        primary: '#0f172a',
        secondary: '#64748b',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
