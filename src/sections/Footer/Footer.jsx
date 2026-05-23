// src/sections/Footer/Footer.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const LINKS = {
  MODULES:  ['ISS Tracker','Asteroid Radar','Solar Wind','Launch Schedule'],
  DATA:     ['NASA NeoWs','NOAA SWPC','Where the ISS At','The Space Devs'],
  PROJECT:  ['GitHub','Architecture','API Docs','Changelog'],
}

const STATS = [
  { label:'MODULES ACTIVE', value:'04' },
  { label:'DATA SOURCES',   value:'06' },
  { label:'UPDATE CYCLE',   value:'5S'  },
  { label:'UPTIME',         value:'99.9%' },
]

export default function Footer() {
  const lineRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(lineRef.current,
      { scaleX:0 }, { scaleX:1, duration:1.2, ease:'power3.inOut',
        scrollTrigger:{ trigger:lineRef.current, start:'top 90%' },
        transformOrigin:'left' }
    )
  }, [])

  return (
    <footer className="relative bg-void-950 border-t border-hud-border/30 overflow-hidden">
      <div className="absolute inset-0 bg-hud-grid-lg pointer-events-none opacity-20" />
      <div className="scanlines opacity-20" />

      {/* Top accent line */}
      <div ref={lineRef} className="h-px bg-gradient-to-r from-pulsar/40 via-pulsar/10 to-transparent" style={{ scaleX:0, transformOrigin:'left' }} />

      <div className="relative z-10 px-6 lg:px-10 py-16">
        {/* Brand + stats */}
        <div className="flex flex-col lg:flex-row gap-10 justify-between mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="#00d4ff" strokeWidth="1" opacity="0.4"/>
                <circle cx="14" cy="14" r="7"  stroke="#00d4ff" strokeWidth="1" opacity="0.6"/>
                <circle cx="14" cy="14" r="2.5" fill="#00d4ff"/>
                <ellipse cx="14" cy="14" rx="12" ry="5" stroke="#00d4ff" strokeWidth="0.8" opacity="0.35" transform="rotate(-30 14 14)"/>
              </svg>
              <span className="font-display text-hud-lg tracking-[0.2em]">
                ORBIT<span className="text-pulsar">OPS</span>
              </span>
            </div>
            <p className="font-body text-hud-base text-white/30 leading-relaxed mb-4">
              Real-time space intelligence platform. Built for mission awareness, not mission critical.
            </p>
            <div className="flex items-center gap-2">
              <span className="status-dot live animate-blink" />
              <span className="label-mono text-telemetry/70">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="panel-glass rounded-sm px-4 py-3 text-center">
                <div className="font-display text-hud-2xl text-pulsar">{s.value}</div>
                <div className="label-mono text-white/25 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(LINKS).map(([col, items]) => (
            <div key={col}>
              <div className="label-mono text-pulsar/50 mb-4 tracking-widest">{col}</div>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="font-body text-hud-base text-white/30 hover:text-white/70 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-0 h-px bg-pulsar group-hover:w-3 transition-all duration-300" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="h-px bg-white/5 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="label-mono text-white/20">
            © {new Date().getFullYear()} ORBITOPS — OPEN SOURCE · MIT LICENSE
          </span>
          <div className="flex items-center gap-4">
            <span className="label-mono text-white/15">
              DATA: NASA · NOAA · ESA · WHERETHEISS.AT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-telemetry"
              animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity }} />
            <span className="label-mono text-white/20">
              {new Date().toISOString().slice(0,19).replace('T',' ')} UTC
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}