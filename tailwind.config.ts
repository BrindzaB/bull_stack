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
        up:   { DEFAULT: "#059669" },  // emerald-600
        down: { DEFAULT: "#e11d48" },  // rose-600
      },

      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      fontSize: {
        "display-md": ["1.875rem", { lineHeight: "2.25rem",  letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-sm": ["1.5rem",   { lineHeight: "2rem",     letterSpacing: "-0.02em",  fontWeight: "600" }],
      },

      boxShadow: {
        card:         "0px 0px 0px rgba(0,0,0,0.10), 0px 0px 0px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        dropdown:     "0 4px 16px 0 rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.08)",
        topbar:       "0 2px 12px rgba(99,102,241,0.20)",
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
