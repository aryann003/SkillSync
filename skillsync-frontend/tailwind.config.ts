import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        card: "#111827",
        accent: "#14b8a6"
      }
    }
  },
  plugins: []
} satisfies Config;
