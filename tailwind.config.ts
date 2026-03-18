import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      colors: {
        cream: {
          50: "#fffdf8",
          100: "#F5F3EE",
          200: "#f3e7d7",
        },
        thread: {
          500: "#b77b5d",
          700: "#7a4d35",
          900: "#34211b",
        },
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgba(90, 63, 42, 0.32)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "soft-grid":
          "radial-gradient(circle at 1px 1px, rgba(122, 77, 53, 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
