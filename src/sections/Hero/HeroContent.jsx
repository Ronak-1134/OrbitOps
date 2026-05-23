// src/sections/Hero/HeroContent.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const STATS = [
  { value: '408',    unit: 'KM',  label: 'ISS ALTITUDE'     },
  { value: '2,350',  unit: '+',   label: 'ASTEROIDS TRACKED' },
  { value: '8,100',  unit: '+',   label: 'ACTIVE SATELLITES' },
  { value: 'G1',     unit: '',    label: 'SOLAR ACTIVITY'    },
]

export default function HeroContent() {
  const wrapRef    = useRef(null)
  const badgeRef   = useRef(null)
  const line1Ref   = useRef(null)
  const line2Ref   = useRef(null)
  const line3Ref   = useRef(null)
  const descRef    = useRef(null)
  const statsRef   = useRef(null)
  const statRefs   = useRef([])
  const ctaRef     = useRef(null)
  const dividerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })

      // Badge
      tl.fromTo(badgeRef.current,
        { x: -16, opacity: 0 },
        { x: 0,   opacity: 1, duration: 0.5, ease: 'power3.out' },
        0
      )
      // Divider line draw
      tl.fromTo(dividerRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: 'power3.inOut', transformOrigin: 'left' },
        0.2
      )
      // Headline lines
      tl.fromTo([line1Ref.current, line2Ref.current, line3Ref.current],
        { y: 32, opacity: 0, filter: 'blur(6px)' },
        { y: 0,  opacity: 1, filter: 'blur(0px)',
          duration: 0.75, ease: 'power4.out', stagger: 0.1 },
        0.3
      )
      // Description
      tl.fromTo(descRef.current,
        { y: 12, opacity: 0 },
        { y: 0,  opacity: 1, duration: 0.5, ease: 'power3.out' },
        0.8
      )
      // Stats
      tl.fromTo(statRefs.current,
        { y: 10, opacity: 0 },
        { y: 0,  opacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' },
        1.0
      )
      // CTA
      tl.fromTo(ctaRef.current,
        { y: 10, opacity: 0 },
        { y: 0,  opacity: 1, duration: 0.4, ease: 'power2.out' },
        1.3
      )

      // Animated stat counters
      statRefs.current.forEach((el, i) => {
        if (!el) return
        const stat = STATS[i]
        const numStr = stat.value.replace(/,/g, '')
        const numVal = parseFloat(numStr)
        if (isNaN(numVal)) return
        const display = el.querySelector('.stat-value')
        if (!display) return
        const obj = { v: 0 }
        gsap.to(obj, {
          v: numVal,
          duration: 1.8,
          ease: 'power2.out',
          delay: 1.0 + i * 0.07,
          onUpdate: () => {
            display.textContent = Math.round(obj.v).toLocaleString()
          },
        })
      })
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} className="relative z-10 flex flex-col gap-6 max-w-xl">

      {/* Mission badge */}
      <div ref={badgeRef} className="flex items-center gap-3" style={{ opacity: 0 }}>
        <span className="status-dot live" />
        <span className="label-mono text-telemetry/80 tracking-[0.25em]">
          MISSION CONTROL — LIVE TELEMETRY
        </span>
      </div>

      {/* Divider */}
      <div
        ref={dividerRef}
        className="h-px w-24"
        style={{
          background: 'linear-gradient(90deg, #00d4ff, transparent)',
          scaleX: 0,
        }}
      />

      {/* Headline */}
      <div className="space-y-1">
        <h1 ref={line1Ref} className="font-display text-hud-4xl lg:text-hud-6xl text-white/90 leading-none"
          style={{ opacity: 0 }}>
          REAL-TIME
        </h1>
        <h1 ref={line2Ref} className="font-display text-hud-4xl lg:text-hud-6xl text-pulsar text-glow-pulsar leading-none"
          style={{ opacity: 0 }}>
          SPACE
        </h1>
        <h1 ref={line3Ref} className="font-display text-hud-4xl lg:text-hud-6xl text-white/40 leading-none"
          style={{ opacity: 0 }}>
          INTELLIGENCE
        </h1>
      </div>

      {/* Description */}
      <p ref={descRef} className="font-body text-hud-lg text-white/45 leading-relaxed max-w-sm"
        style={{ opacity: 0 }}>
        Mission-critical orbital intelligence. Live ISS tracking, near-Earth object
        surveillance, and solar activity monitoring — all in one command interface.
      </p>

      {/* Stats grid */}
      <div ref={statsRef} className="grid grid-cols-2 gap-px border border-hud-border/50 rounded-sm overflow-hidden"
        style={{ opacity: 0 }}>
        {STATS.map((stat, i) => (
          <div
            key={i}
            ref={el => statRefs.current[i] = el}
            className="panel-glass p-4 group hover:bg-pulsar/5 transition-colors duration-300"
          >
            <div className="flex items-baseline gap-1">
              <span className="stat-value font-display text-hud-2xl text-white/90 tabular-nums">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="font-mono text-hud-sm text-pulsar/70">{stat.unit}</span>
              )}
            </div>
            <div className="label-mono text-white/30 mt-1">{stat.label}</div>
            {/* Bottom accent */}
            <div className="mt-2 h-px w-0 bg-pulsar group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="flex items-center gap-4" style={{ opacity: 0 }}>
        <button className="
          relative overflow-hidden
          px-6 py-3 font-display text-hud-sm tracking-widest
          bg-pulsar text-void-950 font-semibold
          hover:shadow-pulsar-lg transition-all duration-300
          group
        ">
          <span className="relative z-10">LAUNCH MISSION</span>
          <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
        </button>

        <button className="
          px-6 py-3 font-display text-hud-sm tracking-widest
          panel-glass text-white/60
          hover:text-pulsar hover:border-pulsar/30 transition-all duration-300
          flex items-center gap-2
        ">
          <span>VIEW SYSTEMS</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-1 duration-300">
            <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
