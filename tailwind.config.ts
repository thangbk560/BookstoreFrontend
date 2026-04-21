import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4A72FF",
          50: "#EEF2FF",
          100: "#DBE4FF",
          200: "#B8CAFF",
          300: "#94AFFF",
          400: "#7195FF",
          500: "#4A72FF",
          600: "#0B3AFF",
          700: "#002BD1",
          800: "#001F99",
          900: "#001361",
        },
        secondary: {
          DEFAULT: "#FFC947",
          50: "#FFF9E6",
          100: "#FFF2CC",
          200: "#FFE599",
          300: "#FFD966",
          400: "#FFCC33",
          500: "#FFC947",
          600: "#FFB800",
          700: "#CC9300",
          800: "#996E00",
          900: "#664900",
        },
        light: {
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            tertiary: "#94A3B8",
          },
        },
        dark: {
          bg: "#0F172A",
          surface: "#1E293B",
          border: "#334155",
          text: {
            primary: "#F8FAFC",
            secondary: "#CBD5E1",
            tertiary: "#64748B",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.1)",
        "card-dark": "0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)",
        "card-dark-hover": "0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.4)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
