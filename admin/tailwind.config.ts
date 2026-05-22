import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(205, 45%, 25%)',
          light: 'hsl(205, 45%, 35%)',
          dark: 'hsl(205, 45%, 15%)',
        },
        accent: {
          DEFAULT: 'hsl(25, 80%, 50%)',
          light: 'hsl(25, 80%, 60%)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
