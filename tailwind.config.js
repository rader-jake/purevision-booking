/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      colors: {
        accent: {
          DEFAULT: '#c9a35f',
          light: '#e3c98d',
          dark: '#9c7a3f',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(201,163,95,0.35), 0 8px 32px -6px rgba(201,163,95,0.35)',
        'glow-white': '0 8px 30px -8px rgba(255,255,255,0.25)',
        'card-lift': '0 20px 40px -16px rgba(0,0,0,0.6)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(3%, -4%) scale(1.08)' },
          '66%': { transform: 'translate(-2%, 3%) scale(0.96)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        blob: 'blob 14s ease-in-out infinite',
        'blob-delay': 'blob 14s ease-in-out infinite 4s',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
