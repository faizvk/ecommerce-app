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
          light: '#eef2ff',
          medium: '#818cf8',
          DEFAULT: '#4f46e5',
          dark: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(79,70,229,0.07)',
        hover: '0 12px 32px rgba(79,70,229,0.15)',
      },
    },
  },
  plugins: [],
};
