/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter"],
        display: ["DMSans"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        cat: {
          DEFAULT: "var(--color-cat)",
          light: "var(--color-cat-light)",
          accent: "var(--color-cat-accent)",
          foreground: "var(--color-cat-foreground)",
        },
      },
      borderRadius: {
        card: 20,
        btn: 16,
        field: 16,
        sheet: 28,
      },
      boxShadow: {
        soft: "0px 4px 14px rgba(0, 0, 0, 0.05)",
        lift: "0px 10px 30px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
