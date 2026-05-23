// src/sections/Hero/HeroTicker.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const ITEMS = [
  { tag: 'ISS',      text: 'Station velocity 27,600 km/h — orbit nominal'          },
  { tag: 'NEO',      text: '2024 YR4 — closest approach in 38 days — Δv 0.042 AU'  },
  { tag: 'SOLAR',    text: 'X-ray flux B4.2 — no major flares in past 24h'         },
  { tag: 'SAT',      text: 'Starlink Group 9-8 — TLE updated 00:14 UTC'            },
  { tag: 'DEBRIS',   text: 'Object 1999-025F — perigee decay -0.3 km/day'          },
  { tag: 'MISSION',  text: 'SpX-31 docking confirmed — hatch open at 14:22 UTC'    },
  { tag: 'KP',       text: 'Geomagnetic Kp-index 3.7 — G1 minor storm in effect'   },
]

export default function HeroTicker() {
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useEffect(() => {
    if (!trackRef.current) return
    const track = trackRef.current
    const totalW = track.scrollWidth / 2 // duplicated content

    tweenRef.current = gsap.to(track, {
      x: -totalW,
      duration: totalW / 60,   // 60px/s
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalW),
      },
    })

    return () => tweenRef.current?.kill()
  }, [])

  const content = [...ITEMS, ...ITEMS] // duplicate for seamless loop

  return (
    <div
      className="absolute bottom-0 inset-x-0 overflow-hidden border-t"
      style={{
        borderColor: 'rgba(0,212,255,0.12)',
        background: 'rgba(1,2,10,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 25,
      }}
    >
      <div className="flex items-center">
        {/* Static label */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-r"
          style={{ borderColor: 'rgba(0,212,255,0.15)' }}>
          <span className="status-dot live animate-blink" />
          <span className="label-mono text-pulsar/60 whitespace-nowrap">LIVE FEED</span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          <div ref={trackRef} className="flex items-center whitespace-nowrap will-change-transform">
            {content.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6">
                <span className="label-mono text-pulsar/50 shrink-0">[{item.tag}]</span>
                <span className="font-mono text-hud-xs text-white/40">{item.text}</span>
                <span className="text-white/15 ml-2">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}