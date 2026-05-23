// src/hooks/useAsteroidData.js
import { useState, useEffect, useCallback } from 'react'

// NASA NeoWs — no key needed for demo rate (40 req/hr)
const NASA_API  = 'https://api.nasa.gov/neo/rest/v1/feed'
const API_KEY   = 'DEMO_KEY'

// ── Threat scoring ────────────────────────────────────────────────
function threatLevel(neo) {
  const dist  = parseFloat(neo.close_approach_data?.[0]?.miss_distance?.lunar ?? 100)
  const diam  = parseFloat(neo.estimated_diameter?.meters?.estimated_diameter_max ?? 0)
  const haz   = neo.is_potentially_hazardous_asteroid

  if (haz && dist < 5  && diam > 140) return 'CRITICAL'
  if (haz && dist < 15)               return 'HIGH'
  if (haz || dist < 30)               return 'MODERATE'
  return 'LOW'
}

function parseNeo(neo) {
  const ca   = neo.close_approach_data?.[0] ?? {}
  const diam = neo.estimated_diameter?.meters ?? {}
  return {
    id:           neo.id,
    name:         neo.name.replace(/[()]/g, '').trim(),
    designation:  neo.name,
    hazardous:    neo.is_potentially_hazardous_asteroid,
    diamMin:      parseFloat(diam.estimated_diameter_min ?? 0).toFixed(1),
    diamMax:      parseFloat(diam.estimated_diameter_max ?? 0).toFixed(1),
    distLunar:    parseFloat(ca.miss_distance?.lunar      ?? 0).toFixed(2),
    distKm:       parseFloat(ca.miss_distance?.kilometers ?? 0).toFixed(0),
    distAu:       parseFloat(ca.miss_distance?.astronomical ?? 0).toFixed(4),
    velocity:     parseFloat(ca.relative_velocity?.kilometers_per_second ?? 0).toFixed(2),
    velKmh:       parseFloat(ca.relative_velocity?.kilometers_per_hour ?? 0).toFixed(0),
    closeDate:    ca.close_approach_date ?? '—',
    closeTime:    ca.close_approach_date_full ?? '—',
    orbitClass:   neo.orbital_data?.orbit_class?.orbit_class_type ?? '—',
    absoluteMag:  neo.absolute_magnitude_h ?? 0,
    threat:       threatLevel(neo),
    nasaUrl:      neo.nasa_jpl_url,
  }
}

