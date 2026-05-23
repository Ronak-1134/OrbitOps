// src/components/Loader/OrbitalRings.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { colors } from '@styles/tokens'

const RINGS = [
  { r: 56,  strokeW: 1,   dash: '4 6',     dur: 12, opacity: 0.55, tilt: 'rotateX(70deg) rotateZ(15deg)' },
  { r: 88,  strokeW: 0.8, dash: '2 10',    dur: 20, opacity: 0.35, tilt: 'rotateX(65deg) rotateZ(-25deg)' },
  { r: 118, strokeW: 1.2, dash: '6 4',     dur: 30, opacity: 0.25, tilt: 'rotateX(72deg) rotateZ(40deg)' },
  { r: 148, strokeW: 0.6, dash: '1 14 3 8',dur: 45, opacity: 0.18, tilt: 'rotateX(68deg) rotateZ(-10deg)' },
]

const DOT_RINGS = [
  { r: 56,  dur: 3.5, color: colors.pulsar.DEFAULT, size: 4 },
  { r: 88,  dur: 6,   color: colors.solar.DEFAULT,  size: 3 },
  { r: 118, dur: 9,   color: colors.telemetry.DEFAULT, size: 3 },
]

export default function OrbitalRings() {
  const wrapRef  = useRef(null)
  const ringRefs = useRef([])
  const dotRefs  = useRef([])
  const coreRef  = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Rings spin
      ringRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: RINGS[i].dur,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50%',
        })
      })

      // Orbiting dots
      dotRefs.current.forEach((el, i) => {
        if (!el) return
        const ring = DOT_RINGS[i]
        gsap.to(el, {
          motionPath: {
            path: `M${160 + ring.r},160 a${ring.r},${ring.r} 0 1,1 0.001,0`,
            align: 'self',
            autoRotate: false,
          },
          duration: ring.dur,
          ease: 'none',
          repeat: -1,
        })
      })

      // Core pulse
      gsap.to(coreRef.current, {
        scale: 1.2,
        duration: 1.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 50%',
      })

      // Entry reveal
      gsap.fromTo(wrapRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' }
      )
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  const size = 320

  return (
    <div ref={wrapRef} className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Pulsar glow filter */}
          <filter id="glow-pulsar" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-core" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={colors.pulsar.bright} stopOpacity="1" />
            <stop offset="40%"  stopColor={colors.pulsar.DEFAULT} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.pulsar.dim}    stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Static grid circle */}
        <circle cx={160} cy={160} r={155} stroke="rgba(0,212,255,0.05)" strokeWidth="0.5" fill="none" />

        {/* Orbital rings */}
        {RINGS.map((ring, i) => (
          <g
            key={i}
            ref={el => ringRefs.current[i] = el}
            style={{ transformOrigin: '160px 160px' }}
          >
            <circle
              cx={160} cy={160}
              r={ring.r}
              stroke={colors.pulsar.DEFAULT}
              strokeWidth={ring.strokeW}
              strokeDasharray={ring.dash}
              fill="none"
              opacity={ring.opacity}
              filter="url(#glow-pulsar)"
            />
          </g>
        ))}

        {/* Orbiting dots */}
        {DOT_RINGS.map((dot, i) => (
          <g key={i} ref={el => dotRefs.current[i] = el}>
            {/* Glow halo */}
            <circle cx={160 + dot.r} cy={160} r={dot.size + 3} fill={dot.color} opacity={0.15} />
            {/* Core dot */}
            <circle
              cx={160 + dot.r} cy={160}
              r={dot.size}
              fill={dot.color}
              filter="url(#glow-pulsar)"
              opacity={0.9}
            />
          </g>
        ))}

        {/* Crosshair lines */}
        <line x1={160} y1={120} x2={160} y2={138} stroke={colors.pulsar.DEFAULT} strokeWidth="0.6" opacity="0.4" />
        <line x1={160} y1={182} x2={160} y2={200} stroke={colors.pulsar.DEFAULT} strokeWidth="0.6" opacity="0.4" />
        <line x1={120} y1={160} x2={138} y2={160} stroke={colors.pulsar.DEFAULT} strokeWidth="0.6" opacity="0.4" />
        <line x1={182} y1={160} x2={200} y2={160} stroke={colors.pulsar.DEFAULT} strokeWidth="0.6" opacity="0.4" />

        {/* Core orb */}
        <g ref={coreRef} filter="url(#glow-core)" style={{ transformOrigin: '160px 160px' }}>
          <circle cx={160} cy={160} r={22} fill="url(#core-grad)" />
          <circle cx={160} cy={160} r={10} fill={colors.pulsar.bright} opacity="0.9" />
          <circle cx={160} cy={160} r={5}  fill="#ffffff" />
        </g>

        {/* Degree markers at 0 / 90 / 180 / 270 */}
        {[0, 90, 180, 270].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x = 160 + Math.cos(rad) * 154
          const y = 160 + Math.sin(rad) * 154
          return (
            <g key={deg}>
              <circle cx={x} cy={y} r={2} fill={colors.pulsar.DEFAULT} opacity={0.5} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}