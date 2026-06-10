// src/sections/ISSTracker/ISSTracker.jsx
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useISSData from '@hooks/useISSData'
import ISSMap       from './ISSMap'
import ISSTelemetry from './ISSTelemetry'
import ISSOrbitStats from './ISSOrbitStats'

gsap.registerPlugin(ScrollTrigger)

export default function ISSTracker() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const gridRef    = useRef(null)
  const { data, history, loading, error } = useISSData()

  // ── Scroll-triggered reveal ────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
        }
      )
      gsap.fromTo(gridRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-void-900 overflow-hidden py-14 px-6 lg:px-10"
    >
      {/* ── Background layers */}
      <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-40"
        style={{ backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />
      <div className="scanlines opacity-50" />

      {/* ── Section header */}
      <div ref={headRef} className="mb-8" style={{ opacity: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-pulsar/60" />
          <span className="label-mono text-pulsar/60 tracking-widest">MODULE 01</span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-hud-4xl text-white/90 tracking-wider">
              ISS LIVE <span className="text-pulsar">TRACKER</span>
            </h2>
            <p className="font-body text-hud-base text-white/35 mt-1 max-w-md">
              Real-time International Space Station orbital position, velocity telemetry,
              and crew manifest — updated every 5 seconds.
            </p>
          </div>
          <div className="flex items-center gap-3 panel-glass px-4 py-2 rounded-sm">
            <span className="status-dot live animate-blink" />
            <span className="label-mono text-telemetry/80">API CONNECTED</span>
            <span className="label-mono text-white/20">|</span>
            <span className="label-mono text-white/30">wheretheiss.at</span>
          </div>
        </div>

        {/* Full-width divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-pulsar/30 via-pulsar/10 to-transparent" />
      </div>

      {/* ── 3-column grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-4"
        style={{ minHeight: 300, opacity: 0 }}
      >
        {/* Left — Telemetry */}
        <div className="hidden lg:block">
          <ISSTelemetry data={data} loading={loading} error={error} />
        </div>

        {/* Center — World Map */}
        <div className="relative panel-glass rounded-sm overflow-hidden" style={{ minHeight: 280 }}>
          <div className="corner-tl" /><div className="corner-tr" />
          <div className="corner-bl" /><div className="corner-br" />

          <ISSMap data={data} history={history} />

          {/* Map overlays */}
          <div className="absolute top-3 left-3 label-mono text-white/25">
            EQUIRECTANGULAR PROJECTION · WGS84
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-pulsar/40" style={{ borderTop: '1px dashed rgba(0,212,255,0.4)' }} />
              <span className="label-mono text-white/25">TRAIL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-pulsar/20" style={{ borderTop: '1px dashed rgba(0,212,255,0.15)' }} />
              <span className="label-mono text-white/25">PROJECTION</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pulsar" style={{ boxShadow: '0 0 4px #00d4ff' }} />
              <span className="label-mono text-white/25">ISS</span>
            </div>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-void-950/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border border-pulsar/40 border-t-pulsar rounded-full animate-spin" />
                <span className="label-mono text-pulsar/60">ACQUIRING SIGNAL</span>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 panel-glass px-4 py-2 rounded-sm">
              <span className="label-mono text-alert/70">LIVE FEED OFFLINE — SIMULATING</span>
            </div>
          )}
        </div>

        {/* Right — Orbit Stats */}
        <div className="hidden lg:block">
          <ISSOrbitStats data={data} />
        </div>
      </div>

      {/* ── Mobile quick stats (visible only on mobile) */}
      <div className="lg:hidden mt-4 panel-glass rounded-sm p-3 grid grid-cols-2 gap-3">
        {[
          { l:'LATITUDE',  v: data ? `${data.lat.toFixed(2)}°` : '—', c:'#00d4ff' },
          { l:'LONGITUDE', v: data ? `${data.lon.toFixed(2)}°` : '—', c:'#00d4ff' },
          { l:'ALTITUDE',  v: data ? `${data.alt.toFixed(1)} KM` : '—', c:'#00e5a0' },
          { l:'VELOCITY',  v: data ? `${Math.round(data.velocity).toLocaleString()} KM/H` : '—', c:'#f5a623' },
        ].map(({ l, v, c }) => (
          <div key={l} className="text-center">
            <div className="label-mono text-white/20 mb-0.5">{l}</div>
            <div className="font-mono text-hud-sm tabular-nums" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* ── Bottom strip — orbit data bar */}
      <div className="mt-6 panel-glass rounded-sm p-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
        {[
          { label: 'SEMI-MAJOR AXIS', value: '6,779.0 KM' },
          { label: 'ECCENTRICITY',    value: '0.0002370' },
          { label: 'ARG OF PERIGEE',  value: '114.5°' },
          { label: 'MEAN MOTION',     value: '15.49 REV/DAY' },
          { label: 'EPOCH',           value: new Date().toISOString().slice(0, 16) + 'Z' },
          { label: 'DRAG TERM',       value: '0.38792E-4' },
        ].map(({ label, value }) => (
          <div key={label} className="shrink-0 text-center px-4 border-r border-white/5 last:border-0">
            <div className="label-mono text-white/20 mb-1">{label}</div>
            <div className="font-mono text-hud-sm text-pulsar/70 tabular-nums">{value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}