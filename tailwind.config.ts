import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Dark-mode surface scale — rgba values so they layer correctly over the dark bg
        surface: {
          50:  "rgba(255,255,255,0.04)",   // subtle hover bg on glass
          100: "rgba(255,255,255,0.07)",
          200: "rgba(255,255,255,0.12)",   // ghost borders
          300: "rgba(255,255,255,0.22)",
          400: "rgba(255,255,255,0.38)",   // muted icons / text
          500: "rgba(255,255,255,0.52)",   // secondary text
          600: "rgba(255,255,255,0.65)",
          700: "rgba(255,255,255,0.75)",   // labels
          800: "rgba(255,255,255,0.87)",
          900: "#f8f5fd",                  // primary text
        },

        // Cyan — primary brand accent
        brand: {
          50:  "#E7FAFD",
          100: "#BDF2FA",
          200: "#92E9F7",
          300: "#a5f3fc",
          400: "#67e8f9",
          500: "#22d3ee",
          600: "#06b6d4",
          700: "#22d3ee",  // kept bright so active text stays readable
          800: "#0891b2",
          900: "#0e7490",
        },

        // Celestial accents
        nebula:  { DEFAULT: "#ea73fb" },
        stellar: { DEFAULT: "#97a5ff" },

        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },

        // Semantic directional — lightened for dark backgrounds
        up:   { DEFAULT: "#34d399" },  // emerald-400
        down: { DEFAULT: "#fb7185" },  // rose-400
      },

      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      fontSize: {
        "display-md": ["1.875rem", { lineHeight: "2.25rem",  letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.5rem",   { lineHeight: "2rem",     letterSpacing: "-0.02em",  fontWeight: "600" }],
      },

      boxShadow: {
        card:         "0 8px 40px rgba(15,10,40,0.50), inset 0 1px 0 rgba(255,255,255,0.08)",
        "card-hover": "0 12px 60px rgba(15,10,40,0.60), inset 0 1px 0 rgba(255,255,255,0.10)",
        dropdown:     "0 8px 40px rgba(10,8,25,0.70),  inset 0 1px 0 rgba(255,255,255,0.06)",
        topbar:       "0 1px 0 rgba(255,255,255,0.06)",
      },

      keyframes: {
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        "slide-down": "slide-down 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
