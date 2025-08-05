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
  particleCount = 50, 
  mouseAttraction = true,
  className = ''
}: KineticParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)
  const mouseVelocityRef = useRef({ x: 0, y: 0 })
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const lastFrameTime = useRef(Date.now())
  const frameInterval = useRef(1000 / 60) // 60fps target

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
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

    // Initialize particles with enhanced properties
    const initParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        hue: 200 + Math.random() * 80 + Math.sin(i * 0.1) * 20, // Dynamic blue to gold range
      }))
    }

    // Enhanced mouse tracking with velocity
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const newMouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
      
      // Calculate mouse velocity for enhanced effects
      mouseVelocityRef.current = {
        x: newMouse.x - prevMouseRef.current.x,
        y: newMouse.y - prevMouseRef.current.y,
      }
      
      prevMouseRef.current = mouseRef.current
      mouseRef.current = newMouse
    }

    // Performance-optimized animation loop with 60fps targeting
    const animate = () => {
      if (!ctx || dimensions.width === 0 || dimensions.height === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Frame rate limiting for consistent 60fps
      const now = Date.now()
      const elapsed = now - lastFrameTime.current

      if (elapsed < frameInterval.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      lastFrameTime.current = now

      // Optimized canvas clearing with enhanced trail effect
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current
      const mouseVelocity = mouseVelocityRef.current
      const time = Date.now() * 0.001

      particles.forEach((particle, index) => {
        // Enhanced mouse attraction with velocity influence
        if (mouseAttraction) {
          const dx = mouse.x - particle.x
          const dy = mouse.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            const force = (150 - distance) / 150 * 0.003
            const velocityInfluence = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y) * 0.0001
            particle.vx += (dx * force) + (mouseVelocity.x * velocityInfluence)
            particle.vy += (dy * force) + (mouseVelocity.y * velocityInfluence)
          }
          
          // Repulsion when very close for organic feel
          if (distance < 30) {
            const repelForce = (30 - distance) / 30 * 0.01
            particle.vx -= dx * repelForce
            particle.vy -= dy * repelForce
          }
        }

        // Subtle wave motion for organic feel
        particle.x += Math.sin(time + index * 0.1) * 0.2
        particle.y += Math.cos(time + index * 0.15) * 0.15

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Enhanced boundary collision with energy conservation
        if (particle.x <= particle.size || particle.x >= dimensions.width - particle.size) {
          particle.vx *= -0.85
          particle.x = Math.max(particle.size, Math.min(dimensions.width - particle.size, particle.x))
        }
        if (particle.y <= particle.size || particle.y >= dimensions.height - particle.size) {
          particle.vy *= -0.85
          particle.y = Math.max(particle.size, Math.min(dimensions.height - particle.size, particle.y))
        }

        // Adaptive friction based on velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
        const friction = 0.998 - (speed * 0.001)
        particle.vx *= friction
        particle.vy *= friction

        // Dynamic hue shifting for kinetic luxury
        const dynamicHue = particle.hue + Math.sin(time * 0.5 + index * 0.1) * 20

        // Draw particle with enhanced effects
        ctx.save()
        
        // Glow effect
        ctx.shadowColor = `hsla(${dynamicHue}, 70%, 60%, 0.8)`
        ctx.shadowBlur = particle.size * 4
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${dynamicHue}, 80%, 65%, ${particle.opacity})`
        ctx.fill()
        
        // Inner core for depth
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${dynamicHue}, 90%, 80%, ${particle.opacity * 1.2})`
        ctx.fill()
        
        ctx.restore()

        // Enhanced connections with dynamic colors
        particles.forEach(otherParticle => {
          if (particle.id >= otherParticle.id) return
          
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.15
            const avgHue = (dynamicHue + (otherParticle.hue + Math.sin(time * 0.5 + otherParticle.id * 0.1) * 20)) / 2
            
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            
            // Gradient stroke for luxury feel
            const gradient = ctx.createLinearGradient(particle.x, particle.y, otherParticle.x, otherParticle.y)
            gradient.addColorStop(0, `hsla(${dynamicHue}, 70%, 60%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${avgHue}, 70%, 60%, ${opacity * 0.5})`)
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = Math.max(0.5, opacity * 2)
            ctx.stroke()
            ctx.restore()
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
  }, [particleCount, mouseAttraction, dimensions.width, dimensions.height, isClient])

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