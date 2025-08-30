/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#141127',
        'card-bg': '#1B1628',
        'card-border': '#2A243E',
      },
    },
  },
  plugins: [],
}
