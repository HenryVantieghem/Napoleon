'use client'

import { useEffect, useRef, useCallback } from 'react'

interface StarfieldProps {
  starCount?: number
  twinkleSpeed?: number
  className?: string
}

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  phase: number
  brightness: number
}

export function Starfield({ 
  starCount = 150, 
  twinkleSpeed = 1,
  className = '' 
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationIdRef = useRef<number | undefined>()
  const lastTimeRef = useRef<number>(0)

  const createStars = useCallback((width: number, height: number): Star[] => {
    const stars: Star[] = []
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * twinkleSpeed,
        phase: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.5
      })
    }
    
    return stars
  }, [starCount, twinkleSpeed])

  const drawStars = useCallback((
    ctx: CanvasRenderingContext2D,
    stars: Star[],
    currentTime: number
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Create starfield gradient background
    const gradient = ctx.createRadialGradient(
      ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
      ctx.canvas.width / 2, ctx.canvas.height / 2, Math.max(ctx.canvas.width, ctx.canvas.height) / 2
    )
    gradient.addColorStop(0, 'rgba(11, 13, 17, 1)')
    gradient.addColorStop(0.7, 'rgba(11, 13, 17, 0.9)')
    gradient.addColorStop(1, 'rgba(11, 13, 17, 0.8)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw stars
    stars.forEach(star => {
      // Calculate twinkling effect
      const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.phase) * 0.3 + 0.7
      const finalOpacity = star.opacity * twinkle * star.brightness

      // Create star glow effect
      const glowRadius = star.radius * 3
      const glowGradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowRadius
      )
      
      // Different star colors for variety
      const colors = [
        `rgba(255, 255, 255, ${finalOpacity * 0.1})`,
        `rgba(59, 130, 246, ${finalOpacity * 0.08})`,
        `rgba(147, 51, 234, ${finalOpacity * 0.06})`,
        `rgba(212, 175, 55, ${finalOpacity * 0.05})`
      ]
      
      const colorIndex = Math.floor(star.x + star.y) % colors.length
      glowGradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`)
      glowGradient.addColorStop(0.3, colors[colorIndex])
      glowGradient.addColorStop(1, 'transparent')

      // Draw glow
      ctx.beginPath()
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Draw main star
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`
      ctx.fill()

      // Add star sparkle effect for brighter stars
      if (star.brightness > 0.8 && twinkle > 0.9) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity * 0.6})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(star.x - star.radius * 2, star.y)
        ctx.lineTo(star.x + star.radius * 2, star.y)
        ctx.moveTo(star.x, star.y - star.radius * 2)
        ctx.lineTo(star.x, star.y + star.radius * 2)
        ctx.stroke()
      }
    })
  }, [])

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    
    if (!canvas || !ctx || starsRef.current.length === 0) return

    // Throttle to 60fps
    if (currentTime - lastTimeRef.current >= 16) {
      drawStars(ctx, starsRef.current, currentTime * 0.001)
      lastTimeRef.current = currentTime
    }

    animationIdRef.current = requestAnimationFrame(animate)
  }, [drawStars])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Recreate stars for new dimensions
    starsRef.current = createStars(rect.width, rect.height)
  }, [createStars])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initial setup
    resizeCanvas()

    // Start animation
    animationIdRef.current = requestAnimationFrame(animate)

    // Handle resize
    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [animate, resizeCanvas])

  return (
    <canvas
      ref={canvasRef}
      className={`imperial-starfield ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  )
}