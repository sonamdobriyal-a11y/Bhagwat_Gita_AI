import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Bhagavad Gītā · Kurukshetra field (conversational UI) ─ */
        /* Soft apricot — lighter, editorial orange */
        gita: {
          peacock: "var(--gita-peacock)",
          "peacock-soft": "var(--gita-peacock-soft)",
          twilight: "var(--gita-twilight)",
          brass: "var(--gita-brass)",
          "brass-bright": "var(--gita-brass-bright)",
          saffron: "var(--gita-saffron)",
          "saffron-soft": "var(--gita-saffron-soft)",
          field: "var(--gita-field)",
          "field-warm": "var(--gita-field-warm)",
          "field-deep": "var(--gita-field-deep)",
          chariot: "var(--gita-chariot)",
          earth: "var(--gita-earth)",
          muted: "var(--gita-muted)",
          line: "var(--gita-line)",
          ring: "var(--gita-ring)",
          ember: "var(--gita-ember)",
          ivory: "var(--gita-ivory)",
          lilac: "var(--gita-lilac)",
          haze: "var(--gita-haze)",
        },

        /* ── Surfaces ───────────────────────────────────── */
        surface:   "#FAFAF8",   // body background
        canvas:    "#FFFFFF",   // card / panel background
        subtle:    "#F5F0E8",   // slightly warmer surface
        muted:     "#EDE8E0",   // borders, dividers, tags

        /* ── Amber — brand primary ──────────────────────── */
        amber: {
          50:  "#FFF8F0",
          100: "#FEE9D3",
          200: "#FDD0A0",
          300: "#FAA84C",
          400: "#F07E1A",
          500: "#C45A0A",   // primary CTA
          600: "#A04208",
          700: "#7A2E04",
          800: "#521E02",
          900: "#2E1001",
        },

        /* ── Sage — secondary accent ────────────────────── */
        sage: {
          50:  "#F2F8F6",
          100: "#DCEEE9",
          200: "#B2D8CF",
          300: "#78B8AC",
          400: "#3D9286",
          500: "#1A7A6E",   // secondary
          600: "#115E54",
          700: "#0A4640",
          800: "#052E2A",
          900: "#021A18",
        },

        /* ── Ink — text scale (warm dark) ───────────────── */
        ink: {
          50:  "#FAFAF8",
          100: "#F2EDE6",
          200: "#DDD6CB",
          300: "#B8AFA4",
          400: "#8E857A",
          500: "#6B6055",
          600: "#4E4439",
          700: "#342D23",
          800: "#1E1912",
          900: "#100D08",
        },

        /* ── Keep legacy tokens ─────────────────────────── */
        parchment: "#FAFAF8",
        paper:     "#F5F0E8",
        sand:      "#EDE8E0",
        linen:     "#DDD6CB",
        terra: {
          50:  "#FFF8F0",
          100: "#FEE9D3",
          200: "#FDD0A0",
          300: "#FAA84C",
          400: "#F07E1A",
          500: "#C45A0A",
          600: "#A04208",
          700: "#7A2E04",
          800: "#521E02",
          900: "#2E1001",
        },
        mist:  "#F5F0E8",
        smoke: "#EDE8E0",
        clay:  "#FAA84C",
        lotus: "#E05A78",
      },

      fontFamily: {
        sans:    ["var(--font-sans)",    "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia",   "serif"],
        serif:   ["var(--font-display)", "Georgia",   "serif"],
        epic:    ["var(--font-display)", "Georgia",   "serif"],
      },

      fontSize: {
        "2xs": ["0.65rem", "1rem"],
      },

      letterSpacing: {
        editorial: "0.04em",
        wide2:     "0.12em",
        label:     "0.08em",
      },

      boxShadow: {
        /* Clean, soft material-style shadows */
        xs:          "0 1px 2px rgba(20,14,8,0.06)",
        sm:          "0 1px 3px rgba(20,14,8,0.08), 0 1px 2px rgba(20,14,8,0.06)",
        md:          "0 4px 6px rgba(20,14,8,0.06), 0 2px 4px rgba(20,14,8,0.05)",
        lg:          "0 10px 15px rgba(20,14,8,0.06), 0 4px 6px rgba(20,14,8,0.04)",
        xl:          "0 20px 25px rgba(20,14,8,0.08), 0 8px 10px rgba(20,14,8,0.04)",
        /* hover lift */
        "md-hover":  "0 8px 20px rgba(20,14,8,0.10), 0 3px 8px rgba(20,14,8,0.06)",
        /* amber glow for CTA */
        amber:       "0 4px 14px rgba(200,137,98,0.18)",
        "amber-lg":  "0 6px 24px rgba(200,137,98,0.24)",
        /* legacy */
        card:        "0 1px 3px rgba(20,14,8,0.08), 0 4px 12px rgba(20,14,8,0.05)",
        "card-hover":"0 4px 16px rgba(20,14,8,0.10), 0 2px 6px rgba(20,14,8,0.06)",
        terra:       "0 4px 14px rgba(200,137,98,0.18)",
        gold:        "0 4px 14px rgba(232,165,109,0.22)",
      },

      borderRadius: {
        "4xl": "2rem",
      },

      animation: {
        "fade-up":  "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in":  "fadeIn 0.4s ease forwards",
        float:      "float 6s ease-in-out infinite",
        "spin-slow":"spin 28s linear infinite",
        shimmer:    "shimmer 1.8s linear infinite",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      },

      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
