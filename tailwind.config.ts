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
        /** UNO logo: warm orange — CTAs, links, focus */
        primary: "#EA580C",
        /** UNO logo: gold */
        accent: "#F59E0B",
        surface: "#FFFBF7",
        ink: "#0F172A",
        success: "#16A34A",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      fontFamily: {
        /** Matches EaseMyTrip holidays UI (Roboto-first). @see https://www.easemytrip.com/holidays/ */
        sans: [
          "var(--font-roboto)",
          "Roboto",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: [
          "var(--font-roboto)",
          "Roboto",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        /** Banner script line only. */
        script: ["var(--font-dancing-script)", "cursive"],
        /** Alias — same as `sans` (legacy `font-ease` classes). */
        ease: [
          "var(--font-roboto)",
          "Roboto",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.08)",
        lift: "0 20px 40px -12px rgba(234, 88, 12, 0.22)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0b1f36 0%, #1c1917 42%, #9a3412 78%, #ea580c 100%)",
        "accent-sweep":
          "linear-gradient(90deg, #FBBF24, #F97316, #EA580C)",
        "brand-banner":
          "linear-gradient(135deg, #0b1f36 0%, #431407 36%, #c2410c 68%, #f59e0b 100%)",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
