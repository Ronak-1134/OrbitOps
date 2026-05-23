// src/sections/AsteroidRadar/AsteroidRadar.jsx
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useAsteroidData, { THREAT_CONFIG } from '@hooks/useAsteroidData'
import RadarCanvas    from './RadarCanvas'
import AsteroidList   from './AsteroidList'
import AsteroidDetail from './AsteroidDetail'

gsap.registerPlugin(ScrollTrigger)

// ── Stat strip item ───────────────────────────────────────────────
function StatChip({ label, value, accent = 'pulsar' }) {
  const cls = {
    pulsar:    'text-pulsar',
    solar:     'text-solar',
    telemetry: 'text-telemetry',
    alert:     'text-alert',
  }[accent]
  return (
    <div className="shrink-0 text-center px-5 border-r border-white/5 last:border-0">
      <div className="label-mono text-white/20 mb-1">{label}</div>
      <div className={`font-display text-hud-xl tabular-nums ${cls}`}>{value}</div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AsteroidRadar() {
  const { asteroids, loading, error, source } = useAsteroidData()
  const [selected, setSelected] = useState(null)

  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const bodyRef    = useRef(null)

  // Scroll reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      )
      gsap.fromTo(bodyRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Auto-select most critical on load
  useEffect(() => {
    if (asteroids.length && !selected) {
      const critical = asteroids.find(a => a.threat === 'CRITICAL')
        ?? asteroids.find(a => a.threat === 'HIGH')
      if (critical) setSelected(critical)
    }
  }, [asteroids])

  const counts = asteroids.reduce((acc, a) => {
    acc[a.threat] = (acc[a.threat] || 0) + 1
    return acc
  }, {})

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-950 overflow-hidden py-20 px-6 lg:px-10"
    >
      {/* ── Background */}
      <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-30"
        style={{ backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,61,90,0.03) 0%, transparent 70%)' }} />
      <div className="scanlines opacity-40" />

      {/* ── Section header */}
      <div ref={headRef} className="mb-8" style={{ opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-alert/60" />
          <span className="label-mono text-alert/60 tracking-widest">MODULE 02</span>
        </div>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-hud-4xl text-white/90 tracking-wider">
              ASTEROID <span className="text-alert" style={{ textShadow: '0 0 20px rgba(255,61,90,0.4)' }}>RADAR</span>
            </h2>
            <p className="font-body text-hud-base text-white/35 mt-1 max-w-lg">
              Near-Earth object surveillance via NASA NeoWs feed.
              Proximity, threat classification, and orbital parameters — updated daily.
            </p>
          </div>

          {/* Source badge */}
          <div className="flex items-center gap-3 panel-glass px-4 py-2 rounded-sm">
            <span className={`status-dot ${source === 'nasa' ? 'live' : 'warning'}`} />
            <span className="label-mono text-white/40">
              {source === 'nasa' ? 'NASA NeoWs API' : 'SIMULATION DATA'}
            </span>
            {error && <span className="label-mono text-alert/50 ml-1">[API OFFLINE]</span>}
          </div>
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-alert/30 via-alert/10 to-transparent" />
      </div>

      {/* ── MAIN BODY — 3-col */}
      <div
        ref={bodyRef}
        className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-4 items-start"
        style={{ minHeight: 580, opacity: 0 }}
      >

        {/* ── LEFT — Threat list */}
        <div className="panel-glass rounded-sm overflow-hidden"
          style={{ maxHeight: 620, display: 'flex', flexDirection: 'column' }}>
          <div className="corner-tl" /><div className="corner-tr" />
          <div className="corner-bl" /><div className="corner-br" />
          <AsteroidList
            asteroids={asteroids}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
          />
        </div>

        {/* ── CENTER — Radar */}
        <div className="relative panel-glass rounded-sm overflow-hidden flex flex-col">
          <div className="corner-tl" /><div className="corner-tr" />
          <div className="corner-bl" /><div className="corner-br" />

          {/* Radar header */}
          <div className="px-4 py-3 border-b border-hud-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-alert"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ boxShadow: '0 0 6px rgba(255,61,90,0.8)' }}
              />
              <span className="label-mono text-white/40">PROXIMITY RADAR — 60 LD RANGE</span>
            </div>
            <div className="flex items-center gap-4">
              {Object.entries(THREAT_CONFIG).map(([level, cfg]) => (
                <div key={level} className="hidden sm:flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
                  <span className="label-mono text-white/25">{level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar canvas wrapper — square */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full" style={{ paddingBottom: '100%', maxWidth: 520 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <RadarCanvas
                  asteroids={asteroids}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>
            </div>
          </div>

          {/* Radar footer */}
          <div className="px-4 py-2 border-t border-hud-border/20 flex items-center justify-between">
            <span className="label-mono text-white/20">
              SWEEP PERIOD — 4.0 S · {asteroids.length} OBJECTS PLOTTED
            </span>
            <span className="label-mono text-white/20">
              EPOCH {new Date().toISOString().slice(0, 10)}
            </span>
          </div>
        </div>

        {/* ── RIGHT — Detail */}
        <div
          className="panel-glass rounded-sm overflow-y-auto no-scrollbar"
          style={{ maxHeight: 620 }}
        >
          <div className="corner-tl" /><div className="corner-tr" />
          <div className="corner-bl" /><div className="corner-br" />
          <AsteroidDetail asteroid={selected} />
        </div>
      </div>

      {/* ── STAT STRIP */}
      <motion.div
        className="mt-6 panel-glass rounded-sm p-4 flex items-center justify-around overflow-x-auto no-scrollbar"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <StatChip label="TOTAL TRACKED"   value={asteroids.length} accent="pulsar" />
        <StatChip label="CRITICAL"        value={counts.CRITICAL ?? 0} accent="alert" />
        <StatChip label="HIGH RISK"       value={counts.HIGH ?? 0}     accent="solar" />
        <StatChip label="CLOSEST LD"
          value={asteroids.length
            ? Math.min(...asteroids.map(a => parseFloat(a.distLunar))).toFixed(2)
            : '—'}
          accent="alert"
        />
        <StatChip label="FASTEST km/s"
          value={asteroids.length
            ? Math.max(...asteroids.map(a => parseFloat(a.velocity))).toFixed(2)
            : '—'}
          accent="telemetry"
        />
        <StatChip label="LARGEST m"
          value={asteroids.length
            ? Math.max(...asteroids.map(a => parseFloat(a.diamMax))).toFixed(0)
            : '—'}
          accent="solar"
        />
        <StatChip label="DATA SOURCE"     value={source.toUpperCase()} accent="pulsar" />
      </motion.div>
    </section>
  )
}