// src/sections/LaunchSchedule/LaunchTimeline.jsx
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { getStatus, formatCountdown } from '@hooks/useLaunchData'

// Mini timeline node
function TimelineNode({ launch, index, total }) {
  const status  = getStatus(launch.status)
  const cd      = formatCountdown(launch.net)
  const isFirst = index === 0

  return (
    <motion.div
      initial={{ opacity:0, x:-12 }}
      whileInView={{ opacity:1, x:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.4, delay:index*0.05, ease:[0.16,1,0.3,1] }}
      className="relative flex gap-4 pb-5 last:pb-0 group"
    >
      {/* Timeline spine */}
      {index < total - 1 && (
        <div className="absolute left-[7px] top-5 bottom-0 w-px"
          style={{ background:`linear-gradient(180deg, ${status.color}40, rgba(0,212,255,0.06))` }} />
      )}

      {/* Node dot */}
      <div className="relative shrink-0 mt-0.5">
        <motion.div
          className="w-3.5 h-3.5 rounded-full border"
          style={{ background: isFirst ? status.color : `${status.color}30`, borderColor: status.color, boxShadow: isFirst ? `0 0 10px ${status.glow}` : 'none' }}
          animate={isFirst ? { scale:[1,1.25,1] } : undefined}
          transition={isFirst ? { duration:2, repeat:Infinity } : undefined}
        />
        {isFirst && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border:`1px solid ${status.color}`, boxShadow:`0 0 8px ${status.color}` }}
            animate={{ scale:[1,2], opacity:[0.6,0] }}
            transition={{ duration:2, repeat:Infinity }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="label-mono text-white/25 mb-0.5">
              {launch.launch_service_provider?.name}
            </div>
            <div className="font-body text-hud-base text-white/70 truncate group-hover:text-white/90 transition-colors duration-200">
              {launch.mission?.name ?? launch.name}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-mono text-hud-xs tabular-nums" style={{ color:status.color }}>
              {cd.negative ? 'DONE' : cd.str}
            </div>
            <div className="label-mono text-white/20 mt-0.5">
              {new Date(launch.net).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
            </div>
          </div>
        </div>
        {/* Pad */}
        <div className="label-mono text-white/20 mt-0.5 truncate">{launch.pad?.name} — {launch.pad?.location?.name}</div>
      </div>
    </motion.div>
  )
}

export default function LaunchTimeline({ launches = [] }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(wrapRef.current,
      { x:24, opacity:0 },
      { x:0, opacity:1, duration:0.7, ease:'power3.out', delay:0.2 }
    )
  }, [])

  return (
    <div ref={wrapRef} className="panel-glass rounded-sm p-4 h-full relative" style={{ opacity:0 }}>
      <div className="corner-tl"/><div className="corner-tr"/>
      <div className="corner-bl"/><div className="corner-br"/>

      <div className="flex items-center justify-between mb-5">
        <span className="label-mono text-white/30">UPCOMING — TIMELINE</span>
        <span className="label-mono text-white/20">{launches.length} MISSIONS</span>
      </div>

      <div className="overflow-y-auto no-scrollbar" style={{ maxHeight:520 }}>
        {launches.map((l,i) => (
          <TimelineNode key={l.id} launch={l} index={i} total={launches.length} />
        ))}
      </div>
    </div>
  )
}