// src/sections/LaunchSchedule/LaunchCard.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStatus } from '@hooks/useLaunchData'
import CountdownClock from './CountdownClock'

const ORBIT_COLOR = { LEO:'#00e5a0', MEO:'#00d4ff', GEO:'#f5a623', GTO:'#f5a623', SSO:'#a78bfa', HEO:'#ff3d5a' }
const PROVIDER_COLOR = { SpaceX:'#00d4ff', 'Blue Origin':'#00d4ff', NASA:'#4b8eff', ESA:'#f5a623', JAXA:'#ff6b6b', Arianespace:'#a78bfa', Roscosmos:'#00e5a0', ULA:'#f5a623', 'United Launch Alliance':'#f5a623' }

function MissionTypeBadge({ type }) {
  const colors = { Communications:'#00d4ff', 'Earth Observation':'#00e5a0', Navigation:'#f5a623', Resupply:'#a78bfa', 'Test Flight':'#ff6b6b', Government:'#f5a623', 'Earth Science':'#00e5a0', 'Government/Top Secret':'#ff3d5a' }
  const c = colors[type] ?? 'rgba(255,255,255,0.3)'
  return <span className="label-mono px-1.5 py-0.5 rounded-sm" style={{ color:c, background:`${c}18`, border:`1px solid ${c}30`, fontSize:'0.58rem' }}>{type}</span>
}

export default function LaunchCard({ launch, featured=false, index=0 }) {
  const [expanded, setExpanded] = useState(false)
  const status     = getStatus(launch.status)
  const orbit      = launch.mission?.orbit?.abbrev ?? '—'
  const orbitColor = ORBIT_COLOR[orbit] ?? '#00d4ff'
  const provider   = launch.launch_service_provider?.name ?? '—'
  const provColor  = PROVIDER_COLOR[provider] ?? 'rgba(255,255,255,0.5)'
  const isLive     = launch.status === 'In Flight'

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-40px' }}
      transition={{ duration:0.5, ease:[0.16,1,0.3,1], delay:index*0.06 }}
      className={`relative panel-glass rounded-sm overflow-hidden cursor-pointer transition-all duration-300 group ${featured ? 'border border-pulsar/25' : 'border border-transparent hover:border-white/10'} ${isLive ? 'border-alert/40' : ''}`}
      style={featured ? { boxShadow:'0 0 30px rgba(0,212,255,0.08)' } : undefined}
      onClick={() => setExpanded(e => !e)}
    >
      {featured && <><div className="corner-tl"/><div className="corner-tr"/><div className="corner-bl"/><div className="corner-br"/></>}
      {isLive && <motion.div className="absolute inset-0 rounded-sm pointer-events-none" style={{ border:'1px solid rgba(255,61,90,0.5)' }} animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.2, repeat:Infinity }} />}

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="label-mono" style={{ color:provColor }}>{provider}</span>
              <span className="text-white/15">·</span>
              <span className="label-mono text-white/30">{launch.rocket?.name}</span>
            </div>
            <h3 className={`font-body text-white/85 leading-snug transition-colors duration-200 group-hover:text-white ${featured ? 'text-hud-lg' : 'text-hud-base'}`}>
              {launch.mission?.name ?? launch.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <motion.span className="label-mono px-2 py-1 rounded-sm"
              style={{ color:status.color, background:status.glow.replace(/[\d.]+\)$/,'0.12)'), border:`1px solid ${status.color}35` }}
              animate={isLive ? { boxShadow:[`0 0 8px ${status.glow}`,`0 0 20px ${status.glow}`,`0 0 8px ${status.glow}`] } : undefined}
              transition={isLive ? { duration:1.2, repeat:Infinity } : undefined}>
              {isLive ? '● LIVE' : status.short}
            </motion.span>
            <span className="label-mono px-1.5 py-0.5 rounded-sm text-hud-xs" style={{ color:orbitColor, background:`${orbitColor}12`, border:`1px solid ${orbitColor}25` }}>{orbit}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <span className="label-mono text-white/25 truncate">{launch.pad?.name} · {launch.pad?.location?.name}</span>
          <span className="label-mono text-white/15">{new Date(launch.net).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
          {launch.mission?.type && <MissionTypeBadge type={launch.mission.type} />}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <CountdownClock net={launch.net} color={status.color} size={featured ? 'large' : 'normal'} />
          <motion.div animate={{ rotate:expanded ? 180 : 0 }} transition={{ duration:0.3 }} className="label-mono text-white/20 hover:text-white/50 transition-colors duration-200 ml-2">▾</motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1] }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-0 border-t border-white/5 space-y-2">
              {launch.mission?.description && <p className="font-body text-hud-base text-white/40 leading-relaxed">{launch.mission.description}</p>}
              <div className="grid grid-cols-3 gap-3">
                {[{label:'VEHICLE',value:launch.rocket?.family??'—'},{label:'ORBIT',value:orbit},{label:'AGENCY',value:launch.launch_service_provider?.type??'—'}].map(({label,value}) => (
                  <div key={label}><div className="label-mono text-white/20 mb-0.5">{label}</div><div className="font-mono text-hud-sm text-white/55">{value}</div></div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="label-mono text-white/20">T-0  </span>
                  <span className="font-mono text-hud-sm text-pulsar/70">{new Date(launch.net).toISOString().replace('T',' ').slice(0,19)} UTC</span>
                </div>
                {launch.webcast_live && <span className="label-mono text-telemetry/70 border border-telemetry/25 px-2 py-0.5 rounded-sm">▶ WEBCAST</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}