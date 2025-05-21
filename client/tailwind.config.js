/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4B79E4", // Primary color
        secondary: "#2584F8", // Secondary color
        darkBg: "#1B1B1F", // Background color for dark mode
        darkCard: "#2C2C34", // Card background color for dark mode
        darkText: "#E4E4E7", // Text color for dark mode
        darkBorder: "#3F3F46", // Border color for dark mode
      },
    },
    animation: {
      float: "float 20s ease-in-out infinite",
    },
    keyframes: {
      float: {
        "0%, 100%": { transform: "translateY(0) translateX(0)" },
        "50%": { transform: "translateY(-100px) translateX(50px)" },
      },
    },
  },
  plugins: [],
};
