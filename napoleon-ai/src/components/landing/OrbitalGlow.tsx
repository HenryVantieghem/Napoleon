'use client'

import { useEffect, useRef } from 'react'

interface OrbitalGlowProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function OrbitalGlow({ className = '', size = 'lg' }: OrbitalGlowProps) {
  const orbitalRef = useRef<HTMLDivElement>(null)

  const sizeConfig = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
    xl: { width: 500, height: 500 }
  }

  const { width, height } = sizeConfig[size]

  useEffect(() => {
    const orbital = orbitalRef.current
    if (!orbital) return

    // Performance optimization: Use GPU acceleration
    orbital.style.willChange = 'transform'
    orbital.style.contain = 'layout style paint'

    return () => {
      if (orbital) {
        orbital.style.willChange = 'auto'
      }
    }
  }, [])

  return (
    <div 
      className={`imperial-orbital-container ${className}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {/* Main Orbital Glow */}
      <div
        ref={orbitalRef}
        className="imperial-orbital-glow"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle,
              rgba(59, 130, 246, 0.8) 0%,
              rgba(147, 51, 234, 0.6) 50%,
              transparent 70%
            )
          `,
          boxShadow: `
            0 0 50px rgba(59, 130, 246, 0.5),
            0 0 100px rgba(147, 51, 234, 0.3),
            0 0 200px rgba(59, 130, 246, 0.2),
            inset 0 0 50px rgba(255, 255, 255, 0.1)
          `,
          animation: 'orbitalRotation 20s linear infinite',
          filter: 'blur(1px)'
        }}
      >
        {/* Inner Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            background: `
              radial-gradient(
                circle,
                transparent 30%,
                rgba(59, 130, 246, 0.4) 70%,
                rgba(147, 51, 234, 0.2) 90%,
                transparent 100%
              )
            `,
            animation: 'orbitalRotation 15s linear infinite reverse'
          }}
        />
        
        {/* Pulse Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            animation: 'orbitalPulse 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Outer Glow Aura */}
      <div
        style={{
          position: 'absolute',
          width: `${width + 100}px`,
          height: `${height + 100}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `
            radial-gradient(
              circle,
              transparent 40%,
              rgba(59, 130, 246, 0.1) 70%,
              transparent 100%
            )
          `,
          animation: 'orbitalBreath 8s ease-in-out infinite',
          zIndex: -1
        }}
      />

      <style jsx>{`
        @keyframes orbitalRotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbitalPulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.1); 
          }
        }

        @keyframes orbitalBreath {
          0%, 100% { 
            opacity: 0.2; 
            transform: translate(-50%, -50%) scale(1); 
          }
          50% { 
            opacity: 0.4; 
            transform: translate(-50%, -50%) scale(1.1); 
          }
        }

        .imperial-orbital-container {
          filter: 
            drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))
            drop-shadow(0 0 40px rgba(147, 51, 234, 0.2));
        }

        @media (max-width: 768px) {
          .imperial-orbital-glow {
            width: ${width * 0.75}px !important;
            height: ${height * 0.75}px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .imperial-orbital-glow,
          .imperial-orbital-glow > div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}