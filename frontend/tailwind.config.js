/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ksb: {
          navy:         '#003063',
          'navy-dark':  '#004884',
          blue:         '#0066b3',
          'blue-mid':   '#3b81c3',
          'blue-light': '#dbeafe',
          'gray-50':    '#f7f7f7',
          'gray-100':   '#f4f4f4',
          'gray-200':   '#e8e8e8',
          'gray-400':   '#9e9e9e',
          'gray-600':   '#58595b',
          'gray-800':   '#2a2a2a',
          cyan:         '#29AAED',
          success:      '#2ECC8D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
