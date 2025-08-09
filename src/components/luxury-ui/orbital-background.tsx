'use client'

import { useEffect, useRef } from 'react'

interface OrbitalBackgroundProps {
  particleCount?: number
  className?: string
}

export function OrbitalBackground({ particleCount = 50, className = '' }: OrbitalBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear existing particles
    container.innerHTML = ''

    // Create orbital glow
    const orbitalGlow = document.createElement('div')
    orbitalGlow.className = 'orbital-glow will-change-transform'
    orbitalGlow.style.left = '50%'
    orbitalGlow.style.top = '50%'
    orbitalGlow.style.transform = 'translate(-50%, -50%)'
    orbitalGlow.style.zIndex = '1'
    container.appendChild(orbitalGlow)

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle will-change-transform'
      
      // Random positioning
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = Math.random() * 3 + 1
      const delay = Math.random() * 8
      
      particle.style.left = `${x}%`
      particle.style.top = `${y}%`
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.animationDelay = `-${delay}s`
      particle.style.zIndex = '0'
      
      // Random color variation
      const colors = [
        'rgba(255, 255, 255, 0.6)',
        'rgba(59, 130, 246, 0.4)',
        'rgba(147, 51, 234, 0.4)',
        'rgba(6, 182, 212, 0.3)'
      ]
      particle.style.background = colors[Math.floor(Math.random() * colors.length)]
      
      container.appendChild(particle)
    }

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [particleCount])

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ 
        background: `
          radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)
        ` 
      }}
    />
  )
}

export function StarField({ density = 100 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const stars: Array<{
      x: number
      y: number
      radius: number
      opacity: number
      twinkleSpeed: number
    }> = []

    // Generate stars
    for (let i = 0; i < density; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        // Twinkle effect
        star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01
        star.opacity = Math.max(0.1, Math.min(0.8, star.opacity))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}