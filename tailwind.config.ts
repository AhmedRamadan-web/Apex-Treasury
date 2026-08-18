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
        "surface": "#081425",
        "surface-dim": "#081425",
        "surface-bright": "#2f3a4c",
        "surface-container-lowest": "#040e1f",
        "surface-container-low": "#111c2d",
        "surface-container": "#152031",
        "surface-container-high": "#1f2a3c",
        "surface-container-highest": "#2a3548",
        "surface-variant": "#2a3548",
        "on-surface": "#d8e3fb",
        "on-surface-variant": "#c7c4d7",
        "inverse-surface": "#d8e3fb",
        "inverse-on-surface": "#263143",
        "outline": "#908fa0",
        "outline-variant": "#464554",
        "surface-tint": "#c0c1ff",
        "primary": "#c0c1ff",
        "on-primary": "#1000a9",
        "primary-container": "#8083ff",
        "on-primary-container": "#0d0096",
        "inverse-primary": "#494bd6",
        "secondary": "#adc6ff",
        "on-secondary": "#002e6a",
        "secondary-container": "#0566d9",
        "on-secondary-container": "#e6ecff",
        "tertiary": "#ffb783",
        "on-tertiary": "#4f2500",
        "tertiary-container": "#d97721",
        "on-tertiary-container": "#452000",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "primary-fixed": "#e1e0ff",
        "primary-fixed-dim": "#c0c1ff",
        "on-primary-fixed": "#07006c",
        "on-primary-fixed-variant": "#2f2ebe",
        "secondary-fixed": "#d8e2ff",
        "secondary-fixed-dim": "#adc6ff",
        "on-secondary-fixed": "#001a42",
        "on-secondary-fixed-variant": "#004395",
        "tertiary-fixed": "#ffdcc5",
        "tertiary-fixed-dim": "#ffb783",
        "on-tertiary-fixed": "#301400",
        "on-tertiary-fixed-variant": "#703700",
        "background": "#081425",
        "on-background": "#d8e3fb"
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        headline: ["Cairo", "sans-serif"],
        body: ["Cairo", "sans-serif"]
      },
      spacing: {
        "stack_lg": "32px",
        "gutter": "24px",
        "sidebar_width": "280px",
        "stack_sm": "8px",
        "margin": "32px",
        "stack_md": "16px",
        "container_max_width": "1440px"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      }
    },
  },
  plugins: [],
};

export default config;
