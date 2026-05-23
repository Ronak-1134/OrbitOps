// src/sections/SolarWind/KpIndexChart.jsx
import { useEffect, useRef } from 'react'
import { stormLevel } from '@hooks/useSolarData'

const BAND_COLORS = [
  { min: 0, max: 5,  fill: 'rgba(0,229,160,0.12)',  label: 'QUIET'    },
  { min: 5, max: 6,  fill: 'rgba(0,212,255,0.15)',  label: 'G1'       },
  { min: 6, max: 7,  fill: 'rgba(245,214,35,0.15)', label: 'G2'       },
  { min: 7, max: 8,  fill: 'rgba(245,166,35,0.15)', label: 'G3'       },
  { min: 8, max: 9,  fill: 'rgba(255,61,90,0.15)',  label: 'G4'       },
  { min: 9, max: 9.9,fill: 'rgba(255,0,64,0.20)',   label: 'G5'       },
]

export default function KpIndexChart({ kpData = [], currentKp = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !kpData.length) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.width
    const H   = canvas.height

    const PAD = { top: 12, right: 16, bottom: 28, left: 32 }
    const cW  = W - PAD.left - PAD.right
    const cH  = H - PAD.top  - PAD.bottom
    const KP_MAX = 9.9

    ctx.clearRect(0, 0, W, H)

    // ── Background + bands
    BAND_COLORS.forEach(band => {
      const y0 = PAD.top + cH * (1 - band.max / KP_MAX)
      const y1 = PAD.top + cH * (1 - band.min / KP_MAX)
      ctx.fillStyle = band.fill
      ctx.fillRect(PAD.left, y0, cW, y1 - y0)
    })

    // ── Horizontal grid lines + Kp labels
    ;[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(k => {
      const y = PAD.top + cH * (1 - k / KP_MAX)
      ctx.beginPath()
      ctx.moveTo(PAD.left, y)
      ctx.lineTo(PAD.left + cW, y)
      ctx.strokeStyle = k % 3 === 0 ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.05)'
      ctx.lineWidth   = k % 3 === 0 ? 0.8 : 0.5
      ctx.stroke()

      if (k % 3 === 0) {
        ctx.font      = '8px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(0,212,255,0.4)'
        ctx.textAlign = 'right'
        ctx.fillText(`${k}`, PAD.left - 5, y + 3)
      }
    })

    // ── Bars
    const barW   = (cW / kpData.length) - 1.5
    const barGap = 1.5

    kpData.forEach((d, i) => {
      const kp   = Math.min(d.kp, KP_MAX)
      const x    = PAD.left + i * (barW + barGap)
      const barH = (kp / KP_MAX) * cH
      const y    = PAD.top + cH - barH
      const lvl  = stormLevel(kp)

      // Bar fill gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barH)
      grad.addColorStop(0, lvl.color)
      grad.addColorStop(1, lvl.color + '44')
      ctx.fillStyle = grad
      ctx.fillRect(x, y, barW, barH)

      // Top cap glow
      ctx.fillStyle = lvl.color
      ctx.fillRect(x, y, barW, 2)

      // Time label (every 4th bar)
      if (i % 4 === 0) {
        ctx.font      = '7px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(0,212,255,0.3)'
        ctx.textAlign = 'center'
        ctx.fillText(d.time_tag || `${i * 3}h`, x + barW / 2, PAD.top + cH + 16)
      }
    })

    // ── Current Kp line
    const kpY = PAD.top + cH * (1 - currentKp / KP_MAX)
    ctx.beginPath()
    ctx.moveTo(PAD.left, kpY)
    ctx.lineTo(PAD.left + cW, kpY)
    ctx.strokeStyle = stormLevel(currentKp).color
    ctx.lineWidth   = 1
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Label on right
    ctx.font      = '8px "Orbitron", monospace'
    ctx.fillStyle = stormLevel(currentKp).color
    ctx.textAlign = 'left'
    ctx.fillText(`Kp ${currentKp.toFixed(1)}`, PAD.left + cW + 3, kpY + 3)

    // ── X axis label
    ctx.font      = '8px "Share Tech Mono", monospace'
    ctx.fillStyle = 'rgba(0,212,255,0.25)'
    ctx.textAlign = 'center'
    ctx.fillText('24-HOUR Kp INDEX HISTORY', PAD.left + cW / 2, H - 3)
  }, [kpData, currentKp])

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.parentElement.offsetWidth
      canvas.height = 180
    })
    ro.observe(canvas.parentElement)
    canvas.width  = canvas.parentElement.offsetWidth
    canvas.height = 180
    return () => ro.disconnect()
  }, [])

  return (
    <div className="panel-glass rounded-sm p-4 relative">
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />

      <div className="flex items-center justify-between mb-3">
        <span className="label-mono text-white/30">PLANETARY Kp INDEX</span>
        <div className="flex items-center gap-3">
          {[0, 3, 5, 7].map(k => {
            const s = stormLevel(k)
            return (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm"
                  style={{ background: s.color, opacity: 0.8 }} />
                <span className="label-mono text-white/25">{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full" />
    </div>
  )
}