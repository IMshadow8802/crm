/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        bold: 600,       // Poppins 600 for bold
        semibold: 500,   // Poppins 500 for semibold
      },
    },
  },
  plugins: [],
}