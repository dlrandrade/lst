import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#E9E9E9',
        card: '#FFFFFF',
        ink: '#0A0A0A',
        muted: '#8E8E93',
        faint: '#C7C7CC',
      },
    },
  },
  plugins: [],
} satisfies Config;
