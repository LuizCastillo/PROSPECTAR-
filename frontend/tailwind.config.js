/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#12100D',
          900: '#1A1712',
          850: '#211D17',
          800: '#28231C',
          700: '#3A332788',
          600: '#4A4032',
          500: '#7A7062',
          400: '#A69C8C',
        },
        paper: '#F3EEE3',
        ember: {
          600: '#C85A28',
          500: '#E8703A',
          400: '#F2905E',
          300: '#F7B085',
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
        ember: '0 8px 24px -8px rgba(232,112,58,0.45)',
      },
    },
  },
  plugins: [],
};
