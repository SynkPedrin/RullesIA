"use client"

import { useState, useEffect, useRef } from "react"

export function CursorParticles() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const particles: any[] = []
    const particleCount = 40

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", resize)
    resize()

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
        
        // Attraction to mouse
        const dx = mousePos.x - this.x
        const dy = mousePos.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          this.x += dx * 0.01
          this.y += dy * 0.01
        }
      }
      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle())

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.update()
        p.draw()
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 * (1 - dist / 100)})`
            ctx.lineWidth = 1
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      })
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePos])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />
}
