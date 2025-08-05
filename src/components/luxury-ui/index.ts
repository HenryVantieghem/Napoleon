/**
 * Napoleon AI - Luxury UI Components
 * Executive-grade design system implementation
 * Phase 1: Apple Liquid Glass + Tesla Minimalism ✅
 * Phase 2: Linear Professional + Stripe Enterprise ✅
 */

// Kinetic Luxury Components (Phase 1 Complete)
export { LuxuryMotion } from './luxury-motion'
export { ParticleBackground } from './particle-background'
export { OrbitalBackground } from './orbital-background'
export { GlassCard } from './glass-card'
export { Starfield } from './Starfield'
export { OrbitalGlow } from './OrbitalGlow'
export { KineticParticles } from './KineticParticles'

// Executive Layout System (Phase 1)
export { 
  ExecutiveLayout, 
  ExecutiveContentGrid 
} from './ExecutiveLayout'

// Executive Typography System (Phase 1)
export {
  ExecutiveText,
  NapoleonTitle,
  ExecutiveHero,
  ExecutiveHeading,
  ExecutiveSubhead,
  UILarge,
  UIBody,
  UISmall,
  UICaption,
  ExecutiveSection,
  ExecutiveCard,
  ResponsiveText,
  TypographyScale
} from './ExecutiveTypography'

// Stripe Data Visualization System (Phase 2)
export {
  ExecutiveMetricCard,
  ExecutiveDashboard,
  ExecutiveChart
} from './StripeDataVisualization'

// Linear Professional Components (Phase 2)
export {
  LinearButton,
  LinearInput,
  LinearCard,
  LinearBadge,
  LinearModal,
  LinearNavigation,
  LinearToast
} from './LinearComponents'

/**
 * Design System Constants
 * For consistent usage across the application
 */
export const LuxuryConstants = {
  animations: {
    duration: {
      fast: 0.2,
      normal: 0.4, 
      slow: 0.6,
      complex: 0.8
    },
    easing: [0.4, 0, 0.2, 1] as const
  },
  spacing: {
    executive: {
      xs: '0.5rem',    // 8px
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
      '2xl': '3rem',   // 48px
    }
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px', 
    desktop: '1024px',
    executive: '1440px'  // For ultra-wide executive displays
  }
} as const