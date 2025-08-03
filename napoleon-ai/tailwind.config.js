/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Napoleon AI Design Tokens from CLAUDE.md
      colors: {
        primary: {
          background: '#0B0D11',
        },
        accent: {
          gold: '#D4AF37',
        },
        neutral: {
          silver: '#C7CAD1',
        },
        warm: {
          ivory: '#F6F6F4',
        },
      },
      fontFamily: {
        display: ['Shelley Script', 'cursive'],
        heading: ['Canela', 'serif'], 
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        '4': '1rem',
        '8': '2rem', 
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4,0,0.2,1)',
      },
      animation: {
        'ripple': 'ripple 600ms cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}