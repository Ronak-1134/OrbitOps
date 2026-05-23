// src/sections/SolarWind/SolarFlareLog.jsx
import { motion } from 'framer-motion'
import { FLARE_COLOR } from '@hooks/useSolarData'
import { staggerContainer, staggerItem } from '@utils/motionVariants'

const FLARE_LABEL = {
  X: 'EXTREME',
  M: 'MAJOR',
  C: 'MODERATE',
  B: 'MINOR',
  A: 'BACKGROUND',
}

const FLARE_IMPACT = {
  X: 'Severe radio blackout R3–R5. HF radio outage.',
  M: 'Moderate radio blackout R1–R2. Possible HF degradation.',
  C: 'Minor radio blackout R0–R1. Weak impact on polar routes.',
  B: 'No significant impact expected.',
  A: 'No impact.',
}

function FlareRow({ flare, index }) {
  const cls   = flare.class_letter ?? 'C'
  const color = FLARE_COLOR[cls] ?? FLARE_COLOR.C
  const time  = flare.peak_time?.slice(11, 16) ?? flare.begin_time?.slice(11, 16) ?? '—'
  const date  = (flare.peak_time ?? flare.begin_time ?? '').slice(0, 10)

  return (
    <motion.div
      variants={staggerItem}
      className="group relative flex gap-3 py-3 border-b border-white/5 hover:bg-white/2 transition-colors duration-200 px-1"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        {index < 4 && (
          <div className="w-px flex-1 mt-1.5" style={{ background: `${color}20`, minHeight: 20 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Class badge */}
          <div className="flex items-center gap-2">
            <span
              className="font-display text-hud-lg tabular-nums leading-none"
              style={{ color, textShadow: `0 0 10px ${color}` }}
            >
              {cls}{flare.scale}
            </span>
            <span className="label-mono text-white/25">{FLARE_LABEL[cls]}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="label-mono text-white/20">{date}</span>
            <span className="font-mono text-hud-sm text-white/50">{time} UTC</span>
          </div>
        </div>

        {/* Region + impact */}
        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <span className="label-mono text-white/25">
            REGION <span className="text-pulsar/50">{flare.region ?? '—'}</span>
          </span>
          <span className="label-mono text-white/20 leading-relaxed">
            {FLARE_IMPACT[cls]}
          </span>
        </div>

        {/* Energy bar (visual only) */}
        <div className="mt-2 h-px bg-white/5 w-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: color, boxShadow: `0 0 4px ${color}` }}
            initial={{ width: 0 }}
            animate={{
              width: `${cls==='X' ? 95 : cls==='M' ? 65 : cls==='C' ? 40 : 20}%`
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.1 * index }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function SolarFlareLog({ flares = [] }) {
  const latest = flares[0]

  return (
    <div className="panel-glass rounded-sm p-4 h-full relative overflow-hidden">
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="label-mono text-white/30 mb-0.5">SOLAR FLARE EVENTS</div>
          <div className="flex items-center gap-2">
            <span className="status-dot live animate-blink" />
            <span className="label-mono text-white/20">LAST 7 DAYS — GOES PRIMARY</span>
          </div>
        </div>
        {latest && (
          <div
            className="label-mono px-2 py-1 rounded-sm"
            style={{
              color:      FLARE_COLOR[latest.class_letter],
              background: `${FLARE_COLOR[latest.class_letter]}15`,
              border:     `1px solid ${FLARE_COLOR[latest.class_letter]}30`,
            }}
          >
            LATEST {latest.class_letter}{latest.scale}
          </div>
        )}
      </div>

      {/* Flare list */}
      <motion.div
        variants={staggerContainer(0.06, 0.4)}
        initial="hidden"
        animate="visible"
        className="overflow-y-auto no-scrollbar"
        style={{ maxHeight: 340 }}
      >
        {flares.length === 0
          ? <div className="label-mono text-white/20 py-8 text-center">NO FLARE DATA</div>
          : flares.map((f, i) => <FlareRow key={i} flare={f} index={i} />)
        }
      </motion.div>

      {/* X-ray flux mini legend */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 flex-wrap">
        {Object.entries(FLARE_COLOR).reverse().map(([cls, color]) => (
          <div key={cls} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color, opacity: 0.8 }} />
            <span className="label-mono text-white/25">{cls}-class</span>
          </div>
        ))}
      </div>
    </div>
  )
}