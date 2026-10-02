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
        surface: "#050810",
        panel: "#0c1424",
        border: "#1e2d45",
        muted: "#7a8ba3",
        accent: "#eef4ff",
        signal: "#3dff9a",
        neon: {
          cyan: "#2ee6ff",
          blue: "#4d9fff",
          violet: "#b48cff",
          amber: "#ffb84d",
          pink: "#ff6eb4",
        },
      },
      boxShadow: {
        "neon-sm": "0 0 16px rgba(46, 230, 255, 0.12)",
        "neon-md": "0 0 28px rgba(46, 230, 255, 0.18), 0 0 0 1px rgba(46, 230, 255, 0.12)",
        "neon-focus": "0 0 48px rgba(46, 230, 255, 0.14), inset 0 0 0 1px rgba(46, 230, 255, 0.2)",
        "neon-green": "0 0 24px rgba(61, 255, 154, 0.2)",
      },
      backgroundImage: {
        "cockpit-mesh":
          "radial-gradient(ellipse 70% 45% at 88% 8%, rgba(77, 159, 255, 0.22), transparent 55%), radial-gradient(ellipse 55% 40% at 8% 92%, rgba(46, 230, 255, 0.12), transparent 50%), linear-gradient(180deg, #050810 0%, #071018 45%, #050810 100%)",
        "cockpit-grid":
          "linear-gradient(rgba(46, 230, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 230, 255, 0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
    },
  },
  plugins: [],
};
