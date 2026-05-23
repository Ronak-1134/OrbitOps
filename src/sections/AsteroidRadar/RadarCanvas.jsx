// src/sections/AsteroidRadar/RadarCanvas.jsx
import { useEffect, useRef, useCallback } from 'react'
import { THREAT_CONFIG } from '@hooks/useAsteroidData'

const TWO_PI   = Math.PI * 2
const MAX_DIST = 60   // lunar distances — radar edge

// ── Map asteroid → radar polar coords ────────────────────────────
function asteroidToRadar(ast, cx, cy, r, sweep) {
  const dist  = Math.min(parseFloat(ast.distLunar), MAX_DIST)
  const frac  = dist / MAX_DIST
  const angle = (ast.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000) / 1000 * TWO_PI
  return {
    x:     cx + Math.cos(angle) * frac * r,
    y:     cy + Math.sin(angle) * frac * r,
    angle,
    frac,
    cfg:   THREAT_CONFIG[ast.threat] ?? THREAT_CONFIG.LOW,
    // How long ago sweep passed (0=just swept, 1=full cycle ago)
    trail: ((sweep - angle + TWO_PI) % TWO_PI) / TWO_PI,
  }
}

// ── Draw a single blip ────────────────────────────────────────────
function drawBlip(ctx, ast, cx, cy, r, sweep, selected, ts) {
  const { x, y, trail, cfg } = asteroidToRadar(ast, cx, cy, r, sweep)
  const isSel = selected?.id === ast.id

  // Trail fade — only show in the 60° behind the sweep arm
  const trailWindow = 0.17
  if (trail > trailWindow && !isSel) return

  const alpha = isSel ? 1 : 1 - (trail / trailWindow)

  // Glow halo
  const haloR = isSel ? 14 : 9
  const grad  = ctx.createRadialGradient(x, y, 0, x, y, haloR)
  grad.addColorStop(0, `rgba(0,212,255,${alpha * 0.3})`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.beginPath()
  ctx.arc(x, y, haloR, 0, TWO_PI)
  ctx.fillStyle = grad
  ctx.fill()

  // Core dot
  const dotR = ast.threat === 'CRITICAL' ? 5 :
               ast.threat === 'HIGH'     ? 4 : 3
  ctx.beginPath()
  ctx.arc(x, y, dotR, 0, TWO_PI)
  ctx.fillStyle = `${cfg.color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`
  ctx.fill()

  // Selected ring
  if (isSel) {
    const pulse = 1 + Math.sin(ts / 500) * 0.3
    ctx.beginPath()
    ctx.arc(x, y, 10 * pulse, 0, TWO_PI)
    ctx.strokeStyle = cfg.color
    ctx.lineWidth   = 1
    ctx.globalAlpha = 0.6
    ctx.stroke()
    ctx.globalAlpha = 1

    // Name label
    ctx.font      = '9px "Share Tech Mono", monospace'
    ctx.fillStyle = cfg.color
    ctx.fillText(ast.name.slice(0, 14), x + 14, y - 6)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText(`${ast.distLunar} LD`, x + 14, y + 6)
  }

  // Critical blinking dot center
  if (ast.threat === 'CRITICAL') {
    const blink = (Math.sin(ts / 200) + 1) / 2
    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, TWO_PI)
    ctx.fillStyle = `rgba(255,255,255,${blink * alpha})`
    ctx.fill()
  }
}

