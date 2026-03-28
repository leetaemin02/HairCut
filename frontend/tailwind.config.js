/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
        navy: "#0D1B2A",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        serif: ["'Space Grotesk'", "serif"],
        logo: ["'Jacques Francois Shadow'", "serif"],
      },
    },
  },
  plugins: [],
};
