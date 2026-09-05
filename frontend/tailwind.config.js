/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#121317',
          900: '#191B20',
          850: '#20222A',
          800: '#282B34',
          700: '#3A3E4A66',
          600: '#4B5060',
          500: '#6B7080',
          400: '#9BA0AE',
        },
        paper: '#F3F4F6',
        iris: {
          600: '#5B54D6',
          500: '#6E67E8',
          400: '#8B85EF',
          300: '#AFA9F5',
        },
        blueprint: {
          600: '#3A6377',
          500: '#4C7A92',
          400: '#6FA0B8',
          300: '#9CC3D4',
        },
        hot: '#E8703A',
        warm: '#D9A441',
        cold: '#4C7A92',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.5), 0 12px 28px -12px rgba(0,0,0,0.6)',
        'card-light': '0 1px 2px rgba(0,0,0,0.04), 0 8px 20px -8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
