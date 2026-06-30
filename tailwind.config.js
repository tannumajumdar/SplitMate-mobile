/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0eeff',
          100: '#e4dfff',
          200: '#ccc3ff',
          300: '#a99aff',
          400: '#8b6dff',
          500: '#7C5CFF',
          600: '#6b3fff',
          700: '#5a2be0',
          800: '#4a22b8',
          900: '#3d1e96',
        },
      },
    },
  },
  plugins: [],
};
