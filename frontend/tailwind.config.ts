import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F1B2D",
        "navy-light": "#16273D",
        paper: "#F7F9FB",
        card: "#FFFFFF",
        line: "#E5EAF0",
        muted: "#64748B",

        teal: {
          DEFAULT: "#1E8A82",
          dark: "#146760",
          light: "#E4F5F3",
        },

        indigo: { DEFAULT: "#4F5FD6", light: "#EBECFB" },
        amber: { DEFAULT: "#D6892E", light: "#FBF0E1" },
        violet: { DEFAULT: "#8B5CD6", light: "#F1EBFB" },
        rose: { DEFAULT: "#D65F7A", light: "#FBEAEF" },

        risk: {
          low: "#2E9E5B",
          "low-bg": "#E7F7ED",
          medium: "#D6952E",
          "medium-bg": "#FBF1E1",
          high: "#D6423E",
          "high-bg": "#FBE7E6",
        },
      },
      fontFamily: {
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,27,45,0.04), 0 1px 12px rgba(15,27,45,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
