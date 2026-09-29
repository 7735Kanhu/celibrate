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
        brand: {
          50: "#FFF1F6",
          100: "#FCE4EC",
          200: "#F8BBD0",
          300: "#F48FB1",
          400: "#F06292",
          500: "#E91E63", // Primary brand pink
          600: "#D81B60",
          700: "#C2185B", // Primary dark
          800: "#AD1457",
          900: "#880E4F",
          lightBg: "#FFF8FA",
          border: "#F1D5DF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(233, 30, 99, 0.08)",
        card: "0 2px 12px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        "card-hover": "0 12px 28px -4px rgba(233, 30, 99, 0.15), 0 4px 12px 0 rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
