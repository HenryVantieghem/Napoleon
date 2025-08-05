'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

interface KineticParticlesProps {
  particleCount?: number
  mouseAttraction?: boolean
  className?: string
}

export function KineticParticles({ 
  particleCount = 40, 
  mouseAttraction = true,
  className = ''
}: KineticParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      setDimensions({ width: rect.width, height: rect.height })
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 60 + 200, // Blue to purple range
      }))
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Animation loop
    const animate = () => {
      if (!ctx || dimensions.width === 0 || dimensions.height === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Clear canvas with slight trail effect for smoothness
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      particles.forEach(particle => {
        // Mouse attraction (subtle)
        if (mouseAttraction) {
          const dx = mouse.x - particle.x
          const dy = mouse.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            const force = (120 - distance) / 120 * 0.002
            particle.vx += dx * force
            particle.vy += dy * force
          }
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Boundary collision with soft bounce
        if (particle.x <= 0 || particle.x >= dimensions.width) {
          particle.vx *= -0.8
          particle.x = Math.max(0, Math.min(dimensions.width, particle.x))
        }
        if (particle.y <= 0 || particle.y >= dimensions.height) {
          particle.vy *= -0.8
          particle.y = Math.max(0, Math.min(dimensions.height, particle.y))
        }

        // Friction
        particle.vx *= 0.999
        particle.vy *= 0.999

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`
        ctx.fill()

        // Draw connections (very subtle)
        particles.forEach(otherParticle => {
          if (particle.id >= otherParticle.id) return
          
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80) {
            const opacity = (80 - distance) / 80 * 0.1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2}, 70%, 60%, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation when dimensions are set
    if (dimensions.width > 0) {
      initParticles()
      canvas.addEventListener('mousemove', handleMouseMove)
      animate()
    }

    return () => {
      window.removeEventListener('resize', updateSize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, mouseAttraction, dimensions.width, dimensions.height])

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className={`
        absolute inset-0 pointer-events-none z-0
        ${className}
      `}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  )
}