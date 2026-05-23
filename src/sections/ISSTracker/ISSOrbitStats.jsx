// src/sections/ISSTracker/ISSOrbitStats.jsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

// ── Animated ring progress ────────────────────────────────────────
function RingProgress({ pct = 0, size = 80, stroke = 4, color = '#00d4ff', label, center }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle cx={size/2} cy={size/2} r={r}
            stroke="rgba(0,212,255,0.08)" strokeWidth={stroke} fill="none" />
          <motion.circle cx={size/2} cy={size/2} r={r}
            stroke={color} strokeWidth={stroke} fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-hud-sm" style={{ color }}>{center}</span>
        </div>
      </div>
      {label && <span className="label-mono text-white/30 text-center">{label}</span>}
    </div>
  )
}

// ── Subsystem status row ──────────────────────────────────────────
function Subsystem({ name, status, value }) {
  const isNom = status === 'NOMINAL'
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="label-mono text-white/35">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`label-mono text-hud-xs ${isNom ? 'text-telemetry' : 'text-solar'}`}>
          {status}
        </span>
        {value && <span className="font-mono text-hud-xs text-white/25 tabular-nums">{value}</span>}
      </div>
    </div>
  )
}

// ── Next pass countdown ───────────────────────────────────────────
function NextPassCountdown() {
  const [secs, setSecs] = useState(2847)   // ~47 min demo value
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const h  = Math.floor(secs / 3600)
  const m  = Math.floor((secs % 3600) / 60)
  const s  = secs % 60
  const ts = `${h > 0 ? h + 'H ' : ''}${String(m).padStart(2,'0')}M ${String(s).padStart(2,'0')}S`
  return (
    <span className="font-mono text-hud-lg text-solar tabular-nums">{ts}</span>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function ISSOrbitStats({ data }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.15 }
    )
  }, [])

  const orbitPct = data ? ((data.timestamp % 5559) / 5559) * 100 : 62
  const altPct   = data ? ((data.alt - 380) / 60) * 100 : 47   // 380–440 km range

  return (
    <div ref={wrapRef} className="h-full flex flex-col gap-4" style={{ opacity: 0 }}>

      {/* Header */}
      <div>
        <div className="label-mono text-white/30 mb-1">MISSION PARAMETERS</div>
        <div className="h-px bg-gradient-to-r from-transparent via-pulsar/20 to-transparent" />
      </div>

      {/* Orbit rings */}
      <div className="panel-glass rounded-sm p-4 relative">
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        <div className="label-mono text-white/30 mb-4">ORBITAL PROGRESS</div>
        <div className="flex items-center justify-around gap-4">
          <RingProgress
            pct={orbitPct}
            size={84}
            color="#00d4ff"
            center={`${orbitPct.toFixed(0)}%`}
            label="CURRENT ORBIT"
          />
          <RingProgress
            pct={altPct}
            size={84}
            color="#00e5a0"
            center={data ? `${data.alt.toFixed(0)}` : '408'}
            label="ALTITUDE KM"
          />
          <RingProgress
            pct={72}
            size={84}
            color="#f5a623"
            center="72%"
            label="FUEL RESERVE"
          />
        </div>

        {/* Orbit counter */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="label-mono text-white/30">ORBIT NO.</span>
          <span className="font-display text-hud-xl text-pulsar text-glow-pulsar tabular-nums">
            47,842
          </span>
        </div>
      </div>

      {/* Next visible pass */}
      <div className="panel-glass rounded-sm p-4 relative">
        <div className="corner-tl" /><div className="corner-tr" />

        <div className="label-mono text-white/30 mb-3">NEXT VISIBLE PASS</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="label-mono text-white/25 mb-1">COUNTDOWN</div>
            <NextPassCountdown />
          </div>
          <div className="text-right">
            <div className="label-mono text-white/25 mb-1">LOCATION</div>
            <span className="font-mono text-hud-sm text-white/60">CAPE CANAVERAL</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: 'MAX ELEV', v: '72°' },
            { l: 'DURATION', v: '6M 14S' },
            { l: 'MAGNITUDE', v: '-3.2' },
          ].map(({ l, v }) => (
            <div key={l} className="text-center">
              <div className="label-mono text-white/20">{l}</div>
              <div className="font-mono text-hud-base text-white/60 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subsystems */}
      <div className="panel-glass rounded-sm p-4 relative flex-1">
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        <div className="label-mono text-white/30 mb-3">SUBSYSTEM STATUS</div>
        <Subsystem name="ECLSS LIFE SUPPORT" status="NOMINAL" value="98.4%" />
        <Subsystem name="SOLAR ARRAYS"       status="NOMINAL" value="84 KW" />
        <Subsystem name="COMMUNICATIONS"     status="NOMINAL" value="S-BAND" />
        <Subsystem name="THERMAL CONTROL"    status="NOMINAL" value="21.4°C" />
        <Subsystem name="GUIDANCE / NAV"     status="NOMINAL" />
        <Subsystem name="DOCKING PORT FWD"   status="DOCKED"  value="SpX-31" />

        {/* Overall health bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="label-mono text-white/25">OVERALL HEALTH</span>
            <span className="label-mono text-telemetry">98.7%</span>
          </div>
          <div className="h-px bg-white/5">
            <motion.div
              className="h-full bg-telemetry"
              initial={{ width: 0 }}
              animate={{ width: '98.7%' }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 1 }}
              style={{ boxShadow: '0 0 6px rgba(0,229,160,0.5)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}