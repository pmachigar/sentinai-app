import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0F172A", 
        surface: "#1E293B",
        primary: "#38BDF8", 
        secondary: "#818CF8", 
        accent: "#F472B6", 
        brand: "#10B981" 
      },
    },
  },
  plugins: [],
};
export default config;
