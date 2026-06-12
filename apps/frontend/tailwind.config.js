/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#D8F3DC",
          300: "#95D5B2",
          400: "#74C69D",
          500: "#52B788",
          600: "#40916C",
          700: "#2D6A4F", // ← color principal Saludaldia
          900: "#1B4332",
        },
        surface: {
          light:    "#F5F7F5",
          dark:     "#0D1F15",
          darkCard: "#1B3A27",
        },
        semantic: {
          critical: "#E63946",
          warning:  "#F4A261",
          success:  "#52B788",
          info:     "#4EA8DE",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
