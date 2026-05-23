// src/sections/AsteroidRadar/AsteroidDetail.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { THREAT_CONFIG } from '@hooks/useAsteroidData'
import { panelVariants } from '@utils/motionVariants'

// ── Risk gauge (horizontal bar) ───────────────────────────────────
function RiskGauge({ threat }) {
  const levels   = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
  const idx      = levels.indexOf(threat)
  const pct      = ((idx + 1) / levels.length) * 100
  const cfg      = THREAT_CONFIG[threat] ?? THREAT_CONFIG.LOW

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="label-mono text-white/30">IMPACT PROBABILITY INDEX</span>
        <span className="label-mono" style={{ color: cfg.color }}>{threat}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-sm overflow-hidden">
        <motion.div
          className="h-full rounded-sm"
          style={{ background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                   boxShadow: `0 0 8px ${cfg.glow}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between">
        {levels.map(l => (
          <span key={l}
            className="label-mono text-hud-xs"
            style={{ color: l === threat ? THREAT_CONFIG[l].color : 'rgba(255,255,255,0.15)' }}
          >{l}</span>
        ))}
      </div>
    </div>
  )
}

// ── Data field ────────────────────────────────────────────────────
function Field({ label, value, sub, accent }) {
  const cls = {
    pulsar:    'text-pulsar',
    solar:     'text-solar',
    telemetry: 'text-telemetry',
    alert:     'text-alert',
  }[accent] ?? 'text-white/70'

  return (
    <div className="py-2 border-b border-white/5">
      <div className="label-mono text-white/25 mb-0.5">{label}</div>
      <div className={`font-mono text-hud-base ${cls} tabular-nums`}>{value}</div>
      {sub && <div className="label-mono text-white/20 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Empty / null state ────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-6">
      {/* Radar icon */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-20">
        <circle cx="24" cy="24" r="22" stroke="#00d4ff" strokeWidth="1" />
        <circle cx="24" cy="24" r="14" stroke="#00d4ff" strokeWidth="0.6" />
        <circle cx="24" cy="24" r="7"  stroke="#00d4ff" strokeWidth="0.6" />
        <circle cx="24" cy="24" r="2"  fill="#00d4ff" />
        <line x1="24" y1="24" x2="44" y2="24" stroke="#00d4ff" strokeWidth="0.8" />
      </svg>
      <div>
        <p className="label-mono text-white/25 mb-1">SELECT OBJECT</p>
        <p className="font-body text-hud-sm text-white/15">
          Click any blip on the radar or<br />select from the threat list
        </p>
      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function AsteroidDetail({ asteroid }) {
  if (!asteroid) return <EmptyState />

  const cfg  = THREAT_CONFIG[asteroid.threat] ?? THREAT_CONFIG.LOW
  const dist = parseFloat(asteroid.distLunar)

  // Visual distance metaphor
  const metaphor =
    dist < 1   ? 'Inside lunar orbit — extremely close approach'  :
    dist < 5   ? 'Closer than 5 lunar distances — hazardous zone' :
    dist < 20  ? 'Within 20 LD — monitoring required'             :
                 'Safe passage predicted'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={asteroid.id}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="h-full flex flex-col gap-4 p-4"
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-hud-lg text-white/90 tracking-wide leading-tight">
                {asteroid.name}
              </h3>
              <div className="label-mono text-white/25 mt-0.5">{asteroid.designation}</div>
            </div>
            <span
              className="label-mono px-2 py-1 rounded-sm shrink-0 mt-0.5"
              style={{
                color:      cfg.color,
                background: cfg.glow.replace(/[\d.]+\)$/, '0.12)'),
                border:     `1px solid ${cfg.color}40`,
                boxShadow:  `0 0 12px ${cfg.glow}`,
              }}
            >
              {asteroid.threat}
            </span>
          </div>

          {/* NASA link */}
          {asteroid.nasaUrl && asteroid.nasaUrl !== '#' && (
            <a
              href={asteroid.nasaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="label-mono text-pulsar/50 hover:text-pulsar transition-colors duration-200 mt-1 inline-block"
            >
              ↗ NASA JPL RECORD
            </a>
          )}
        </div>

        {/* Risk gauge */}
        <div className="panel-glass rounded-sm p-3">
          <RiskGauge threat={asteroid.threat} />
          <p className="label-mono text-white/25 mt-2 text-hud-xs">{metaphor}</p>
        </div>

        {/* Close approach */}
        <div>
          <div className="label-mono text-white/30 mb-2">CLOSE APPROACH</div>
          <Field label="DATE"       value={asteroid.closeTime}              accent="solar" />
          <Field label="MISS DIST"  value={`${asteroid.distLunar} LD`}
                 sub={`${Number(asteroid.distKm).toLocaleString()} km · ${asteroid.distAu} AU`}
                 accent="pulsar" />
          <Field label="REL VEL"    value={`${asteroid.velocity} km/s`}
                 sub={`${Number(asteroid.velKmh).toLocaleString()} km/h`}
                 accent="telemetry" />
        </div>

        {/* Physical properties */}
        <div>
          <div className="label-mono text-white/30 mb-2">PHYSICAL DATA</div>
          <Field label="DIAMETER EST."
                 value={`${asteroid.diamMin} – ${asteroid.diamMax} m`}
                 accent="white" />
          <Field label="ABS. MAGNITUDE" value={`H = ${asteroid.absoluteMag}`} accent="white" />
          <Field label="ORBIT CLASS"    value={asteroid.orbitClass}   accent="pulsar" />
          <Field label="PHO STATUS"
                 value={asteroid.hazardous ? 'POTENTIALLY HAZARDOUS' : 'NON-HAZARDOUS'}
                 accent={asteroid.hazardous ? 'alert' : 'telemetry'} />
        </div>

        {/* Torino Scale estimate */}
        <div className="panel-glass rounded-sm p-3 mt-auto">
          <div className="flex items-center justify-between">
            <span className="label-mono text-white/30">TORINO SCALE</span>
            <div className="flex items-center gap-2">
              {[0,1,2,3,4,5,6,7,8,9,10].slice(0, 6).map(n => (
                <div
                  key={n}
                  className="w-2 h-4 rounded-sm"
                  style={{
                    background: n === 0 ? 'rgba(0,229,160,0.6)'  :
                                n <= 2  ? 'rgba(0,212,255,0.4)'  :
                                n <= 4  ? 'rgba(245,166,35,0.5)' :
                                          'rgba(255,61,90,0.6)',
                    opacity: asteroid.threat === 'CRITICAL' && n === 2 ? 1 :
                             asteroid.threat === 'HIGH'     && n === 1 ? 1 :
                             n === 0 ? 0.9 : 0.2,
                    boxShadow: n === 0 && asteroid.threat === 'LOW' ? '0 0 4px #00e5a0' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="label-mono text-white/20 mt-1.5 text-hud-xs">
            {asteroid.threat === 'CRITICAL' ? 'Level 2 — Warrants attention'  :
             asteroid.threat === 'HIGH'     ? 'Level 1 — Normal'              :
                                             'Level 0 — No likely consequence'}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}