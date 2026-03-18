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

        // Cool neutral slate — replaces warm parchment surface-* scale
        surface: {
          50:  "#f8f9fc",
          100: "#f1f3f8",
          200: "#e4e7f2",
          300: "#cdd2e8",
          400: "#a4accb",
          500: "#6b75a0",
          600: "#4f5880",
          700: "#3a4168",
          800: "#272d52",
          900: "#161b3c",
        },

        // Indigo brand — replaces amber, used on buttons, focus rings, active states
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },

        // Standalone violet and cyan tokens for gradient accents
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

        // Semantic directional — emerald for gains, rose for losses
        up: {
          DEFAULT: "#059669",  // emerald-600
          bg:      "#d1fae5",  // emerald-100
        },
        down: {
          DEFAULT: "#e11d48",  // rose-600
          bg:      "#ffe4e6",  // rose-100
        },
      },

      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      fontSize: {
        "display-lg": ["2.25rem",  { lineHeight: "2.5rem",   letterSpacing: "-0.03em",  fontWeight: "700" }],
        "display-md": ["1.875rem", { lineHeight: "2.25rem",  letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.5rem",   { lineHeight: "2rem",     letterSpacing: "-0.02em",  fontWeight: "600" }],
        "label-xs":   ["0.6875rem", { lineHeight: "1rem",   letterSpacing: "0.07em",   fontWeight: "500" }],
      },

      boxShadow: {
        card:          "0 0px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        "card-hover":  "0 4px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        "card-raised": "0 8px 24px 0 rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.06)",
        dropdown:      "0 4px 16px 0 rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.08)",
        glass:         "0 4px 24px rgba(99,102,241,0.10), 0 1px 2px rgba(0,0,0,0.04)",
        "glass-hover": "0 8px 32px rgba(99,102,241,0.15), 0 2px 6px rgba(0,0,0,0.06)",
        topbar:        "0 2px 12px rgba(99,102,241,0.20)",
        focus:         "0 0 0 3px rgba(99,102,241,0.20)",
      },

      backgroundImage: {
        "gradient-logo":
          "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
        "auth-pattern":
          "radial-gradient(ellipse at 65% 0%, rgba(99,102,241,0.10) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 0% 100%, rgba(139,92,246,0.07) 0%, transparent 45%)",
      },

      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.35" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },

      animation: {
        "fade-in":    "fade-in 0.15s ease-out",
        "slide-down": "slide-down 0.18s ease-out",
        "pulse-dot":  "pulse-dot 1.5s ease-in-out infinite",
        shimmer:      "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
