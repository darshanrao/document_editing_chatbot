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
        bodyText: "var(--body-text)",
        secondaryText: "var(--secondary-text)",
        borderLight: "var(--border)",
        primary: {
          DEFAULT: '#B58BFF',
          dark: '#9F6BFF',
        },
        activeTab: {
          DEFAULT: '#9F6BFF',
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
          bg: '#1C1D20',
          panel: '#2a2e35',
          border: '#E5E5E5',
          lighter: '#1f2228',
        }
      },
      fontFamily: {
        'roboto-condensed': ['var(--font-roboto-condensed)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'legal': ['Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
