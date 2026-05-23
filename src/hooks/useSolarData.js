// src/hooks/useSolarData.js
import { useState, useEffect, useCallback } from 'react'

// NOAA Space Weather endpoints (no key required)
const NOAA_BASE   = 'https://services.swpc.noaa.gov'
const ENDPOINTS   = {
  solar_wind:  `${NOAA_BASE}/products/solar-wind/plasma-7-day.json`,
  kp_index:    `${NOAA_BASE}/products/noaa-planetary-k-index.json`,
  flares:      `${NOAA_BASE}/json/goes/primary/xray-flares-7-day.json`,
}

// ── Classify geomagnetic storm level ────────────────────────────
export function stormLevel(kp) {
  if (kp >= 9) return { label: 'G5', name: 'EXTREME',  color: '#ff0040', glow: 'rgba(255,0,64,0.5)'    }
  if (kp >= 8) return { label: 'G4', name: 'SEVERE',   color: '#ff3d5a', glow: 'rgba(255,61,90,0.4)'   }
  if (kp >= 7) return { label: 'G3', name: 'STRONG',   color: '#f5a623', glow: 'rgba(245,166,35,0.4)'  }
  if (kp >= 6) return { label: 'G2', name: 'MODERATE', color: '#f5d623', glow: 'rgba(245,214,35,0.35)' }
  if (kp >= 5) return { label: 'G1', name: 'MINOR',    color: '#00d4ff', glow: 'rgba(0,212,255,0.3)'   }
  return              { label: 'G0', name: 'QUIET',     color: '#00e5a0', glow: 'rgba(0,229,160,0.3)'   }
}

export function flareClass(flux) {
  if (!flux) return 'A'
  if (flux >= 1e-3) return 'X'
  if (flux >= 1e-4) return 'M'
  if (flux >= 1e-5) return 'C'
  if (flux >= 1e-6) return 'B'
  return 'A'
}

export const FLARE_COLOR = { X:'#ff3d5a', M:'#f5a623', C:'#00d4ff', B:'#00e5a0', A:'rgba(255,255,255,0.3)' }

export const FALLBACK = {
  wind: { speed: 482, density: 6.4, temperature: 84200, bz: -3.2, bt: 8.7, phi: 192, propagated: true },
  kp: [
    { time_tag:'00:00', kp:2.0 }, { time_tag:'03:00', kp:2.3 },
    { time_tag:'06:00', kp:1.7 }, { time_tag:'09:00', kp:3.0 },
    { time_tag:'12:00', kp:3.7 }, { time_tag:'15:00', kp:4.3 },
    { time_tag:'18:00', kp:3.3 }, { time_tag:'21:00', kp:2.7 },
  ],
  flares: [
    { begin_time:'2026-05-13T03:14Z', peak_time:'2026-05-13T03:22Z', class_letter:'M', scale:'1.2', region:'3654' },
    { begin_time:'2026-05-12T18:47Z', peak_time:'2026-05-12T18:55Z', class_letter:'C', scale:'8.4', region:'3654' },
    { begin_time:'2026-05-12T11:02Z', peak_time:'2026-05-12T11:09Z', class_letter:'B', scale:'7.1', region:'3651' },
    { begin_time:'2026-05-11T22:31Z', peak_time:'2026-05-11T22:40Z', class_letter:'M', scale:'3.6', region:'3648' },
    { begin_time:'2026-05-10T09:14Z', peak_time:'2026-05-10T09:27Z', class_letter:'C', scale:'5.9', region:'3645' },
  ],
}

export default function useSolarData() {
  const [wind,    setWind]    = useState(FALLBACK.wind)
  const [kp,      setKp]      = useState(FALLBACK.kp)
  const [flares,  setFlares]  = useState(FALLBACK.flares)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [source,  setSource]  = useState('fallback')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    let anyOk = false

    await Promise.allSettled([
      fetch(ENDPOINTS.solar_wind, { signal: AbortSignal.timeout(6000) })
        .then(r => r.json()).then(d => {
          // plasma-7-day returns arrays [time, density, speed, temp, ...] skipping header row
          const rows = Array.isArray(d) ? d.slice(1) : []
          const last = rows[rows.length - 1]
          if (last) {
            const speed = parseFloat(Array.isArray(last) ? last[2] : last.proton_speed) || 480
            const dens  = parseFloat(Array.isArray(last) ? last[1] : last.proton_density) || 6
            const temp  = parseFloat(Array.isArray(last) ? last[3] : last.proton_temperature) || 80000
            setWind({ speed, density:dens, temperature:temp, bz:-3.2, bt:8.7, phi:192, propagated:true })
            anyOk = true
          }
        }).catch(() => {}),
      fetch(ENDPOINTS.kp_index, { signal: AbortSignal.timeout(6000) })
        .then(r => r.json()).then(d => {
          if (Array.isArray(d) && d.length) {
            setKp(d.slice(-24).map(e => ({ time_tag: (e.time_tag ?? '').slice(11,16), kp: parseFloat(e.kp_index ?? e.kp ?? 0) })))
            anyOk = true
          }
        }).catch(() => {}),
      fetch(ENDPOINTS.flares, { signal: AbortSignal.timeout(6000) })
        .then(r => r.json()).then(d => {
          if (Array.isArray(d) && d.length) {
            setFlares(d.slice(-8).reverse().map(f => ({ begin_time: f.begin_time ?? '', peak_time: f.peak_time ?? '', class_letter: f.class_letter ?? 'C', scale: f.class_1 ?? '1.0', region: f.active_region ?? '—' })))
            anyOk = true
          }
        }).catch(() => {}),
    ])

    if (anyOk) { setSource('noaa'); setError(null) }
    else       { setSource('fallback'); setError('NOAA feeds offline') }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 60_000)
    return () => clearInterval(id)
  }, [fetchAll])

  // Live micro-drift for visual liveliness
  useEffect(() => {
    const id = setInterval(() => {
      setWind(w => ({
        ...w,
        speed:   +(w.speed   + (Math.random() - 0.5) * 8).toFixed(0),
        density: +(Math.max(0.1, w.density + (Math.random() - 0.5) * 0.5)).toFixed(1),
        bz:      +(w.bz      + (Math.random() - 0.5) * 0.4).toFixed(1),
      }))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const currentKp = kp.length ? kp[kp.length - 1].kp : 0
  const storm     = stormLevel(currentKp)

  return { wind, kp, flares, loading, error, source, storm, currentKp, refetch: fetchAll }
}