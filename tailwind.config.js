/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Napoleon Imperial Design System - CSS Variables Integration
      colors: {
        // Imperial Core Colors
        'imperial-dark': 'var(--imperial-dark)',
        'imperial-gold': 'var(--imperial-gold)',
        'orbital-blue': 'var(--orbital-blue)',
        'executive-white': 'var(--executive-white)',
        
        // Enhanced Glass System
        'glass-0': 'var(--glass-0)',
        'glass-1': 'var(--glass-1)',
        'glass-2': 'var(--glass-2)',
        'glass-border': 'var(--glass-border)',
        
        // Imperial Text Colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        
        // Executive Accents
        'accent-success': 'var(--accent-success)',
        'accent-warning': 'var(--accent-warning)',
        'accent-danger': 'var(--accent-danger)',
        'accent-info': 'var(--accent-info)',
        
        // Legacy Napoleon Colors (maintained for compatibility)
        'napoleon-primary': 'var(--imperial-dark)',
        'napoleon-gold': 'var(--imperial-gold)',
        'luxury-black': '#000000',
        'luxury-indigo': '#6366f1',
        'luxury-gold': 'var(--imperial-gold)',
        'text-luxury': 'var(--executive-white)',
        
        // Legacy support
        primary: {
          background: 'var(--imperial-dark)',
        },
        accent: {
          gold: 'var(--imperial-gold)',
        },
      },
      fontFamily: {
        // Imperial Typography System
        'display': 'var(--font-display)',
        'interface': 'var(--font-interface)',
        'mono': 'var(--font-mono)',
        
        // Napoleon Luxury Fonts (Imperial-powered)
        'napoleon': 'var(--font-display)',
        'luxury-headline': 'var(--font-display)',
        'luxury-body': 'var(--font-interface)',
        
        // Legacy compatibility
        'playfair': 'var(--font-display)',
        'inter': 'var(--font-interface)',
        serif: 'var(--font-display)',
        sans: 'var(--font-interface)',
      },
      spacing: {
        // Imperial Spacing System
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '24': 'var(--space-24)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4,0,0.2,1)',
        'imperial-fast': 'var(--transition-fast)',
        'imperial-base': 'var(--transition-base)',
        'imperial-slow': 'var(--transition-slow)',
        'imperial-spring': 'var(--transition-spring)',
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