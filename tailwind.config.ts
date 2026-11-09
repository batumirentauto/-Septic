import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        emerald: {
          50: 'rgb(var(--c-primary-50, 236 253 245) / <alpha-value>)',
          100: 'rgb(var(--c-primary-100, 209 250 229) / <alpha-value>)',
          200: 'rgb(var(--c-primary-200, 167 243 208) / <alpha-value>)',
          300: 'rgb(var(--c-primary-300, 110 231 183) / <alpha-value>)',
          400: 'rgb(var(--c-primary-400, 52 211 153) / <alpha-value>)',
          500: 'rgb(var(--c-primary-500, 16 185 129) / <alpha-value>)',
          600: 'rgb(var(--c-primary-600, 5 150 105) / <alpha-value>)',
          700: 'rgb(var(--c-primary-700, 4 120 87) / <alpha-value>)',
          800: 'rgb(var(--c-primary-800, 6 95 70) / <alpha-value>)',
          900: 'rgb(var(--c-primary-900, 6 78 59) / <alpha-value>)',
          950: 'rgb(var(--c-primary-950, 2 44 34) / <alpha-value>)',
        },
        cyan: {
          50: 'rgb(var(--c-secondary-50, 236 254 255) / <alpha-value>)',
          100: 'rgb(var(--c-secondary-100, 207 250 254) / <alpha-value>)',
          200: 'rgb(var(--c-secondary-200, 165 243 252) / <alpha-value>)',
          300: 'rgb(var(--c-secondary-300, 103 232 249) / <alpha-value>)',
          400: 'rgb(var(--c-secondary-400, 34 211 238) / <alpha-value>)',
          500: 'rgb(var(--c-secondary-500, 6 182 212) / <alpha-value>)',
          600: 'rgb(var(--c-secondary-600, 8 145 178) / <alpha-value>)',
          700: 'rgb(var(--c-secondary-700, 14 116 144) / <alpha-value>)',
          800: 'rgb(var(--c-secondary-800, 21 94 117) / <alpha-value>)',
          900: 'rgb(var(--c-secondary-900, 22 78 99) / <alpha-value>)',
          950: 'rgb(var(--c-secondary-950, 8 51 68) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
export default config
