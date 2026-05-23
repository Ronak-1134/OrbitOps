// src/sections/SolarWind/SolarWind.jsx
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useSolarData, { stormLevel } from '@hooks/useSolarData'
import SolarWindGauges from './SolarWindGauges'
import KpIndexChart    from './KpIndexChart'
import SolarFlareLog   from './SolarFlareLog'

gsap.registerPlugin(ScrollTrigger)

// ── Animated solar wind particle stream ──────────────────────────
function ParticleStream({ speed = 480 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles moving left → right (solar wind direction)
    const COUNT = 120
    const particles = Array.from({ length: COUNT }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (0.4 + Math.random() * 0.8) * (speed / 400),
      vy:  (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.05,
      hue: Math.random() > 0.8 ? 40 : 195,   // mostly cyan, some gold
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x > canvas.width + 4) { p.x = -4; p.y = Math.random() * canvas.height }

        ctx.beginPath()
        // Elongated in travel direction
        ctx.ellipse(p.x, p.y, p.size * 2.5, p.size * 0.8, 0, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

// ── Data stat pill ────────────────────────────────────────────────
function StatPill({ label, value, unit, color = '#00d4ff' }) {
  return (
    <div className="shrink-0 px-5 border-r border-white/5 last:border-0 text-center">
      <div className="label-mono text-white/20 mb-0.5">{label}</div>
      <div className="font-mono text-hud-lg tabular-nums" style={{ color }}>
        {value}
        {unit && <span className="text-hud-xs text-white/25 ml-1">{unit}</span>}
      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function SolarWind() {
  const { wind, kp, flares, loading, error, source, storm, currentKp } = useSolarData()

  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const colLeftRef = useRef(null)
  const colRightRef= useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: sectionRef.current, start: 'top 80%' }
      gsap.fromTo(headRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: st }
      )
      gsap.fromTo([colLeftRef.current, colRightRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          delay: 0.25, scrollTrigger: st }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-800 overflow-hidden py-20 px-6 lg:px-10"
    >
      {/* ── Backgrounds */}
      <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-25"
        style={{ backgroundSize: '40px 40px' }} />
      {/* Solar glow from left (sun direction) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 80% at 0% 50%, rgba(245,166,35,0.06) 0%, transparent 65%)' }} />
      <div className="scanlines opacity-30" />

      {/* Particle stream */}
      <ParticleStream speed={wind.speed} />

      {/* ── Header */}
      <div ref={headRef} className="relative z-10 mb-8" style={{ opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-solar/60" />
          <span className="label-mono text-solar/60 tracking-widest">MODULE 03</span>
        </div>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-hud-4xl text-white/90 tracking-wider">
              SOLAR <span className="text-solar" style={{ textShadow: '0 0 20px rgba(245,166,35,0.5)' }}>WIND</span>
            </h2>
            <p className="font-body text-hud-base text-white/35 mt-1 max-w-lg">
              Real-time interplanetary magnetic field, solar wind plasma,
              geomagnetic Kp-index, and X-ray flare monitoring via NOAA SWPC.
            </p>
          </div>

          <div className="flex items-center gap-3 panel-glass px-4 py-2 rounded-sm">
            <span className={`status-dot ${source === 'noaa' ? 'live' : 'warning'}`} />
            <span className="label-mono text-white/40">
              {source === 'noaa' ? 'NOAA SWPC LIVE' : 'SIMULATION DATA'}
            </span>
            {loading && <span className="label-mono text-pulsar/40 animate-blink ml-1">REFRESHING</span>}
            {error   && <span className="label-mono text-alert/50 ml-1">[OFFLINE]</span>}
          </div>
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-solar/30 via-solar/10 to-transparent" />
      </div>

      {/* ── Stat strip */}
      <motion.div
        className="relative z-10 panel-glass rounded-sm p-3 flex items-center overflow-x-auto no-scrollbar mb-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <StatPill label="WIND SPEED"  value={wind.speed}            unit="km/s" color="#00d4ff" />
        <StatPill label="DENSITY"     value={wind.density}          unit="p/cm³" color="#00e5a0" />
        <StatPill label="Bz"          value={`${wind.bz>=0?'+':''}${wind.bz.toFixed(1)}`}
                                                                    unit="nT"   color={wind.bz < 0 ? '#ff3d5a' : '#00e5a0'} />
        <StatPill label="Bt TOTAL"    value={wind.bt.toFixed(1)}    unit="nT"   color="#00d4ff" />
        <StatPill label="Kp INDEX"    value={currentKp.toFixed(1)}  unit=""     color={storm.color} />
        <StatPill label="STORM LEVEL" value={storm.label}           unit={storm.name} color={storm.color} />
        <StatPill label="TEMP"        value={`${(wind.temperature / 1000).toFixed(0)}k`}
                                                                    unit="K"    color="#f5a623" />
      </motion.div>

      {/* ── 2-column body */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* Left column */}
        <div ref={colLeftRef} className="space-y-5" style={{ opacity: 0 }}>
          <SolarWindGauges wind={wind} storm={storm} />
          <KpIndexChart    kpData={kp} currentKp={currentKp} />
        </div>

        {/* Right column */}
        <div ref={colRightRef} style={{ opacity: 0 }}>
          <SolarFlareLog flares={flares} />
        </div>
      </div>

      {/* ── Aurora forecast strip */}
      <motion.div
        className="relative z-10 mt-6 panel-glass rounded-sm p-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <div>
          <div className="label-mono text-white/25 mb-1">AURORA VIEWABLE</div>
          <div className="font-body text-hud-base text-white/70">
            {currentKp >= 5 ? 'Mid-latitudes' : currentKp >= 3 ? 'High latitudes' : 'Polar regions only'}
          </div>
        </div>
        <div>
          <div className="label-mono text-white/25 mb-1">MIN LATITUDE</div>
          <div className="font-display text-hud-lg text-solar tabular-nums">
            {currentKp >= 7 ? '50°N' : currentKp >= 5 ? '55°N' : currentKp >= 3 ? '60°N' : '68°N'}
          </div>
        </div>
        <div>
          <div className="label-mono text-white/25 mb-1">HF RADIO STATUS</div>
          <div className="font-body text-hud-base"
            style={{ color: flares[0]?.class_letter === 'X' ? '#ff3d5a' : '#00e5a0' }}>
            {flares[0]?.class_letter === 'X' ? 'BLACKOUT — R3' :
             flares[0]?.class_letter === 'M' ? 'DEGRADED — R1' : 'NORMAL'}
          </div>
        </div>
        <div>
          <div className="label-mono text-white/25 mb-1">NEXT 24H FORECAST</div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: storm.color }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="font-body text-hud-base text-white/60">
              {currentKp >= 5 ? 'Continued activity' : 'Decreasing activity'}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}