/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lab Grotesque K', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Brand colors
        kontour: {
          orange: '#FF6B35',
          green: '#4CAF50',
          blue: '#1E88E5',
          purple: '#7C3AED',
          light: '#F5F5F0',
          dark: '#1A1A1A',
        },
        // Legacy colors (compatibility)
        success: '#4CAF50',
        warning: '#FF6B35',
        danger: '#EF4444',
        primary: '#1A1A1A',
        secondary: '#999999',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
