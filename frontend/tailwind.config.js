/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0E14',
          900: '#12161F',
          800: '#1B212D',
          700: '#262E3D',
          600: '#3A4356',
          500: '#586176',
        },
        accent: {
          500: '#5B7FFF',
          400: '#7C9AFF',
        },
        hot: '#FF5C5C',
        warm: '#FFB020',
        cold: '#5B7FFF',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
