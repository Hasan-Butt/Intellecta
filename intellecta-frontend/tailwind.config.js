/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        theme: {
          page: "var(--bg-page)",
          surface: "var(--bg-surface)",
          sidebar: "var(--bg-sidebar)",
          navbar: "var(--bg-navbar)",
          subtle: "var(--bg-subtle)",
          elevated: "var(--bg-elevated)",
          border: "var(--border-subtle)",
          text: "var(--text-primary)",
          muted: "var(--text-secondary)",
          accent: "var(--primary-accent)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Cap the heaviest utilities at 700 so the UI fonts never trigger
      // browser-synthesised faux bold (which renders much heavier than intended).
      fontWeight: {
        extrabold: "700",
        black: "700",
      },
    },
  },
  plugins: [],
}
