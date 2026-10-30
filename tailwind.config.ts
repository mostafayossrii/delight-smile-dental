import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#E2BD5A',
          400: '#D9A736',
          500: '#D4AF37',
          600: '#AA8422'
        },
        clinical: {
          500: '#0D9488',
          600: '#0F766E'
        },
        obsidian: {
          950: '#070709',
          900: '#0D0E12',
          800: '#14161D'
        }
      }
    }
  },
  plugins: []
};
export default config;
