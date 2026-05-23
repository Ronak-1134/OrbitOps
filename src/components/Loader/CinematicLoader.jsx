// src/components/Loader/CinematicLoader.jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import useAppStore from '@stores/useAppStore'
import StarField    from './StarField'
import OrbitalRings from './OrbitalRings'
import BootSequence from './BootSequence'

// ── LETTER SPLIT ─────────────────────────────────────────────────
const TITLE = 'ORBITOPS'

// ── PROGRESS STEPS ───────────────────────────────────────────────
const STEPS = [
  { pct: 12,  label: 'Initializing kernel...' },
  { pct: 28,  label: 'Establishing telemetry link...' },
  { pct: 44,  label: 'Loading orbital databases...' },
  { pct: 61,  label: 'Syncing ISS position...' },
  { pct: 75,  label: 'Mounting sensor arrays...' },
  { pct: 89,  label: 'Calibrating visual module...' },
  { pct: 100, label: 'SYSTEMS ONLINE' },
]

export default function CinematicLoader() {
  const setLoaded   = useAppStore(s => s.setLoaded)
  const setProgress = useAppStore(s => s.setLoadProgress)

  const [progress,   setLocalProgress] = useState(0)
  const [stepLabel,  setStepLabel]     = useState(STEPS[0].label)
  const [exiting,    setExiting]       = useState(false)
  const [showBoot,   setShowBoot]      = useState(false)
  const [bootDone,   setBootDone]      = useState(false)

  // Refs
  const loaderRef   = useRef(null)
  const titleRef    = useRef(null)
  const letterRefs  = useRef([])
  const subtitleRef = useRef(null)
  const progressBarRef = useRef(null)
  const progressFillRef = useRef(null)
  const pctRef      = useRef(null)
  const scanRef     = useRef(null)
  const cornerRefs  = useRef([])
  const missionRef  = useRef(null)
  const coordsRef   = useRef(null)

  // ── BOOT SEQUENCE COMPLETE → trigger progress ─────────────────
  const handleBootDone = useCallback(() => {
    setBootDone(true)
  }, [])

  // ── MASTER ENTRY TIMELINE ─────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // 1. Scan line sweep
      tl.fromTo(scanRef.current,
        { y: '-100%', opacity: 0.7 },
        { y: '100vh', opacity: 0.4, duration: 1.2, ease: 'none' },
        0
      )

      // 2. Corner brackets scale in
      tl.fromTo(cornerRefs.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.06 },
        0.2
      )

      // 3. Title letters cascade in
      tl.fromTo(letterRefs.current,
        { y: 30, opacity: 0, filter: 'blur(8px)' },
        { y: 0,  opacity: 1, filter: 'blur(0px)',
          duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06 },
        0.5
      )

      // 4. Letter glow pulse after reveal
      tl.to(letterRefs.current,
        { textShadow: '0 0 20px rgba(0,212,255,0.9), 0 0 50px rgba(0,212,255,0.4)',
          duration: 0.4, stagger: 0.04, ease: 'power2.in' },
        1.3
      )
      tl.to(letterRefs.current,
        { textShadow: '0 0 10px rgba(0,212,255,0.5), 0 0 20px rgba(0,212,255,0.15)',
          duration: 0.5, ease: 'power2.out' },
        '>'
      )

      // 5. Subtitle
      tl.fromTo(subtitleRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1,  y: 0, duration: 0.5, ease: 'power2.out' },
        1.2
      )

      // 6. Mission tag + coords
      tl.fromTo([missionRef.current, coordsRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.1 },
        1.4
      )

      // 7. Progress bar line draw
      tl.fromTo(progressBarRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.out', transformOrigin: 'left' },
        1.5
      )

      // 8. Show boot sequence
      tl.add(() => setShowBoot(true), 1.7)
    }, loaderRef)

    return () => ctx.revert()
  }, [])

  // ── PROGRESS SIMULATION (after boot done) ─────────────────────
  useEffect(() => {
    if (!bootDone) return
    let idx = 0

    const advance = () => {
      if (idx >= STEPS.length) return
      const step = STEPS[idx]
      setStepLabel(step.label)
      setLocalProgress(step.pct)
      setProgress(step.pct)

      // Animate fill bar
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          width: `${step.pct}%`,
          duration: 0.6,
          ease: 'power2.out',
        })
      }
      // Animate percentage
      if (pctRef.current) {
        const obj = { val: idx === 0 ? 0 : STEPS[idx - 1].pct }
        gsap.to(obj, {
          val: step.pct,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            if (pctRef.current)
              pctRef.current.textContent = `${Math.round(obj.val).toString().padStart(3, '0')}%`
          },
        })
      }

      idx++
      if (idx < STEPS.length) {
        setTimeout(advance, 320)
      } else {
        // All done → exit sequence
        setTimeout(() => setExiting(true), 600)
      }
    }

    const t = setTimeout(advance, 200)
    return () => clearTimeout(t)
  }, [bootDone, setProgress])

  // ── EXIT ANIMATION ─────────────────────────────────────────────
  useEffect(() => {
    if (!exiting) return

    gsap.to(loaderRef.current, {
      opacity: 0,
      scale: 1.04,
      filter: 'blur(8px)',
      duration: 0.9,
      ease: 'power3.in',
      onComplete: setLoaded,
    })
  }, [exiting, setLoaded])

  // ── STATIC TELEMETRY COORDS ───────────────────────────────────
  const now = new Date()
  const utc = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 100, background: 'radial-gradient(ellipse at 50% 40%, #060b1a 0%, #01020a 70%)' }}
    >
      {/* ── LAYERS ── */}
      <StarField count={280} opacity={0.65} />

      {/* HUD grid */}
      <div className="absolute inset-0 bg-hud-grid-lg pointer-events-none" />

      {/* Scanlines */}
      <div className="scanlines" />

      {/* Ambient radial glow behind orb */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -65%)',
          background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Scan sweep */}
      <div
        ref={scanRef}
        className="absolute inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.6) 50%, transparent 100%)', top: 0 }}
      />

      {/* ── CORNER DECORATIONS ── */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
        <div
          key={i}
          ref={el => cornerRefs.current[i] = el}
          className={`absolute ${pos} w-8 h-8`}
          style={{ opacity: 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            {i === 0 && <><path d="M0 12 L0 0 L12 0" stroke="#00d4ff" strokeWidth="1.5" /><circle cx="0" cy="0" r="2" fill="#00d4ff" /></>}
            {i === 1 && <><path d="M32 12 L32 0 L20 0" stroke="#00d4ff" strokeWidth="1.5" /><circle cx="32" cy="0" r="2" fill="#00d4ff" /></>}
            {i === 2 && <><path d="M0 20 L0 32 L12 32" stroke="#00d4ff" strokeWidth="1.5" /><circle cx="0" cy="32" r="2" fill="#00d4ff" /></>}
            {i === 3 && <><path d="M32 20 L32 32 L20 32" stroke="#00d4ff" strokeWidth="1.5" /><circle cx="32" cy="32" r="2" fill="#00d4ff" /></>}
          </svg>
        </div>
      ))}

      {/* ── TOP META BAR ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3" ref={missionRef} style={{ opacity: 0 }}>
        <span className="status-dot live" />
        <span className="label-mono">MISSION CONTROL — LIVE FEED</span>
        <span className="label-mono opacity-40">|</span>
        <span className="label-mono opacity-60">{utc}</span>
      </div>

      {/* ── COORDS (bottom-left) ── */}
      <div
        ref={coordsRef}
        className="absolute bottom-6 left-6 label-mono opacity-40"
        style={{ opacity: 0 }}
      >
        LAT 28.5°N · LON 80.6°W · ALT 408 KM
      </div>

      {/* ── RIGHT TELEMETRY ── */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-end label-mono opacity-30">
        {['VEL 27,600 KM/H', 'ORB 15.5 REV/DAY', 'INC 51.6°', 'ALT 408 KM'].map(t => (
          <div key={t}>{t}</div>
        ))}
      </div>

      {/* ── CENTER CONTENT ── */}
      <div className="relative flex flex-col items-center gap-8" style={{ zIndex: 10 }}>

        {/* Orbital rings */}
        <OrbitalRings />

        {/* Title */}
        <div className="text-center -mt-4">
          <div
            ref={titleRef}
            className="flex items-center justify-center gap-1 font-display text-hud-6xl tracking-[0.2em]"
          >
            {TITLE.split('').map((ch, i) => (
              <span
                key={i}
                ref={el => letterRefs.current[i] = el}
                className="text-pulsar"
                style={{ opacity: 0, display: 'inline-block' }}
              >
                {ch}
              </span>
            ))}
          </div>

          <p
            ref={subtitleRef}
            className="label-mono text-white/40 mt-2 tracking-[0.35em]"
            style={{ opacity: 0 }}
          >
            REAL-TIME SPACE INTELLIGENCE PLATFORM
          </p>
        </div>

        {/* Boot log */}
        <AnimatePresence>
          {showBoot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm"
            >
              <BootSequence onComplete={handleBootDone} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress section */}
        <div className="w-full max-w-sm space-y-2" style={{ opacity: bootDone ? 1 : 0, transition: 'opacity 0.4s' }}>
          {/* Step label */}
          <div className="flex justify-between items-center">
            <span className="label-mono text-white/50">{stepLabel}</span>
            <span
              ref={pctRef}
              className="font-mono text-hud-sm text-pulsar text-glow-pulsar tabular-nums"
            >
              000%
            </span>
          </div>

          {/* Track */}
          <div
            ref={progressBarRef}
            className="relative h-px w-full"
            style={{ background: 'rgba(0,212,255,0.12)', transformOrigin: 'left', scaleX: 0, opacity: 0 }}
          >
            {/* Fill */}
            <div
              ref={progressFillRef}
              className="absolute left-0 top-0 h-full"
              style={{
                width: 0,
                background: 'linear-gradient(90deg, rgba(0,212,255,0.4), #00d4ff)',
                boxShadow: '0 0 8px rgba(0,212,255,0.7)',
                transition: 'none',
              }}
            />
            {/* Leading dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pulsar"
              style={{
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 6px rgba(0,212,255,0.9)',
                transition: 'left 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          </div>

          {/* Segment ticks */}
          <div className="flex justify-between">
            {[0, 25, 50, 75, 100].map(n => (
              <span
                key={n}
                className="label-mono opacity-25"
                style={{ color: progress >= n ? 'rgba(0,212,255,0.6)' : undefined }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CENTER MISSION ID ── */}
      <div className="absolute bottom-6 right-6 label-mono opacity-30 text-right">
        <div>MISSION ID: OPS-{now.getFullYear()}-{String(now.getMonth()+1).padStart(2,'0')}</div>
        <div>NODE: EARTH-ALPHA</div>
      </div>
    </div>
  )
}