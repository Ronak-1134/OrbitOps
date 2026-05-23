// src/sections/LaunchSchedule/CountdownClock.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCountdown } from '@hooks/useLaunchData'

// ── Flip digit ────────────────────────────────────────────────────
function FlipDigit({ value, color = '#00d4ff' }) {
  const prevRef = useRef(value)
  const changed = prevRef.current !== value
  useEffect(() => { prevRef.current = value }, [value])

  return (
    <div className="relative overflow-hidden" style={{ width: '1.1ch' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="font-display tabular-nums inline-block"
          style={{ color }}
          initial={changed ? { y: -14, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ── Segment (days / hours / mins / secs) ─────────────────────────
function Segment({ value, label, color, size = 'normal' }) {
  const str    = String(value).padStart(2, '0')
  const digits = str.split('')
  const textSz = size === 'large' ? 'text-hud-4xl' : 'text-hud-2xl'

  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-baseline ${textSz}`}>
        {digits.map((d, i) => (
          <FlipDigit key={i} value={d} color={color} />
        ))}
      </div>
      <span className="label-mono text-white/25 mt-0.5" style={{ fontSize: '0.58rem' }}>
        {label}
      </span>
    </div>
  )
}

// ── Separator ────────────────────────────────────────────────────
function Sep({ color }) {
  return (
    <motion.span
      className="font-display text-hud-2xl self-start mt-1"
      style={{ color, opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.15, 0.5] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      :
    </motion.span>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function CountdownClock({ net, color = '#00d4ff', size = 'normal' }) {
  const [cd, setCd] = useState(() => formatCountdown(net))

  useEffect(() => {
    setCd(formatCountdown(net))
    const id = setInterval(() => setCd(formatCountdown(net)), 1000)
    return () => clearInterval(id)
  }, [net])

  if (cd.negative) {
    return (
      <span className="font-display text-hud-xl text-telemetry animate-blink">
        LAUNCHED
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {cd.days > 0 && (
        <>
          <Segment value={cd.days}  label="DAYS"  color={color} size={size} />
          <Sep color={color} />
        </>
      )}
      <Segment value={cd.hours} label="HRS"  color={color} size={size} />
      <Sep color={color} />
      <Segment value={cd.mins}  label="MIN"  color={color} size={size} />
      {cd.days === 0 && (
        <>
          <Sep color={color} />
          <Segment value={cd.secs} label="SEC" color={color} size={size} />
        </>
      )}
    </div>
  )
}