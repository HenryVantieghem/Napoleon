/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Napoleon AI Luxury Design System
      colors: {
        'napoleon-primary': '#0B0D11',
        'napoleon-primary-lighter': '#1A1D23',
        'napoleon-primary-darker': '#040507',
        'napoleon-gold': '#D4AF37',
        'napoleon-gold-light': '#E6C659',
        'napoleon-gold-dark': '#B8941F',
        'napoleon-platinum': '#C7CAD1',
        'napoleon-platinum-light': '#E5E7EA',
        'napoleon-platinum-dark': '#A9ACB3',
        'napoleon-ivory': '#F6F6F4',
        'napoleon-ivory-soft': '#FAFAF9',
        'napoleon-ivory-warm': '#F8F8F6',
        // Kinetic Luxury colors
        'luxury-black': '#000000',
        'luxury-indigo': '#6366f1',
        'luxury-gold': '#fbbf24',
        'text-luxury': '#ffffff',
        'glass-primary': 'rgba(255, 255, 255, 0.05)',
        // Legacy support
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
        'luxury-display': ['Playfair Display', 'serif'],
        'luxury-heading': ['Inter', 'sans-serif'],
        'luxury-body': ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        heading: ['Inter', 'sans-serif'], 
        body: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
        'fadeIn': 'fadeIn 800ms ease-out',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'gold': '0 16px 32px rgba(212, 175, 55, 0.2)',
        'luxury-sm': '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
        'luxury-md': '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'luxury-lg': '0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'luxury-xl': '0 16px 32px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'glow-gold': '0 0 16px rgba(212, 175, 55, 0.4)',
        'glow-platinum': '0 0 16px rgba(199, 202, 209, 0.3)',
      },
      backgroundSize: {
        '200': '200% 100%',
      },
      backgroundPosition: {
        '0': '0% 0%',
        '200': '200% 0%',
      },
      letterSpacing: {
        'luxury': '0.08em',
      },
    },
  },
  plugins: [],
}