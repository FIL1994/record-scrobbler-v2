/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "false",
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
