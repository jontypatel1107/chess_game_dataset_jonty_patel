/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4f46e5',
          DEFAULT: '#4338ca',
          dark: '#3730a3',
        },
        secondary: {
          light: '#ec4899',
          DEFAULT: '#db2777',
          dark: '#be185d',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
