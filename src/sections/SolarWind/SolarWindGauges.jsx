// src/sections/SolarWind/SolarWindGauges.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

// ── Arc gauge (SVG-based) ─────────────────────────────────────────
function ArcGauge({ value, min, max, label, unit, color, glow, fmt, dangerZone }) {
  const needleRef = useRef(null)
  const valueRef  = useRef(null)
  const prevRef   = useRef(value)

  const SIZE   = 140
  const CX     = SIZE / 2
  const CY     = SIZE / 2 + 10
  const R      = 52
  const START  = -210 * (Math.PI / 180)   // 210° arc sweep
  const SWEEP  = 240 * (Math.PI / 180)

  const pct   = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const angle = START + pct * SWEEP

  // Arc path helpers
  const arcPath = (from, to, r) => {
    const x1 = CX + Math.cos(from) * r
    const y1 = CY + Math.sin(from) * r
    const x2 = CX + Math.cos(to)   * r
    const y2 = CY + Math.sin(to)   * r
    const large = to - from > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const trackEnd = START + SWEEP

  // Animate needle and value on change
  useEffect(() => {
    if (!needleRef.current) return
    gsap.to(needleRef.current, {
      attr: {
        x2: CX + Math.cos(angle) * (R - 10),
        y2: CY + Math.sin(angle) * (R - 10),
      },
      duration: 0.8,
      ease: 'power3.out',
    })

    // Animate value counter
    if (valueRef.current) {
      const obj = { v: prevRef.current }
      gsap.to(obj, {
        v: value,
        duration: 0.7,
        ease: 'power2.out',
        onUpdate: () => {
          if (valueRef.current)
            valueRef.current.textContent = fmt ? fmt(obj.v) : Math.round(obj.v)
        },
      })
    }
    prevRef.current = value
  }, [value, angle, fmt])

  const isDanger = dangerZone && pct >= dangerZone

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE * 0.85} viewBox={`0 0 ${SIZE} ${SIZE}`} overflow="visible">
        <defs>
          <filter id={`gauge-glow-${label}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track arc */}
        <path d={arcPath(START, trackEnd, R)} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />

        {/* Danger zone arc (last 20%) */}
        {dangerZone && (
          <path
            d={arcPath(START + dangerZone * SWEEP, trackEnd, R)}
            fill="none" stroke="rgba(255,61,90,0.15)" strokeWidth="6" strokeLinecap="round"
          />
        )}

        {/* Value arc */}
        {pct > 0 && (
          <path
            d={arcPath(START, START + pct * SWEEP, R)}
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        )}

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const a = START + t * SWEEP
          const x0 = CX + Math.cos(a) * (R + 5)
          const y0 = CY + Math.sin(a) * (R + 5)
          const x1 = CX + Math.cos(a) * (R + 10)
          const y1 = CY + Math.sin(a) * (R + 10)
          return (
            <line key={t} x1={x0} y1={y0} x2={x1} y2={y1}
              stroke={`rgba(0,212,255,${t === 0 || t === 1 ? 0.35 : 0.18})`}
              strokeWidth="1" />
          )
        })}

        {/* Needle */}
        <line
          ref={needleRef}
          x1={CX} y1={CY}
          x2={CX + Math.cos(angle) * (R - 10)}
          y2={CY + Math.sin(angle) * (R - 10)}
          stroke={isDanger ? '#ff3d5a' : color}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r="4" fill={color} opacity="0.8"
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
        <circle cx={CX} cy={CY} r="2" fill="white" opacity="0.9" />

        {/* Value display */}
        <text
          ref={valueRef}
          x={CX} y={CY - 18}
          textAnchor="middle"
          fontFamily='"Orbitron", monospace'
          fontSize="14"
          fontWeight="600"
          fill={isDanger ? '#ff3d5a' : 'rgba(255,255,255,0.9)'}
          style={{ filter: isDanger ? 'drop-shadow(0 0 6px rgba(255,61,90,0.6))' : undefined }}
        >
          {fmt ? fmt(value) : Math.round(value)}
        </text>

        {/* Unit */}
        <text x={CX} y={CY - 4} textAnchor="middle"
          fontFamily='"Share Tech Mono", monospace' fontSize="8"
          fill="rgba(255,255,255,0.3)"
        >{unit}</text>

        {/* Min / max labels */}
        <text x={CX + Math.cos(START) * (R + 18)} y={CY + Math.sin(START) * (R + 18) + 3}
          textAnchor="middle" fontFamily='"Share Tech Mono", monospace' fontSize="7"
          fill="rgba(0,212,255,0.3)">{min}</text>
        <text x={CX + Math.cos(trackEnd) * (R + 18)} y={CY + Math.sin(trackEnd) * (R + 18) + 3}
          textAnchor="middle" fontFamily='"Share Tech Mono", monospace' fontSize="7"
          fill="rgba(0,212,255,0.3)">{max}</text>
      </svg>

      {/* Label */}
      <span className="label-mono text-white/40 -mt-2">{label}</span>

      {/* Alert flash */}
      {isDanger && (
        <motion.span
          className="label-mono text-alert mt-1"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          ▲ ELEVATED
        </motion.span>
      )}
    </div>
  )
}

// ── Bz directional indicator ──────────────────────────────────────
function BzIndicator({ bz, bt }) {
  const isNegative = bz < 0    // southward = geoeffective
  const strength   = Math.min(1, Math.abs(bz) / 20)
  const color      = isNegative
    ? `rgba(255,61,90,${0.4 + strength * 0.6})`
    : `rgba(0,229,160,${0.4 + strength * 0.4})`
  const label      = isNegative ? 'SOUTHWARD — GEOEFFECTIVE' : 'NORTHWARD — QUIET'

  return (
    <div className="panel-glass rounded-sm p-4 relative overflow-hidden">
      <div className="corner-tl" /><div className="corner-tr" />

      <div className="label-mono text-white/30 mb-3">IMF VECTOR</div>

      <div className="flex items-center gap-6">
        {/* Arrow */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" stroke="rgba(0,212,255,0.1)" strokeWidth="1" fill="none" />
            <circle cx="32" cy="32" r="20" stroke="rgba(0,212,255,0.07)" strokeWidth="0.8" fill="none" />
            <motion.line
              x1="32" y1="32"
              x2="32" y2={isNegative ? 10 : 54}
              stroke={isNegative ? '#ff3d5a' : '#00e5a0'}
              strokeWidth="2" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Arrowhead */}
            <motion.polygon
              points={isNegative ? '32,6 28,14 36,14' : '32,58 28,50 36,50'}
              fill={isNegative ? '#ff3d5a' : '#00e5a0'}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <text x="32" y="36" textAnchor="middle"
              fontFamily='"Share Tech Mono", monospace' fontSize="8"
              fill="rgba(255,255,255,0.35)">Bz</text>
          </svg>
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="label-mono text-white/25 mb-0.5">Bz (GSM)</div>
            <div className="font-mono text-hud-xl tabular-nums" style={{ color }}>
              {bz >= 0 ? '+' : ''}{bz.toFixed(1)} <span className="text-hud-xs text-white/30">nT</span>
            </div>
          </div>
          <div>
            <div className="label-mono text-white/25 mb-0.5">Bt TOTAL</div>
            <div className="font-mono text-hud-base text-pulsar/80 tabular-nums">
              {bt.toFixed(1)} <span className="text-hud-xs text-white/30">nT</span>
            </div>
          </div>
          <div className="label-mono mt-1" style={{ color, fontSize: '0.62rem' }}>{label}</div>
        </div>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function SolarWindGauges({ wind, storm }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.3 }
    )
  }, [])

  return (
    <div ref={wrapRef} className="flex flex-col gap-4" style={{ opacity: 0 }}>

      {/* Storm level banner */}
      <div
        className="panel-glass rounded-sm px-4 py-3 flex items-center justify-between"
        style={{ border: `1px solid ${storm.color}30`, boxShadow: `0 0 20px ${storm.glow}` }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: storm.color, boxShadow: `0 0 8px ${storm.color}` }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-display text-hud-lg tracking-wider" style={{ color: storm.color }}>
            {storm.label} — {storm.name}
          </span>
        </div>
        <span className="label-mono text-white/30">GEOMAGNETIC ACTIVITY</span>
      </div>

      {/* 4 arc gauges */}
      <div className="panel-glass rounded-sm p-4 relative">
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        <div className="label-mono text-white/30 mb-4">SOLAR WIND PARAMETERS</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ArcGauge
            value={wind.speed}   min={200} max={900}
            label="WIND SPEED"   unit="km/s"
            color="#00d4ff"      glow="rgba(0,212,255,0.5)"
            dangerZone={0.72}
          />
          <ArcGauge
            value={wind.density} min={0}   max={30}
            label="DENSITY"      unit="p/cm³"
            color="#00e5a0"      glow="rgba(0,229,160,0.5)"
            dangerZone={0.80}
          />
          <ArcGauge
            value={wind.temperature / 1000} min={0} max={500}
            label="TEMPERATURE"  unit="×10³ K"
            color="#f5a623"      glow="rgba(245,166,35,0.5)"
            fmt={v => Math.round(v)}
          />
          <ArcGauge
            value={Math.abs(wind.bz)} min={0} max={30}
            label="|Bz| FIELD"   unit="nT"
            color={wind.bz < 0 ? '#ff3d5a' : '#00e5a0'}
            glow={wind.bz < 0 ? 'rgba(255,61,90,0.5)' : 'rgba(0,229,160,0.4)'}
            dangerZone={0.60}
          />
        </div>
      </div>

      {/* Bz direction */}
      <BzIndicator bz={wind.bz} bt={wind.bt} />
    </div>
  )
}