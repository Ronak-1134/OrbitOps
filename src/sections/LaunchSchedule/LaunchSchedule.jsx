// src/sections/LaunchSchedule/LaunchSchedule.jsx
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useLaunchData, { getStatus } from '@hooks/useLaunchData'
import CountdownClock   from './CountdownClock'
import LaunchCard       from './LaunchCard'
import LaunchTimeline   from './LaunchTimeline'

gsap.registerPlugin(ScrollTrigger)

// ── Featured "Next Launch" hero card ─────────────────────────────
function NextLaunchHero({ launch }) {
  if (!launch) return null
  const status = getStatus(launch.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative panel-glass rounded-sm p-6 overflow-hidden"
      style={{ border: `1px solid ${status.color}30`, boxShadow: `0 0 40px ${status.glow.replace(/[\d.]+\)$/, '0.06)')}` }}
    >
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />

      {/* Ambient glow blob */}
      <div className="absolute -top-20 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${status.glow.replace(/[\d.]+\)$/, '0.08)')} 0%, transparent 70%)` }} />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <motion.div className="w-2 h-2 rounded-full"
              style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="label-mono" style={{ color: status.color }}>NEXT LAUNCH — {status.code}</span>
          </div>

          <div className="label-mono text-white/35 mb-1">
            {launch.launch_service_provider?.name} · {launch.rocket?.name}
          </div>
          <h3 className="font-display text-hud-2xl text-white/90 tracking-wide leading-tight mb-2">
            {launch.mission?.name ?? launch.name}
          </h3>
          <p className="font-body text-hud-base text-white/35 leading-relaxed max-w-sm">
            {launch.mission?.description ?? 'Mission details pending confirmation.'}
          </p>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="label-mono text-white/25">{launch.pad?.name}</span>
            <span className="text-white/15">·</span>
            <span className="label-mono text-white/25">{launch.pad?.location?.name}</span>
            <span className="text-white/15">·</span>
            <span className="label-mono text-white/25">{launch.mission?.orbit?.abbrev} orbit</span>
          </div>
        </div>

        {/* Right — big countdown */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <CountdownClock net={launch.net} color={status.color} size="large" />

          <div className="text-right">
            <div className="label-mono text-white/20 mb-1">T-0 WINDOW</div>
            <div className="font-mono text-hud-sm text-white/50">
              {new Date(launch.net).toISOString().replace('T', ' ').slice(0, 19)} UTC
            </div>
          </div>

          <div className="flex gap-3">
            <button className="panel-glass px-4 py-2 label-mono text-pulsar hover:bg-pulsar/10 transition-colors duration-200 rounded-sm">
              MISSION BRIEF
            </button>
            {launch.webcast_live && (
              <button className="px-4 py-2 label-mono text-void-950 font-semibold bg-telemetry hover:opacity-90 transition-opacity duration-200 rounded-sm">
                ▶ WATCH LIVE
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Provider filter pills ─────────────────────────────────────────
const PROVIDERS = ['ALL', 'SPACEX', 'NASA', 'ESA', 'JAXA', 'ULA', 'BLUE ORIGIN', 'ROSCOSMOS']

// ── MAIN ─────────────────────────────────────────────────────────
export default function LaunchSchedule() {
  const { launches, loading, error, source } = useLaunchData()
  const sectionRef = useRef(null)
  const headRef    = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const next     = launches[0]
  const upcoming = launches.slice(1)

  // Launch cadence stats
  const goCount  = launches.filter(l => l.status === 'Go for Launch').length
  const agencies = [...new Set(launches.map(l => l.launch_service_provider?.name).filter(Boolean))].length

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-900 overflow-hidden py-14 px-6 lg:px-10"
    >
      {/* ── Background */}
      <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-30"
        style={{ backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(167,139,250,0.04) 0%, transparent 70%)' }} />
      <div className="scanlines opacity-30" />

      {/* ── Header */}
      <div ref={headRef} className="mb-8 relative z-10" style={{ opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-white/30" />
          <span className="label-mono text-white/30 tracking-widest">MODULE 04</span>
        </div>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-hud-4xl text-white/90 tracking-wider">
              LAUNCH <span className="text-white/50">SCHEDULE</span>
            </h2>
            <p className="font-body text-hud-base text-white/35 mt-1 max-w-lg">
              Upcoming orbital launch manifest from global providers.
              Live countdowns, vehicle data, and mission parameters.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 panel-glass px-4 py-2 rounded-sm">
              <span className={`status-dot ${source !== 'fallback' ? 'live' : 'warning'}`} />
              <span className="label-mono text-white/40">
                {source !== 'fallback' ? 'THE SPACE DEVS API' : 'SIMULATION DATA'}
              </span>
              {loading && <span className="label-mono text-pulsar/40 animate-blink ml-1">SYNCING</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
      </div>

      {/* ── Stat strip */}
      <motion.div
        className="relative z-10 panel-glass rounded-sm p-3 flex items-center gap-0 overflow-x-auto no-scrollbar mb-5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {[
          { label: 'UPCOMING',    value: launches.length, color: '#00d4ff' },
          { label: 'GO STATUS',   value: goCount,          color: '#00e5a0' },
          { label: 'AGENCIES',    value: agencies,          color: '#f5a623' },
          { label: 'NEXT T-0',    value: next ? new Date(next.net).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—', color:'#a78bfa' },
          { label: 'LAUNCH SITE', value: next?.pad?.name ?? '—', color: '#00d4ff' },
          { label: 'VEHICLE',     value: next?.rocket?.family ?? '—', color: '#00e5a0' },
        ].map(({ label, value, color }) => (
          <div key={label} className="shrink-0 px-5 border-r border-white/5 last:border-0 text-center">
            <div className="label-mono text-white/20 mb-1">{label}</div>
            <div className="font-mono text-hud-lg tabular-nums" style={{ color }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Next launch hero */}
      <div className="relative z-10 mb-5">
        <NextLaunchHero launch={next} />
      </div>

      {/* ── 2-col: cards + timeline */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left — card grid */}
        <div className="space-y-2">
          <div className="label-mono text-white/25 mb-4">UPCOMING MANIFEST</div>
          {upcoming.map((l, i) => (
            <LaunchCard key={l.id} launch={l} index={i} />
          ))}

          {!upcoming.length && !loading && (
            <div className="panel-glass rounded-sm p-8 text-center label-mono text-white/20">
              NO ADDITIONAL LAUNCHES SCHEDULED
            </div>
          )}
        </div>

        {/* Right — timeline */}
        <div className="hidden lg:block lg:sticky lg:top-6">
          <LaunchTimeline launches={launches} />
        </div>
      </div>
    </section>
  )
}