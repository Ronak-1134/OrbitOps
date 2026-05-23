// src/components/Loader/BootSequence.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LINES = [
  { ms: 0,    label: 'INIT', text: 'Kernel boot sequence initiated',            status: 'ok' },
  { ms: 200,  label: 'NET',  text: 'Establishing deep-space telemetry link',     status: 'ok' },
  { ms: 500,  label: 'GPS',  text: 'Acquiring orbital positioning satellites',   status: 'ok' },
  { ms: 800,  label: 'ISS',  text: 'Syncing ISS position feed — TLE loaded',     status: 'ok' },
  { ms: 1100, label: 'NEO',  text: 'Near-Earth object database connected',       status: 'ok' },
  { ms: 1400, label: 'SOL',  text: 'Solar wind sensors nominal',                 status: 'ok' },
  { ms: 1700, label: 'CAM',  text: 'Mounting visual intelligence module',        status: 'ok' },
  { ms: 2000, label: 'SYS',  text: 'All systems nominal — ORBITOPS online',      status: 'rdy' },
]

const STATUS_COLOR = {
  ok:  'text-telemetry',
  rdy: 'text-solar',
  err: 'text-alert',
}

export default function BootSequence({ onComplete }) {
  const lineRefs = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete })

    LINES.forEach((line, i) => {
      tl.fromTo(
        lineRefs.current[i],
        { x: -10, opacity: 0 },
        { x: 0,   opacity: 1, duration: 0.25, ease: 'power2.out' },
        line.ms / 1000
      )
    })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="font-mono text-hud-xs space-y-1 w-full max-w-sm"
      style={{ minHeight: `${LINES.length * 20}px` }}
    >
      {LINES.map((line, i) => (
        <div
          key={i}
          ref={el => lineRefs.current[i] = el}
          className="flex items-center gap-2 opacity-0"
        >
          <span className="text-pulsar/50 w-8 shrink-0">{line.label}</span>
          <span className="text-white/25 shrink-0">/</span>
          <span className="text-white/50 flex-1">{line.text}</span>
          <span className={`shrink-0 ${STATUS_COLOR[line.status]}`}>
            {line.status === 'ok'  && '[ OK ]'}
            {line.status === 'rdy' && '[ RDY ]'}
            {line.status === 'err' && '[ ERR ]'}
          </span>
        </div>
      ))}
    </div>
  )
}