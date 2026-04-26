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
      "sm":   "0.25rem",
      DEFAULT: "0.5rem",
      "md":   "0.75rem",
      "lg":   "1rem",
      "xl":   "1.25rem",
      "2xl":  "1.5rem",
      "3xl":  "2rem",
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

