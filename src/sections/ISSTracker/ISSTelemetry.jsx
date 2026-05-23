// src/sections/ISSTracker/ISSTelemetry.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { staggerItem, staggerContainer } from '@utils/motionVariants'

const AGENCY_COLORS = {
  NASA:      'text-pulsar',
  ESA:       'text-solar',
  ROSCOSMOS: 'text-telemetry',
  JAXA:      'text-alert',
}

function TelRow({ label, value, unit = '', accent = 'pulsar', live }) {
  const accentCls = {
    pulsar:    'text-pulsar',
    solar:     'text-solar',
    telemetry: 'text-telemetry',
    alert:     'text-alert',
    white:     'text-white/70',
  }[accent]

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-hud-border/30">
      <div className="flex items-center gap-2">
        {live && <span className="status-dot live animate-blink shrink-0" />}
        <span className="label-mono text-white/35">{label}</span>
      </div>
      <span className={`font-mono text-hud-sm tabular-nums ${accentCls}`}>
        {value}{unit && <span className="text-white/25 ml-0.5 text-hud-xs">{unit}</span>}
      </span>
    </div>
  )
}

export default function ISSTelemetry({ data, loading, error, crew = [] }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    )
  }, [])

  const lat = data ? `${data.lat >= 0 ? '+' : ''}${data.lat.toFixed(4)}°` : '—'
  const lon = data ? `${data.lon >= 0 ? '+' : ''}${data.lon.toFixed(4)}°` : '—'
  const alt = data ? `${data.alt.toFixed(1)}` : '—'
  const vel = data ? `${(data.velocity / 3.6).toFixed(2)}` : '—'    // → km/s
  const velKmh = data ? Math.round(data.velocity).toLocaleString() : '—'

  return (
    <div ref={wrapRef} className="h-full flex flex-col gap-4" style={{ opacity: 0 }}>

      {/* ── Section header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot live animate-blink" />
          <span className="label-mono text-telemetry/80 tracking-widest">LIVE TELEMETRY</span>
          {loading && <span className="label-mono text-white/20 animate-blink ml-auto">SYNCING</span>}
          {error   && <span className="label-mono text-alert/70 ml-auto">OFFLINE</span>}
        </div>
        <h2 className="font-display text-hud-2xl text-white/90 tracking-wider">ISS TRACKER</h2>
        <div className="mt-1 h-px bg-gradient-to-r from-pulsar/40 to-transparent" />
      </div>

      {/* ── Position */}
      <div className="panel-glass rounded-sm p-4 relative overflow-hidden">
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        <div className="label-mono text-white/30 mb-3">ORBITAL POSITION</div>
        <TelRow label="LATITUDE"   value={lat}    live />
        <TelRow label="LONGITUDE"  value={lon}    live />
        <TelRow label="ALTITUDE"   value={alt}    unit=" KM" accent="telemetry" />
        <TelRow label="VISIBILITY" value={data?.visibility ?? '—'} accent="solar" />
      </div>

      {/* ── Velocity */}
      <div className="panel-glass rounded-sm p-4 relative overflow-hidden">
        <div className="corner-tl" /><div className="corner-tr" />
        <div className="corner-bl" /><div className="corner-br" />

        <div className="label-mono text-white/30 mb-3">VELOCITY VECTOR</div>
        <TelRow label="SPEED"     value={vel}   unit=" KM/S" accent="pulsar" live />
        <TelRow label="SPEED"     value={velKmh} unit=" KM/H" accent="white" />
        <TelRow label="INCLINATION" value="51.64°" accent="solar" />
        <TelRow label="PERIOD"    value="92.68" unit=" MIN" accent="white" />

        {/* Velocity bar */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="label-mono text-white/20">RELATIVE TO MAX ORBITAL</span>
            <span className="label-mono text-pulsar/60">94.2%</span>
          </div>
          <div className="h-px bg-white/5 relative">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pulsar/60 to-pulsar"
              initial={{ width: 0 }}
              animate={{ width: '94.2%' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
              style={{ boxShadow: '0 0 6px rgba(0,212,255,0.6)' }}
            />
          </div>
        </div>
      </div>

      {/* ── Crew */}
      <div className="panel-glass rounded-sm p-4 relative flex-1 min-h-0 overflow-hidden">
        <div className="corner-tl" /><div className="corner-tr" />

        <div className="label-mono text-white/30 mb-3">
          CREW ON BOARD
          <span className="text-pulsar ml-2">{crew.length || 7}</span>
        </div>

        <motion.div
          className="space-y-2 overflow-y-auto no-scrollbar"
          style={{ maxHeight: 180 }}
          variants={staggerContainer(0.07, 0.5)}
          initial="hidden"
          animate="visible"
        >
          {(crew.length ? crew : FALLBACK_CREW).map((c, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pulsar/40 group-hover:bg-pulsar transition-colors duration-200" />
                <span className="font-body text-hud-base text-white/60 group-hover:text-white/90 transition-colors duration-200">
                  {c.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`label-mono text-hud-xs ${AGENCY_COLORS[c.agency] || 'text-white/40'}`}>
                  {c.agency}
                </span>
                <span className="label-mono text-white/25">{c.days}D</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const FALLBACK_CREW = [
  { name: 'O. Kononenko',  agency: 'ROSCOSMOS', days: 219 },
  { name: 'N. Chub',       agency: 'ROSCOSMOS', days: 219 },
  { name: 'T. Pesquet',    agency: 'ESA',       days: 187 },
  { name: 'J. Virts',      agency: 'NASA',      days: 187 },
  { name: 'M. Rubio',      agency: 'NASA',      days: 162 },
  { name: 'S. Prokopyev',  agency: 'ROSCOSMOS', days: 162 },
]