'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

interface ParticleBackgroundProps {
  particleCount?: number
  className?: string
}

export function ParticleBackground({ 
  particleCount = 50, 
  className = '' 
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [particles, setParticles] = useState<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Luxury color palette for particles (memoized to prevent re-renders)
  const colors = useMemo(() => [
    'rgba(99, 102, 241, 0.6)',   // Luxury indigo
    'rgba(139, 92, 246, 0.5)',   // Luxury purple
    'rgba(251, 191, 36, 0.4)',   // Luxury gold
    'rgba(255, 255, 255, 0.3)',  // Pure white
    'rgba(16, 185, 129, 0.4)',   // Luxury success
  ], [])

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.5, // Slower movement for elegance
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1, // Smaller particles for sophistication
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))

    setParticles(newParticles)
  }, [dimensions, particleCount, colors])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      // Clear canvas with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      setParticles(currentParticles => 
        currentParticles.map(particle => {
          // Update position
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy

          // Bounce off edges
          if (newX <= 0 || newX >= canvas.width) {
            particle.vx *= -1
            newX = Math.max(0, Math.min(canvas.width, newX))
          }
          if (newY <= 0 || newY >= canvas.height) {
            particle.vy *= -1
            newY = Math.max(0, Math.min(canvas.height, newY))
          }

          // Draw particle
          ctx.beginPath()
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()

          // Add subtle glow effect
          ctx.shadowColor = particle.color
          ctx.shadowBlur = particle.size * 2
          ctx.fill()
          ctx.shadowBlur = 0

          return {
            ...particle,
            x: newX,
            y: newY
          }
        })
      )

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) { // Connection distance
            const opacity = (100 - distance) / 100 * 0.2
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particles])

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      />
    </div>
  )
}

// Luxury floating elements component
export function FloatingElements() {
  const elements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 4
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full opacity-10"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))'
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Premium gradient background
export function LuxuryGradientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Primary gradient */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Secondary gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(0, 0, 0, 0.8) 0%, 
              rgba(10, 10, 10, 0.9) 50%, 
              rgba(0, 0, 0, 0.8) 100%
            )
          `
        }}
      />
    </div>
  )
}