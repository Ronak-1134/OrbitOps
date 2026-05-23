// src/sections/Hero/HeroNav.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { cn } from '@utils/cn'

const NAV_LINKS = [
  { id: 'iss',      label: 'ISS TRACKER' },
  { id: 'asteroids',label: 'ASTEROID RADAR' },
  { id: 'solar',    label: 'SOLAR WIND' },
  { id: 'launches', label: 'LAUNCHES' },
]

export default function HeroNav({ activeSection = 'hero' }) {
  const navRef  = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(navRef.current,
      { y: -20, opacity: 0 },
      { y: 0,   opacity: 1, duration: 0.7, ease: 'power3.out' }
    )
    tl.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, ease: 'power3.inOut', transformOrigin: 'left' },
      0.3
    )
  }, [])

  return (
    <nav ref={navRef} className="absolute top-0 inset-x-0 z-30" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between px-6 lg:px-10 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
              <circle cx="14" cy="14" r="12" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
              <circle cx="14" cy="14" r="7"  stroke="#00d4ff" strokeWidth="1" opacity="0.6" />
              <circle cx="14" cy="14" r="2.5" fill="#00d4ff" />
              <ellipse cx="14" cy="14" rx="12" ry="5" stroke="#00d4ff" strokeWidth="0.8" opacity="0.35"
                transform="rotate(-30 14 14)" />
            </svg>
          </div>
          <span className="font-display text-hud-lg text-white tracking-[0.2em]">
            ORBIT<span className="text-pulsar">OPS</span>
          </span>
        </div>

        {/* Links — desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={cn(
                'label-mono transition-colors duration-300 relative group',
                activeSection === link.id ? 'text-pulsar' : 'text-white/40 hover:text-white/80'
              )}
            >
              {link.label}
              <span className={cn(
                'absolute -bottom-1 left-0 h-px w-full bg-pulsar transition-transform duration-300 origin-left',
                activeSection === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              )} />
            </button>
          ))}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 panel-glass px-3 py-1.5 rounded-sm">
            <span className="status-dot live animate-blink" />
            <span className="label-mono text-telemetry/80">LIVE DATA</span>
          </div>
          <button className="panel-glass px-3 py-1.5 rounded-sm label-mono text-pulsar hover:bg-pulsar/10 transition-colors duration-200">
            LAUNCH CONSOLE
          </button>
        </div>
      </div>

      {/* Bottom border line */}
      <div
        ref={lineRef}
        className="h-px mx-6 lg:mx-10"
        style={{
          background: 'linear-gradient(90deg, rgba(0,212,255,0.4), rgba(0,212,255,0.08) 60%, transparent)',
          transformOrigin: 'left',
          scaleX: 0,
        }}
      />
    </nav>
  )
}