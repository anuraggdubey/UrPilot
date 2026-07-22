import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        moss: '#4f6f52',
        coral: '#df6f61',
        mist: '#e8eef1'
      }
    }
  },
  plugins: []
} satisfies Config;
