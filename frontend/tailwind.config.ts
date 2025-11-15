import type { Config } from "tailwindcss";

const config: Config = {
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
        primary: {
          DEFAULT: '#a78bfa',
          dark: '#7c3aed',
        },
        pending: {
          DEFAULT: '#fbbf24',
          light: '#fef3c7',
          dark: '#92400e',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#065f46',
        },
        dark: {
          bg: '#1a1d23',
          panel: '#2a2e35',
          border: '#3a3f47',
          lighter: '#1f2228',
        }
      },
    },
  },
  plugins: [],
};

export default config;
