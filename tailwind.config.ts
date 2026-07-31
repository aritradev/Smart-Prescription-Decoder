import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
        },
        brand: {
          teal: "var(--brand-primary)",
          emerald: "var(--brand-emerald)",
          light: "var(--brand-light)",
          glow: "var(--brand-glow)",
        },
        cream: {
          50: "#FDFBF7",
          100: "#F6F0E6",
          200: "#EFE4D3",
          300: "#E4D5BF",
          400: "#D8C5AA",
        },
        espresso: {
          800: "#4A3B32",
          900: "#2C1F16",
        },
        chestnut: {
          500: "#A6634B",
          600: "#8C533E",
          700: "#73412B",
        },
        medical: {
          blue: "#3B82F6",
          purple: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px var(--brand-glow)" },
          "50%": { boxShadow: "0 0 30px var(--brand-glow)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s infinite ease-in-out",
        "slide-up": "slide-up 0.4s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        bengali: ["var(--font-hind-siliguri)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