export default function RadarCanvas({ asteroids = [], selected, onSelect }) {
  const canvasRef  = useRef(null)
  const sweepRef   = useRef(0)
  const rafRef     = useRef(null)

  const render = useCallback((ts) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.width
    const H   = canvas.height
    const cx  = W / 2
    const cy  = H / 2
    const r   = Math.min(cx, cy) - 12

    sweepRef.current = (sweepRef.current + 0.008) % TWO_PI
    const sweep = sweepRef.current

    ctx.clearRect(0, 0, W, H)

    // ── Background
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    bgGrad.addColorStop(0,   'rgba(6,15,35,0.95)')
    bgGrad.addColorStop(0.7, 'rgba(3,5,15,0.98)')
    bgGrad.addColorStop(1,   'rgba(1,2,10,1)')
    ctx.beginPath()
    ctx.arc(cx, cy, r + 2, 0, TWO_PI)
    ctx.fillStyle = bgGrad
    ctx.fill()

    // ── Concentric range rings
    const RINGS = [0.25, 0.5, 0.75, 1.0]
    RINGS.forEach((frac, i) => {
      ctx.beginPath()
      ctx.arc(cx, cy, r * frac, 0, TWO_PI)
      ctx.strokeStyle = `rgba(0,212,255,${0.08 + i * 0.02})`
      ctx.lineWidth   = i === 3 ? 1.2 : 0.6
      ctx.stroke()

      // Distance label
      const ld = (MAX_DIST * frac).toFixed(0)
      ctx.font      = '8px "Share Tech Mono", monospace'
      ctx.fillStyle = 'rgba(0,212,255,0.25)'
      ctx.fillText(`${ld} LD`, cx + r * frac + 3, cy + 3)
    })

    // ── Crosshair lines
    const CROSSES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
    CROSSES.forEach(a => {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      ctx.strokeStyle = 'rgba(0,212,255,0.07)'
      ctx.lineWidth   = 0.5
      ctx.stroke()
    })

    // ── Diagonal dashes at 45°
    ;[1, 3, 5, 7].forEach(n => {
      const a = n * Math.PI / 4
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * r * 0.1, cy + Math.sin(a) * r * 0.1)
      ctx.lineTo(cx + Math.cos(a) * r,       cy + Math.sin(a) * r)
      ctx.strokeStyle = 'rgba(0,212,255,0.04)'
      ctx.lineWidth   = 0.5
      ctx.setLineDash([2, 4])
      ctx.stroke()
      ctx.setLineDash([])
    })

    // ── Sweep arm + trail cone
    const trailLen  = Math.PI / 2.8
    const sweepGrad = ctx.createConicalGradient
      ? null   // not standard
      : null

    // Sweep trail (manual arc fill)
    const trailGrad = ctx.createLinearGradient(
      cx + Math.cos(sweep - trailLen) * r,
      cy + Math.sin(sweep - trailLen) * r,
      cx + Math.cos(sweep) * r,
      cy + Math.sin(sweep) * r
    )
    trailGrad.addColorStop(0,   'rgba(0,212,255,0)')
    trailGrad.addColorStop(0.6, 'rgba(0,212,255,0.03)')
    trailGrad.addColorStop(1,   'rgba(0,212,255,0.12)')

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, sweep - trailLen, sweep)
    ctx.closePath()
    ctx.fillStyle = trailGrad
    ctx.fill()

    // Sweep arm line
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(sweep) * r, cy + Math.sin(sweep) * r)
    ctx.strokeStyle = 'rgba(0,212,255,0.7)'
    ctx.lineWidth   = 1.2
    ctx.shadowColor = 'rgba(0,212,255,0.8)'
    ctx.shadowBlur  = 6
    ctx.stroke()
    ctx.shadowBlur  = 0

    // ── Earth at center
    const earthR = 10
    const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, earthR)
    eg.addColorStop(0,   '#1a6ed8')
    eg.addColorStop(0.6, '#0a3a70')
    eg.addColorStop(1,   '#041428')
    ctx.beginPath()
    ctx.arc(cx, cy, earthR, 0, TWO_PI)
    ctx.fillStyle = eg
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, earthR, 0, TWO_PI)
    ctx.strokeStyle = 'rgba(0,212,255,0.4)'
    ctx.lineWidth   = 0.8
    ctx.stroke()

    // Moon ring
    ctx.beginPath()
    ctx.arc(cx, cy, r * (1 / MAX_DIST) * 1, 0, TWO_PI)   // 1 LD
    ctx.setLineDash([2, 6])
    ctx.strokeStyle = 'rgba(200,200,200,0.12)'
    ctx.lineWidth   = 0.6
    ctx.stroke()
    ctx.setLineDash([])

    // ── Asteroid blips
    asteroids.forEach(ast => drawBlip(ctx, ast, cx, cy, r, sweep, selected, ts))

    // ── Outer frame ring
    ctx.beginPath()
    ctx.arc(cx, cy, r + 2, 0, TWO_PI)
    ctx.strokeStyle = 'rgba(0,212,255,0.20)'
    ctx.lineWidth   = 1.5
    ctx.stroke()

    // Degree ticks on outer ring
    for (let deg = 0; deg < 360; deg += 10) {
      const a   = (deg * Math.PI) / 180
      const len = deg % 30 === 0 ? 8 : 4
      const x0  = cx + Math.cos(a) * (r + 2)
      const y0  = cy + Math.sin(a) * (r + 2)
      const x1  = cx + Math.cos(a) * (r + 2 - len)
      const y1  = cy + Math.sin(a) * (r + 2 - len)
      ctx.beginPath()
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
      ctx.strokeStyle = `rgba(0,212,255,${deg % 30 === 0 ? 0.35 : 0.12})`
      ctx.lineWidth   = deg % 30 === 0 ? 1 : 0.5
      ctx.stroke()

      if (deg % 90 === 0) {
        ctx.font      = '8px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(0,212,255,0.3)'
        ctx.fillText(`${deg}°`, cx + Math.cos(a) * (r + 14) - 6, cy + Math.sin(a) * (r + 14) + 3)
      }
    }

    rafRef.current = requestAnimationFrame(render)
  }, [asteroids, selected])

  // ── Click → select asteroid ───────────────────────────────────
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect  = canvas.getBoundingClientRect()
    const mx    = e.clientX - rect.left
    const my    = e.clientY - rect.top
    const cx    = canvas.width / 2
    const cy    = canvas.height / 2
    const r     = Math.min(cx, cy) - 12

    let hit = null
    let minDist = 20
    asteroids.forEach(ast => {
      const { x, y } = asteroidToRadar(ast, cx, cy, r, sweepRef.current)
      const d = Math.hypot(mx - x, my - y)
      if (d < minDist) { minDist = d; hit = ast }
    })
    onSelect?.(hit)
  }, [asteroids, onSelect])

  // ── Resize ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const s = Math.min(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight)
      canvas.width  = s
      canvas.height = s
    })
    ro.observe(canvas.parentElement)
    // Initial size
    const s = Math.min(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight)
    canvas.width  = s
    canvas.height = s
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="cursor-crosshair"
      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
    />
  )
}