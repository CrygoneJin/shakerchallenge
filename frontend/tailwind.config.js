/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ksb: {
          blue: '#003F7F',
          lightblue: '#0066CC',
          orange: '#E8500A',
          lightorange: '#FF6B2B',
          gray: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
