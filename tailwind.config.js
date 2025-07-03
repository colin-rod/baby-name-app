/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B57EDC',       // lavender
        primaryDark: '#9C6DC5',
        secondary: '#6DBF4B',     // green
        secondaryDark: '#539F3A',
      },
    },
  },
  plugins: [],
}
