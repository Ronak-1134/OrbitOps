// src/sections/AsteroidRadar/AsteroidList.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THREAT_CONFIG } from '@hooks/useAsteroidData'
import { staggerContainer, staggerItem } from '@utils/motionVariants'

const SORT_KEYS = [
  { key: 'distLunar', label: 'DISTANCE' },
  { key: 'threat',    label: 'THREAT'   },
  { key: 'diamMax',   label: 'SIZE'     },
  { key: 'velocity',  label: 'SPEED'    },
]

const THREAT_ORDER = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 }

function sortAsteroids(list, key) {
  return [...list].sort((a, b) => {
    if (key === 'threat') return THREAT_ORDER[a.threat] - THREAT_ORDER[b.threat]
    return parseFloat(a[key]) - parseFloat(b[key])
  })
}

// ── Threat badge ──────────────────────────────────────────────────
function ThreatBadge({ level }) {
  const cfg = THREAT_CONFIG[level] ?? THREAT_CONFIG.LOW
  return (
    <span
      className="label-mono px-2 py-0.5 rounded-sm text-hud-xs"
      style={{
        color: cfg.color,
        background: cfg.glow.replace(/[\d.]+\)$/, '0.12)'),
        border: `1px solid ${cfg.color}30`,
      }}
    >
      {level}
    </span>
  )
}

// ── Single asteroid row ───────────────────────────────────────────
function AsteroidRow({ ast, selected, onSelect, index }) {
  const isSelected = selected?.id === ast.id
  const cfg = THREAT_CONFIG[ast.threat] ?? THREAT_CONFIG.LOW

  return (
    <motion.button
      variants={staggerItem}
      onClick={() => onSelect(isSelected ? null : ast)}
      className={`
        w-full text-left px-3 py-2.5 border-b transition-all duration-200
        ${isSelected
          ? 'bg-pulsar/8 border-pulsar/30'
          : 'border-white/5 hover:bg-white/3 hover:border-white/10'}
      `}
      style={isSelected ? { boxShadow: `inset 2px 0 0 ${cfg.color}` } : {}}
    >
      <div className="flex items-center gap-2">
        {/* Index */}
        <span className="label-mono text-white/20 w-4 shrink-0 text-right">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Threat dot */}
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }}
        />

        {/* Name */}
        <span className={`
          font-body text-hud-base flex-1 truncate transition-colors duration-200
          ${isSelected ? 'text-white' : 'text-white/60'}
        `}>
          {ast.name}
        </span>

        {/* Distance */}
        <span className="font-mono text-hud-xs text-white/30 shrink-0 tabular-nums">
          {ast.distLunar} LD
        </span>
      </div>

      {/* Expanded detail row */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-6 grid grid-cols-3 gap-2">
              <div>
                <div className="label-mono text-white/20">DIAM</div>
                <div className="font-mono text-hud-xs text-white/55">
                  {ast.diamMin}–{ast.diamMax} m
                </div>
              </div>
              <div>
                <div className="label-mono text-white/20">SPEED</div>
                <div className="font-mono text-hud-xs text-white/55">{ast.velocity} km/s</div>
              </div>
              <div>
                <div className="label-mono text-white/20">DATE</div>
                <div className="font-mono text-hud-xs text-white/55">{ast.closeDate}</div>
              </div>
            </div>
            <div className="mt-2 ml-6">
              <ThreatBadge level={ast.threat} />
              <span className="label-mono text-white/20 ml-2">{ast.orbitClass}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AsteroidList({ asteroids = [], selected, onSelect, loading }) {
  const [sortKey, setSortKey] = useState('distLunar')
  const sorted = sortAsteroids(asteroids, sortKey)

  const counts = asteroids.reduce((acc, a) => {
    acc[a.threat] = (acc[a.threat] || 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="label-mono text-white/30">NEAR-EARTH OBJECTS</span>
          <div className="flex items-center gap-2">
            {loading && <span className="label-mono text-pulsar/40 animate-blink">SYNCING</span>}
            <span className="label-mono text-white/50">{asteroids.length} TRACKED</span>
          </div>
        </div>

        {/* Threat summary pills */}
        <div className="flex gap-2 flex-wrap mt-2">
          {Object.entries(THREAT_CONFIG).map(([level, cfg]) => (
            counts[level] ? (
              <span
                key={level}
                className="label-mono px-2 py-0.5 rounded-sm text-hud-xs"
                style={{ color: cfg.color, background: cfg.glow.replace(/[\d.]+\)$/, '0.1)') }}
              >
                {counts[level]}× {level}
              </span>
            ) : null
          ))}
        </div>

        {/* Sort bar */}
        <div className="flex gap-1 mt-3">
          {SORT_KEYS.map(s => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`
                flex-1 py-1 label-mono text-hud-xs transition-all duration-200
                ${sortKey === s.key
                  ? 'text-pulsar border-b border-pulsar'
                  : 'text-white/25 border-b border-transparent hover:text-white/50'}
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <motion.div
          variants={staggerContainer(0.04, 0.3)}
          initial="hidden"
          animate="visible"
        >
          {sorted.map((ast, i) => (
            <AsteroidRow
              key={ast.id}
              ast={ast}
              index={i}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}