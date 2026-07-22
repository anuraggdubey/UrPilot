import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E6',
        ink: '#17160F',
        'ink-soft': '#5C594C',
        surface: '#FFFFFF',
        mustard: {
          DEFAULT: '#EFB92E',
          deep: '#C9950F',
        },
        olive: '#454F32',
        coral: '#C1452B',
        line: 'rgba(23, 22, 15, 0.12)',
        'line-strong': '#17160F',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        flat: '3px 3px 0 0 #17160F',
        'flat-lg': '5px 5px 0 0 #17160F',
      },
      borderRadius: {
        DEFAULT: '0px',
      },
    },
  },
  plugins: [],
} satisfies Config;
