/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        surface: "#0c0d10",
        panel: "#12141a",
        border: "#252830",
        muted: "#8b909a",
        accent: "#e6e8ec",
        signal: "#6b9e7a",
      },
    },
  },
  plugins: [],
};
