// src/components/Loader/StarField.jsx
import { useEffect, useRef } from 'react'

export default function StarField({ count = 220, opacity = 0.7 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate stars once
    const stars = Array.from({ length: count }, () => ({
      x:    Math.random(),
      y:    Math.random(),
      r:    Math.random() * 1.4 + 0.2,
      a:    Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.008 + 0.002,
      twinklePhase: Math.random() * Math.PI * 2,
    }))

    // A handful of bright blue-tinted stars
    const brightStars = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 1,
      hue: Math.random() > 0.5 ? '200' : '40',
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(s => {
        const twinkle = Math.sin(t * s.twinkleSpeed * 60 + s.twinklePhase) * 0.3
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(s.a + twinkle) * opacity})`
        ctx.fill()
      })

      brightStars.forEach(s => {
        const cx = s.x * canvas.width
        const cy = s.y * canvas.height
        // Glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.r * 5)
        grad.addColorStop(0, `hsla(${s.hue},80%,80%,0.5)`)
        grad.addColorStop(1, `hsla(${s.hue},80%,80%,0)`)
        ctx.beginPath()
        ctx.arc(cx, cy, s.r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        // Core
        ctx.beginPath()
        ctx.arc(cx, cy, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},90%,95%,0.9)`
        ctx.fill()
      })

      t++
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [count, opacity])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}