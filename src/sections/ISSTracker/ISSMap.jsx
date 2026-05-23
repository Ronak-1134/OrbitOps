// src/sections/ISSTracker/ISSMap.jsx
import { useEffect, useRef } from 'react'

// ── Equirectangular projection helpers ────────────────────────────
function lonLatToXY(lon, lat, w, h) {
  return {
    x: ((lon + 180) / 360) * w,
    y: ((90 - lat)  / 180) * h,
  }
}

// ── Build simplified world coastline paths (SVG-style point arrays)
// Using a very simplified set of continent outlines as polyline segments
const CONTINENTS = [
  // North America (simplified)
  [[-168,72],[-140,70],[-100,75],[-80,73],[-65,47],[-60,47],[-65,44],[-70,42],[-75,35],[-80,25],[-87,30],[-95,29],[-97,26],[-105,23],[-110,23],[-117,33],[-124,37],[-124,46],[-130,55],[-135,60],[-150,60],[-160,60],[-168,72]],
  // South America
  [[-80,12],[-62,12],[-52,5],[-50,-1],[-35,-8],[-35,-23],[-50,-30],[-55,-35],[-65,-45],[-70,-55],[-75,-50],[-80,-45],[-80,-35],[-70,-30],[-65,-20],[-70,-10],[-75,0],[-78,5],[-80,12]],
  // Europe
  [[10,72],[30,72],[35,65],[30,60],[25,60],[20,58],[15,57],[10,55],[8,58],[5,58],[0,51],[-5,48],[-8,44],[0,37],[5,36],[10,37],[15,38],[18,40],[20,42],[25,42],[28,46],[30,48],[27,52],[20,55],[15,60],[10,62],[5,62],[2,62],[5,70],[10,72]],
  // Africa
  [[-5,36],[10,37],[30,32],[37,12],[44,12],[50,12],[42,2],[42,-12],[35,-18],[32,-25],[27,-34],[18,-35],[15,-17],[10,-5],[8,5],[2,5],[-5,5],[-15,10],[-17,15],[-17,21],[-10,30],[-5,36]],
  // Asia
  [[30,72],[70,73],[100,73],[140,73],[170,68],[180,65],[170,62],[160,60],[145,45],[140,35],[130,32],[120,25],[110,22],[100,3],[95,6],[85,14],[78,8],[68,23],[62,22],[58,22],[52,25],[48,30],[38,35],[33,37],[28,42],[30,48],[27,52],[35,60],[50,68],[70,72],[30,72]],
  // Australia
  [[114,-22],[120,-18],[130,-12],[136,-12],[140,-17],[148,-20],[152,-25],[152,-38],[145,-38],[138,-35],[130,-32],[122,-34],[115,-34],[114,-28],[114,-22]],
  // Greenland
  [[-45,83],[-18,78],[-18,70],[-25,65],[-40,65],[-55,68],[-60,75],[-45,83]],
]

// ── ISS visibility circle (sub-satellite point radius ~1100km) ────
function drawVisibilityCircle(ctx, cx, cy, w, h) {
  const radiusPx = (1100 / 40075) * w * 0.9
  ctx.beginPath()
  ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,212,255,0.04)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,212,255,0.20)'
  ctx.lineWidth = 0.8
  ctx.setLineDash([4, 6])
  ctx.stroke()
  ctx.setLineDash([])
}

