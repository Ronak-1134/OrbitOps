// src/sections/Hero/HeroHUD.jsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

// ── Live clock hook ───────────────────────────────────────────────
function useLiveClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── Animated data value ───────────────────────────────────────────
function DataRow({ label, value, unit, accent = 'pulsar', bar, blink }) {
  const accentClass = {
    pulsar:   'text-pulsar',
    solar:    'text-solar',
    telemetry:'text-telemetry',
    alert:    'text-alert',
  }[accent]

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="label-mono text-white/35 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5">
        {blink && <span className="status-dot live animate-blink shrink-0" />}
        <span className={`font-mono text-hud-sm tabular-nums ${accentClass}`}>
          {value}
          {unit && <span className="text-white/30 ml-0.5">{unit}</span>}
        </span>
      </div>
    </div>
  )
}

// ── ISS Panel ─────────────────────────────────────────────────────
function ISSPanel() {
  const [angle, setAngle] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setAngle(a => (a + 0.42) % 360), 100)
    return () => clearInterval(id)
  }, [])

  const lat = (Math.sin(angle * Math.PI / 180) * 51.6).toFixed(2)
  const lon = ((angle * 1.7) % 360 - 180).toFixed(2)

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-3">
        <span className="status-dot live animate-blink" />
        <span className="label-mono text-white/60">ISS POSITION</span>
      </div>
      <DataRow label="LAT"  value={`${lat}°`}    accent="pulsar" />
      <DataRow label="LON"  value={`${lon}°`}    accent="pulsar" />
      <DataRow label="ALT"  value="408.3"  unit=" KM"  accent="telemetry" />
      <DataRow label="VEL"  value="27,600" unit=" KM/H" accent="solar" />
      <DataRow label="INC"  value="51.6°"  accent="pulsar" />

      {/* Mini orbit progress bar */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between">
          <span className="label-mono text-white/25">ORBIT</span>
          <span className="label-mono text-pulsar/60">
            {(angle / 360 * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-px bg-white/8 relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-pulsar transition-all duration-100"
            style={{ width: `${(angle / 360) * 100}%`, boxShadow: '0 0 6px #00d4ff' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Solar Activity Panel ──────────────────────────────────────────
function SolarPanel() {
  const bars = [0.65, 0.42, 0.78, 0.35, 0.91, 0.58, 0.47]
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <span className="label-mono text-white/60">SOLAR ACTIVITY</span>
        <span className="label-mono text-solar text-glow-solar">G1 MINOR</span>
      </div>
      <DataRow label="KP-INDEX" value="3.7" accent="solar" />
      <DataRow label="X-RAY"    value="B4.2" unit=" cls" accent="pulsar" />
      <DataRow label="PROTON"   value="0.08" unit=" pfu" accent="telemetry" />

      {/* Miniature bar chart */}
      <div className="mt-3 flex items-end gap-1 h-8">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h * 100}%`,
              background: `rgba(245,166,35,${0.3 + h * 0.5})`,
              boxShadow: h > 0.7 ? '0 0 4px rgba(245,166,35,0.5)' : 'none',
            }}
          />
        ))}
      </div>
      <div className="label-mono text-white/20 text-right">24H KP HISTORY</div>
    </div>
  )
}

// ── Vitals Panel ──────────────────────────────────────────────────
function VitalsPanel({ time }) {
  const utc = time.toISOString().replace('T', ' ').slice(0, 19)
  return (
    <div className="space-y-2">
      <div className="label-mono text-white/30 mb-3 tracking-wider">SYSTEM VITALS</div>
      <DataRow label="UPTIME"    value="99.97" unit="%" accent="telemetry" />
      <DataRow label="LATENCY"   value="12"    unit=" MS" accent="pulsar" />
      <DataRow label="FEEDS"     value="7/7"   accent="telemetry" blink />
      <DataRow label="UTC"       value={utc.slice(11)} accent="pulsar" />
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────
export default function HeroHUD() {
  const time    = useLiveClock()
  const panelRefs = useRef([])

  useEffect(() => {
    gsap.fromTo(panelRefs.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', delay: 1.2 }
    )
  }, [])

  const panelClass = 'panel-glass rounded-sm p-4 min-w-[200px]'

  return (
    <>
      {/* TOP-RIGHT — ISS Panel */}
      <motion.div
        ref={el => panelRefs.current[0] = el}
        className={`absolute top-24 right-6 lg:right-10 ${panelClass} hidden lg:block`}
        style={{ opacity: 0, zIndex: 20 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
      >
        {/* Corner deco */}
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />
        <ISSPanel />
      </motion.div>

      {/* BOTTOM-RIGHT — Solar Panel */}
      <motion.div
        ref={el => panelRefs.current[1] = el}
        className={`absolute bottom-24 right-6 lg:right-10 ${panelClass} hidden lg:block`}
        style={{ opacity: 0, zIndex: 20 }}
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
      >
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />
        <SolarPanel />
      </motion.div>

      {/* BOTTOM-LEFT — Vitals */}
      <motion.div
        ref={el => panelRefs.current[2] = el}
        className={`absolute bottom-24 left-6 lg:left-10 ${panelClass} hidden xl:block`}
        style={{ opacity: 0, zIndex: 20 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
      >
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />
        <VitalsPanel time={time} />
      </motion.div>

      {/* Crosshair — center of canvas */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center hidden lg:flex" style={{ zIndex: 5 }}>
        <div className="relative w-5 h-5">
          <div className="absolute top-1/2 left-0 w-full h-px bg-pulsar/25" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-pulsar/25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-pulsar/30" />
        </div>
      </div>
    </>
  )
}