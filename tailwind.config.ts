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
          50: "#FBF7F1",
          100: "#F7F2EA",
          200: "#E7DED2",
        },
        oat: {
          100: "#F2E8DA",
          200: "#E8D8A8",
        },
        sage: {
          100: "#B7C2AE",
        },
        blush: {
          100: "#D8B7AE",
        },
        sand: {
          100: "#B69B86",
        },
        thread: {
          500: "#B69B86",
          700: "#6F6257",
          900: "#2B241F",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -26px rgba(43, 36, 31, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "soft-grid":
          "radial-gradient(circle at 1px 1px, rgba(111, 98, 87, 0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