// ── Draw ground track from trail history ──────────────────────────
function drawTrail(ctx, history, w, h) {
  if (history.length < 2) return

  // Split into segments when lon jumps (anti-meridian crossing)
  const segments = []
  let seg = [history[0]]
  for (let i = 1; i < history.length; i++) {
    const dLon = Math.abs(history[i].lon - history[i-1].lon)
    if (dLon > 180) {
      segments.push(seg)
      seg = []
    }
    seg.push(history[i])
  }
  segments.push(seg)

  segments.forEach(s => {
    if (s.length < 2) return
    ctx.beginPath()
    s.forEach((p, i) => {
      const { x, y } = lonLatToXY(p.lon, p.lat, w, h)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = 'rgba(0,212,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.setLineDash([3, 5])
    ctx.stroke()
    ctx.setLineDash([])
  })
}

// ── Draw future ground track projection ──────────────────────────
function drawProjection(ctx, data, w, h) {
  if (!data) return
  const pts = []
  const STEPS = 60
  const STEP_S = 62   // ~1100 km apart per step
  const PERIOD = 5559
  const RE = 6371, ALT = 408, SEMI = RE + ALT
  const MU = 398600.4418
  const inc = 51.6 * Math.PI / 180

  // Build future positions via simple time-steps
  let lat = data.lat * Math.PI / 180
  let lon = data.lon * Math.PI / 180
  for (let i = 0; i < STEPS; i++) {
    pts.push({ lat: lat * 180 / Math.PI, lon: lon * 180 / Math.PI })
    // Approximate angular velocity
    const angVel = (2 * Math.PI) / PERIOD
    lat += angVel * STEP_S * Math.cos(inc) * 0.0           // simplified
    lon += (STEP_S / PERIOD) * 360 * 1.0                   // Earth rotates under
    lon = ((lon + 180) % 360) - 180
    lat = data.lat + Math.sin(i * 0.12) * 45
    lon = data.lon + i * 4.1
    lon = ((lon + 180) % 360) - 180
  }

  ctx.beginPath()
  let jumped = false
  pts.forEach((p, i) => {
    const { x, y } = lonLatToXY(p.lon, p.lat, w, h)
    if (i === 0) { ctx.moveTo(x, y); return }
    const dLon = Math.abs(p.lon - pts[i-1].lon)
    if (dLon > 90) { ctx.moveTo(x, y); return }
    ctx.lineTo(x, y)
  })
  ctx.strokeStyle = 'rgba(0,212,255,0.10)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 8])
  ctx.stroke()
  ctx.setLineDash([])
}

// ── Main canvas component ─────────────────────────────────────────
export default function ISSMap({ data, history }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const pulseRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const render = (ts) => {
      pulseRef.current = ts
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // ── Ocean background
      ctx.fillStyle = 'rgba(3,5,15,0.95)'
      ctx.fillRect(0, 0, W, H)

      // ── Grid lines (lat/lon)
      ctx.strokeStyle = 'rgba(0,212,255,0.05)'
      ctx.lineWidth = 0.5
      for (let lon = -180; lon <= 180; lon += 30) {
        const { x } = lonLatToXY(lon, 0, W, H)
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let lat = -90; lat <= 90; lat += 30) {
        const { y } = lonLatToXY(0, lat, W, H)
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Equator + prime meridian emphasis
      ctx.strokeStyle = 'rgba(0,212,255,0.10)'
      ctx.lineWidth = 0.8
      const { y: eqY } = lonLatToXY(0, 0, W, H)
      const { x: pmX } = lonLatToXY(0, 0, W, H)
      ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pmX, 0); ctx.lineTo(pmX, H); ctx.stroke()

      // ── Continents
      CONTINENTS.forEach(pts => {
        ctx.beginPath()
        pts.forEach(([lon, lat], i) => {
          const { x, y } = lonLatToXY(lon, lat, W, H)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.fillStyle   = 'rgba(20,42,82,0.7)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,212,255,0.18)'
        ctx.lineWidth   = 0.6
        ctx.stroke()
      })

      // ── ISS trail + projection
      drawTrail(ctx, history, W, H)
      drawProjection(ctx, data, W, H)

      if (data) {
        const { x, y } = lonLatToXY(data.lon, data.lat, W, H)

        // Visibility footprint
        drawVisibilityCircle(ctx, x, y, W, H)

        // Pulse rings
        const pulse  = (ts % 2000) / 2000
        const pulse2 = ((ts + 700) % 2000) / 2000
        ;[pulse, pulse2].forEach(p => {
          ctx.beginPath()
          ctx.arc(x, y, p * 28, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,212,255,${(1 - p) * 0.5})`
          ctx.lineWidth = 1
          ctx.stroke()
        })

        // Crosshair
        const cs = 10
        ctx.strokeStyle = 'rgba(0,212,255,0.6)'
        ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.moveTo(x - cs, y); ctx.lineTo(x + cs, y); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, y - cs); ctx.lineTo(x, y + cs); ctx.stroke()

        // ISS dot
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 7)
        grad.addColorStop(0, '#ffffff')
        grad.addColorStop(0.4, '#33eeff')
        grad.addColorStop(1, 'rgba(0,212,255,0)')
        ctx.beginPath()
        ctx.arc(x, y, 7, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        // Coord label
        ctx.font = '9px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(0,212,255,0.7)'
        ctx.fillText(
          `${data.lat >= 0 ? '+' : ''}${data.lat.toFixed(2)}° ${data.lon >= 0 ? '+' : ''}${data.lon.toFixed(2)}°`,
          x + 10, y - 8
        )
      }

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [data, history])

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width  = e.contentRect.width
        canvas.height = e.contentRect.height
      }
    })
    ro.observe(canvas.parentElement)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}