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
          light: '#e7eaf6',
          medium: '#a2a8d3',
          DEFAULT: '#38598b',
          dark: '#113f67',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 10px rgba(0,0,0,0.08)',
        hover: '0 12px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
