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
    // Override toàn bộ borderRadius scale → sắc nét, phong cách AI
    borderRadius: {
      "none": "0px",
      "sm":   "2px",
      DEFAULT: "4px",
      "md":   "5px",
      "lg":   "6px",
      "xl":   "8px",
      "2xl":  "10px",
      "3xl":  "12px",
      "full": "9999px",
    },
    // Loại bỏ boxShadow mặc định — giữ flat UI phong cách AI
    boxShadow: {
      "none": "none",
      "sm":   "0 1px 0 0 rgba(255,255,255,0.04)",
      DEFAULT: "0 1px 2px 0 rgba(0,0,0,0.25)",
      "md":   "0 2px 4px 0 rgba(0,0,0,0.20)",
      "lg":   "0 4px 8px 0 rgba(0,0,0,0.20)",
      "xl":   "0 4px 12px 0 rgba(0,0,0,0.18)",
      "2xl":  "0 6px 16px 0 rgba(0,0,0,0.18)",
      "inner": "inset 0 1px 2px 0 rgba(0,0,0,0.2)",
    },
  },
  plugins: [],
};

