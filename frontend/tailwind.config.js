/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        x: {
          black: '#000000',
          dark: '#16181c',
          blue: '#1d9bf0',
          'blue-hover': '#1a8cd8',
          green: '#00ba7c',
          pink: '#f91880',
          orange: '#ff7a00',
          border: '#2f3336',
          hover: '#080808',
          gray: {
            50: '#eff3f4',
            100: '#d6d9db',
            200: '#a0a4a7',
            300: '#71767b',
            400: '#536471',
            500: '#333639',
            600: '#1d1f23',
            700: '#16181c',
          },
        },
      },
      fontSize: {
        '15': ['15px', '20px'],
        '13': ['13px', '16px'],
      },
    },
  },
  plugins: [],
};
