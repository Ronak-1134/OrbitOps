// src/components/layout/GlobalNav.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { cn } from '@utils/cn'
import useActiveSection from '@hooks/useActiveSection'

const LINKS = [
  { id: 'hero',      label: 'OVERVIEW',       href: '#hero'      },
  { id: 'iss',       label: 'ISS TRACKER',    href: '#iss'       },
  { id: 'asteroids', label: 'ASTEROID RADAR', href: '#asteroids' },
  { id: 'solar',     label: 'SOLAR WIND',     href: '#solar'     },
  { id: 'launches',  label: 'LAUNCHES',       href: '#launches'  },
]
const SECTION_IDS = LINKS.map(l => l.id)

export default function GlobalNav() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const active   = useActiveSection(SECTION_IDS)
  const navRef   = useRef(null)
  const lineRef  = useRef(null)

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Entry animation
  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
    )
    gsap.fromTo(lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, ease: 'power3.inOut', delay: 0.5, transformOrigin: 'left' }
    )
  }, [])

  const scrollTo = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-400',
          scrolled ? 'bg-void-950/90 backdrop-blur-md' : 'bg-transparent'
        )}
        style={{ opacity: 0 }}
      >
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo('#hero')} className="flex items-center gap-2.5 group">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#00d4ff" strokeWidth="1" opacity="0.5"/>
              <circle cx="14" cy="14" r="6"  stroke="#00d4ff" strokeWidth="1" opacity="0.7"/>
              <circle cx="14" cy="14" r="2.5" fill="#00d4ff"/>
              <ellipse cx="14" cy="14" rx="12" ry="5" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" transform="rotate(-30 14 14)"/>
            </svg>
            <span className="font-display text-hud-base tracking-[0.2em] text-white/80 group-hover:text-white transition-colors duration-200">
              ORBIT<span className="text-pulsar">OPS</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  'label-mono transition-colors duration-200 relative group pb-0.5',
                  active === link.id ? 'text-pulsar' : 'text-white/35 hover:text-white/70'
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-0.5 left-0 h-px w-full bg-pulsar transition-transform duration-300 origin-left',
                  active === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )} />
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 panel-glass px-3 py-1.5 rounded-sm">
              <span className="status-dot live animate-blink" />
              <span className="label-mono text-telemetry/70">LIVE</span>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="lg:hidden label-mono text-white/40 hover:text-white/80 transition-colors p-1"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Bottom line */}
        <div
          ref={lineRef}
          className="h-px mx-6 lg:mx-10"
          style={{ background: 'linear-gradient(90deg,rgba(0,212,255,0.3),rgba(0,212,255,0.06),transparent)', transformOrigin:'left', scaleX: 0 }}
        />
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-72 z-50 panel-glass border-l border-hud-border/30 flex flex-col p-8 gap-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-hud-base text-pulsar tracking-widest">ORBITOPS</span>
              <button onClick={() => setMenuOpen(false)} className="label-mono text-white/40 hover:text-white">✕</button>
            </div>
            <div className="h-px bg-pulsar/20" />
            <nav className="flex flex-col gap-5">
              {LINKS.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.href)}
                  className={cn(
                    'label-mono text-left transition-colors duration-200',
                    active === link.id ? 'text-pulsar' : 'text-white/40 hover:text-white/80'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-2">
              <span className="status-dot live animate-blink" />
              <span className="label-mono text-telemetry/60">ALL SYSTEMS NOMINAL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-void-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}