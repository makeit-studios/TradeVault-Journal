import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["Poppins", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"]
      },
      colors: {
        border: "#23272B",
        input: "#586077",
        ring: "#F9CC6F",
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#F9CC6F",
          foreground: "#000000"
        },
        secondary: {
          DEFAULT: "#1F2228",
          foreground: "#BABDC5"
        },
        muted: {
          DEFAULT: "#23272B",
          foreground: "#586077"
        },
        accent: {
          DEFAULT: "#F9CC6F",
          foreground: "#000000"
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF"
        },
        card: {
          DEFAULT: "#1F2228",
          foreground: "#FFFFFF"
        },
        "brand-gold": "#F9CC6F",
        "dark-charcoal": "#1F2228",
        "dark-surface": "#23272B",
        "soft-gray": "#BABDC5",
        "medium-gray": "#586077",
        "success-green": "#22C55E",
        "error-red": "#EF4444",
        "warning-amber": "#F6BF4A"
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
        pill: "33554400px"
      },
      boxShadow: {
        l1: "0px 1px 3px rgba(0, 0, 0, 0.12)",
        l2: "0px 4px 6px rgba(0, 0, 0, 0.16)",
        l3: "0px 10px 15px rgba(0, 0, 0, 0.2)",
        inset: "inset 0px 1px 2px rgba(0, 0, 0, 0.2)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up .45s ease-out both"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
