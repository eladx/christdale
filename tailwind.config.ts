import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14130F",
        surface: "#1E1C17",
        surface2: "#252219",
        ink: "#EDE9DF",
        muted: "#8C8778",
        accent: "#E8622C",
        accentSoft: "#C9A15A",
        line: "#33302A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};

export default config;
