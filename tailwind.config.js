/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
      {
        pattern: /.*-\[[^\]]+\]/,
      },
    ],
    theme: {
      extend: {
        keyframes: {
          'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          'slide-in': {
            '0%': { transform: 'translateX(-10px)', opacity: '0' },
            '100%': { transform: 'translateX(0)', opacity: '1' },
          }
        },
        animation: {
          'fade-in': 'fade-in 0.3s ease-out',
          'slide-in': 'slide-in 0.4s ease-out',
        }
      },
    },
    plugins: [],
  }
  