// ── Deterministic fallback (used when API unavailable) ────────────
export const FALLBACK_ASTEROIDS = [
  { id:'f1', name:'2024 YR4',     designation:'(2024 YR4)',  hazardous:true,  diamMin:'40.1',  diamMax:'89.4',  distLunar:'1.82',  distKm:'699341',   distAu:'0.0046', velocity:'17.34', velKmh:'62424',  closeDate:'2032-12-22', closeTime:'2032-Dec-22 11:14', orbitClass:'Aten',  absoluteMag:24.2, threat:'CRITICAL', nasaUrl:'#' },
  { id:'f2', name:'2023 BU',      designation:'(2023 BU)',   hazardous:true,  diamMin:'3.8',   diamMax:'8.4',   distLunar:'0.07',  distKm:'27200',    distAu:'0.0002', velocity:'9.32',  velKmh:'33552',  closeDate:'2025-01-26', closeTime:'2025-Jan-26 04:27', orbitClass:'Apollo',absoluteMag:28.4, threat:'HIGH',     nasaUrl:'#' },
  { id:'f3', name:'2025 BX3',     designation:'(2025 BX3)',  hazardous:true,  diamMin:'110.0', diamMax:'246.0', distLunar:'12.4',  distKm:'4763000',  distAu:'0.0318', velocity:'22.14', velKmh:'79704',  closeDate:'2025-03-14', closeTime:'2025-Mar-14 18:03', orbitClass:'Apollo',absoluteMag:21.1, threat:'HIGH',     nasaUrl:'#' },
  { id:'f4', name:'(99942) Apophis',designation:'(99942)',   hazardous:true,  diamMin:'310.0', diamMax:'340.0', distLunar:'4.21',  distKm:'1615584',  distAu:'0.0108', velocity:'7.42',  velKmh:'26712',  closeDate:'2029-04-13', closeTime:'2029-Apr-13 21:46', orbitClass:'Aten',  absoluteMag:19.7, threat:'HIGH',     nasaUrl:'#' },
  { id:'f5', name:'2024 PT5',     designation:'(2024 PT5)', hazardous:false, diamMin:'8.7',   diamMax:'19.5',  distLunar:'3.52',  distKm:'1350000',  distAu:'0.0090', velocity:'0.84',  velKmh:'3024',   closeDate:'2025-01-09', closeTime:'2025-Jan-09 07:31', orbitClass:'Amor',  absoluteMag:27.1, threat:'MODERATE', nasaUrl:'#' },
  { id:'f6', name:'2015 RN35',    designation:'(2015 RN35)',hazardous:false, diamMin:'152.0', diamMax:'340.0', distLunar:'8.03',  distKm:'3082000',  distAu:'0.0206', velocity:'15.50', velKmh:'55800',  closeDate:'2022-12-15', closeTime:'2022-Dec-15 02:30', orbitClass:'Apollo',absoluteMag:21.8, threat:'MODERATE', nasaUrl:'#' },
  { id:'f7', name:'2024 JH2',     designation:'(2024 JH2)', hazardous:false, diamMin:'21.0',  diamMax:'47.0',  distLunar:'18.7',  distKm:'7173000',  distAu:'0.0479', velocity:'11.22', velKmh:'40392',  closeDate:'2025-05-03', closeTime:'2025-May-03 09:11', orbitClass:'Apollo',absoluteMag:25.6, threat:'LOW',      nasaUrl:'#' },
  { id:'f8', name:'2024 MK',      designation:'(2024 MK)',  hazardous:false, diamMin:'120.0', diamMax:'270.0', distLunar:'29.1',  distKm:'11162000', distAu:'0.0746', velocity:'19.84', velKmh:'71424',  closeDate:'2024-06-29', closeTime:'2024-Jun-29 13:45', orbitClass:'Apollo',absoluteMag:21.9, threat:'LOW',      nasaUrl:'#' },
  { id:'f9', name:'2025 AH2',     designation:'(2025 AH2)', hazardous:false, diamMin:'5.2',   diamMax:'11.6',  distLunar:'34.5',  distKm:'13225000', distAu:'0.0884', velocity:'8.72',  velKmh:'31392',  closeDate:'2025-02-14', closeTime:'2025-Feb-14 22:08', orbitClass:'Amor',  absoluteMag:28.0, threat:'LOW',      nasaUrl:'#' },
]

// ── Hook ──────────────────────────────────────────────────────────
export default function useAsteroidData() {
  const [asteroids, setAsteroids] = useState(FALLBACK_ASTEROIDS)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [source,    setSource]    = useState('fallback')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const today    = new Date()
      const end      = today.toISOString().slice(0, 10)
      const start    = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10)
      const url      = `${NASA_API}?start_date=${start}&end_date=${end}&api_key=${API_KEY}`
      const res      = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json     = await res.json()
      const allNeos  = Object.values(json.near_earth_objects ?? {}).flat()
      if (!allNeos.length) throw new Error('empty response')

      const parsed = allNeos
        .map(parseNeo)
        .sort((a, b) => parseFloat(a.distLunar) - parseFloat(b.distLunar))
        .slice(0, 20)

      setAsteroids(parsed)
      setSource('nasa')
      setError(null)
    } catch (e) {
      setError(e.message)
      setSource('fallback')
      // Keep fallback data visible
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return { asteroids, loading, error, source, refetch: fetchData }
}

// ── Threat config ─────────────────────────────────────────────────
export const THREAT_CONFIG = {
  CRITICAL: { color: '#ff3d5a', glow: 'rgba(255,61,90,0.4)',   label: 'CRITICAL', ring: 0.5  },
  HIGH:     { color: '#f5a623', glow: 'rgba(245,166,35,0.4)',  label: 'HIGH',     ring: 1.5  },
  MODERATE: { color: '#00d4ff', glow: 'rgba(0,212,255,0.35)',  label: 'MODERATE', ring: 3.0  },
  LOW:      { color: '#00e5a0', glow: 'rgba(0,229,160,0.25)',  label: 'LOW',      ring: 5.0  },
}