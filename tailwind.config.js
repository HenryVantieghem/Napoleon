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
        // Executive Color Psychology (Phase 1)
        'navy-deep': 'var(--navy-deep)',
        'imperial-gold': 'var(--imperial-gold)',
        'orbital-blue': 'var(--orbital-blue)',
        'executive-white': 'var(--executive-white)',
        
        // LCH Color Space System (Phase 2)
        'lch-primary-50': 'var(--lch-primary-50)',
        'lch-primary-100': 'var(--lch-primary-100)',
        'lch-primary-200': 'var(--lch-primary-200)',
        'lch-primary-300': 'var(--lch-primary-300)',
        'lch-primary-400': 'var(--lch-primary-400)',
        'lch-primary-500': 'var(--lch-primary-500)',
        'lch-primary-600': 'var(--lch-primary-600)',
        'lch-primary-700': 'var(--lch-primary-700)',
        'lch-primary-800': 'var(--lch-primary-800)',
        'lch-primary-900': 'var(--lch-primary-900)',
        'lch-primary-950': 'var(--lch-primary-950)',
        
        // LCH Gold System
        'lch-gold-50': 'var(--lch-gold-50)',
        'lch-gold-500': 'var(--lch-gold-500)',
        'lch-gold-600': 'var(--lch-gold-600)',
        'lch-gold-900': 'var(--lch-gold-900)',
        
        // LCH Neutrals
        'lch-neutral-50': 'var(--lch-neutral-50)',
        'lch-neutral-100': 'var(--lch-neutral-100)',
        'lch-neutral-300': 'var(--lch-neutral-300)',
        'lch-neutral-400': 'var(--lch-neutral-400)',
        'lch-neutral-500': 'var(--lch-neutral-500)',
        'lch-neutral-600': 'var(--lch-neutral-600)',
        'lch-neutral-700': 'var(--lch-neutral-700)',
        'lch-neutral-800': 'var(--lch-neutral-800)',
        'lch-neutral-900': 'var(--lch-neutral-900)',
        'lch-neutral-950': 'var(--lch-neutral-950)',
        
        // LCH State Colors
        'lch-success-50': 'var(--lch-success-50)',
        'lch-success-500': 'var(--lch-success-500)',
        'lch-success-600': 'var(--lch-success-600)',
        'lch-success-900': 'var(--lch-success-900)',
        
        'lch-warning-50': 'var(--lch-warning-50)',
        'lch-warning-500': 'var(--lch-warning-500)',
        'lch-warning-600': 'var(--lch-warning-600)',
        'lch-warning-900': 'var(--lch-warning-900)',
        
        'lch-danger-50': 'var(--lch-danger-50)',
        'lch-danger-500': 'var(--lch-danger-500)',
        'lch-danger-600': 'var(--lch-danger-600)',
        'lch-danger-900': 'var(--lch-danger-900)',
        
        // Professional Dark Theme Variables
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-interactive': 'var(--bg-interactive)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-muted': 'var(--text-muted)',
        
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'border-interactive': 'var(--border-interactive)',
        
        'interactive-hover': 'var(--interactive-hover)',
        'interactive-active': 'var(--interactive-active)',
        'interactive-disabled': 'var(--interactive-disabled)',
        
        // Apple Liquid Glass Materials
        'glass-white': 'var(--glass-white)',
        'glass-white-strong': 'var(--glass-white-strong)',
        'glass-white-subtle': 'var(--glass-white-subtle)',
        'glass-black': 'var(--glass-black)',
        'glass-black-strong': 'var(--glass-black-strong)',
        
        // Executive Priority Colors
        'priority-gold': 'var(--priority-gold)',
        'priority-silver': 'var(--priority-silver)',
        'priority-bronze': 'var(--priority-bronze)',
        'priority-standard': 'var(--priority-standard)',
        
        // Semantic Executive Colors
        'success-executive': 'var(--success-executive)',
        'warning-executive': 'var(--warning-executive)',
        'danger-executive': 'var(--danger-executive)',
        'info-executive': 'var(--info-executive)',
        
        // Contextual Glass Materials
        'glass-success': 'var(--glass-success)',
        'glass-warning': 'var(--glass-warning)',
        'glass-danger': 'var(--glass-danger)',
        'glass-info': 'var(--glass-info)',
        
        // Legacy Imperial Colors (maintained for compatibility)
        'imperial-dark': 'var(--navy-deep)',
        'glass-0': 'var(--glass-white-subtle)',
        'glass-1': 'var(--glass-white)',
        'glass-2': 'var(--glass-white-strong)',
        'glass-border': 'var(--glass-white-strong)',
        
        // Imperial Text Colors
        'text-primary': 'var(--executive-white)',
        'text-secondary': 'rgba(255, 255, 255, 0.8)',
        'text-tertiary': 'rgba(255, 255, 255, 0.6)',
        
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