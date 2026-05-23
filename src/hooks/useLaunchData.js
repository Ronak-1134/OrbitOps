// src/hooks/useLaunchData.js
import { useState, useEffect, useCallback } from 'react'

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=12&format=json'

export const STATUS_CONFIG = {
  'Go for Launch':     { code:'GO',      color:'#00e5a0', glow:'rgba(0,229,160,0.4)',  short:'GO'    },
  'TBD':               { code:'TBD',     color:'#00d4ff', glow:'rgba(0,212,255,0.3)',  short:'TBD'   },
  'TBC':               { code:'TBC',     color:'#f5a623', glow:'rgba(245,166,35,0.35)',short:'TBC'   },
  'Hold':              { code:'HOLD',    color:'#ff3d5a', glow:'rgba(255,61,90,0.4)',  short:'HOLD'  },
  'In Flight':         { code:'LIVE',    color:'#ff3d5a', glow:'rgba(255,61,90,0.5)',  short:'LIVE'  },
  'Launch Successful': { code:'SUCCESS', color:'#00e5a0', glow:'rgba(0,229,160,0.3)',  short:'DONE'  },
  'Launch Failure':    { code:'FAILED',  color:'#ff3d5a', glow:'rgba(255,61,90,0.4)',  short:'FAIL'  },
}

export function getStatus(s) {
  return STATUS_CONFIG[s] ?? { code: (s ?? 'UNK').slice(0,4).toUpperCase(), color:'rgba(255,255,255,0.3)', glow:'transparent', short:'UNK' }
}

export function formatCountdown(isoDate) {
  const delta = new Date(isoDate) - Date.now()
  if (delta < 0) return { str:'LAUNCHED', negative:true, days:0, hours:0, mins:0, secs:0 }
  const days  = Math.floor(delta / 86400000)
  const hours = Math.floor((delta % 86400000) / 3600000)
  const mins  = Math.floor((delta % 3600000) / 60000)
  const secs  = Math.floor((delta % 60000) / 1000)
  const str   = days > 0
    ? `T-${days}D ${String(hours).padStart(2,'0')}H ${String(mins).padStart(2,'0')}M`
    : `T-${String(hours).padStart(2,'0')}H ${String(mins).padStart(2,'0')}M ${String(secs).padStart(2,'0')}S`
  return { str, negative:false, days, hours, mins, secs }
}

const now = Date.now()
const ahead = n => new Date(now + n * 86400000).toISOString()

export const FALLBACK_LAUNCHES = [
  { id:'fl1', name:'Falcon 9 | Starlink Group 10-5',  net:ahead(1.4),  status:'Go for Launch', rocket:{name:'Falcon 9 Block 5',family:'Falcon'},  launch_service_provider:{name:'SpaceX',type:'Commercial'},         pad:{name:'SLC-40',  location:{name:'Cape Canaveral, FL'}},            mission:{name:'Starlink Group 10-5',  type:'Communications',   orbit:{abbrev:'LEO'}, description:'Batch of 23 Starlink v2 Mini satellites.'} },
  { id:'fl2', name:'Vulcan Centaur | USSF-87',         net:ahead(3.2),  status:'Go for Launch', rocket:{name:'Vulcan VC2S',  family:'Vulcan'},    launch_service_provider:{name:'ULA',type:'Commercial'},             pad:{name:'SLC-41',  location:{name:'Cape Canaveral, FL'}},            mission:{name:'USSF-87',             type:'Government',       orbit:{abbrev:'GEO'}, description:'Classified USSF payload on Vulcan Cert-2.'} },
  { id:'fl3', name:'New Glenn | NG-2',                  net:ahead(6.8),  status:'TBC',           rocket:{name:'New Glenn',    family:'New Glenn'},  launch_service_provider:{name:'Blue Origin',type:'Commercial'},     pad:{name:'LC-36',   location:{name:'Cape Canaveral, FL'}},            mission:{name:'NG-2',                type:'Test Flight',      orbit:{abbrev:'LEO'}, description:'Second orbital flight test with booster recovery.'} },
  { id:'fl4', name:'Soyuz-2.1b | Glonass-M No.62',     net:ahead(9.5),  status:'Go for Launch', rocket:{name:'Soyuz-2.1b',   family:'Soyuz'},      launch_service_provider:{name:'Roscosmos',type:'Government'},      pad:{name:'Site 43/4',location:{name:'Plesetsk Cosmodrome, Russia'}},  mission:{name:'Glonass-M No.62',     type:'Navigation',       orbit:{abbrev:'MEO'}, description:'Replacement GLONASS-M navigation satellite.'} },
  { id:'fl5', name:'Falcon Heavy | GOES-U',             net:ahead(14.1), status:'TBD',           rocket:{name:'Falcon Heavy', family:'Falcon'},    launch_service_provider:{name:'SpaceX',type:'Commercial'},         pad:{name:'LC-39A',  location:{name:'Kennedy Space Center, FL'}},       mission:{name:'GOES-U',              type:'Earth Science',    orbit:{abbrev:'GTO'}, description:'Final GOES-R series satellite for NOAA weather.'} },
  { id:'fl6', name:'H3 | ALOS-4',                       net:ahead(18.7), status:'Go for Launch', rocket:{name:'H3 Block 1',   family:'H3'},          launch_service_provider:{name:'JAXA',type:'Government'},          pad:{name:'LA-Y2',   location:{name:'Tanegashima, Japan'}},             mission:{name:'ALOS-4',              type:'Earth Observation',orbit:{abbrev:'SSO'}, description:'Advanced Land Observing Satellite-4 (Daichi-4).'} },
  { id:'fl7', name:'Ariane 6 | Sentinel-1C',            net:ahead(22.3), status:'TBD',           rocket:{name:'Ariane 62',    family:'Ariane 6'},   launch_service_provider:{name:'Arianespace',type:'Commercial'},    pad:{name:'ELA-4',   location:{name:'Guiana Space Centre, French Guiana'}}, mission:{name:'Sentinel-1C',         type:'Earth Observation',orbit:{abbrev:'SSO'}, description:'ESA Copernicus SAR satellite, replaces Sentinel-1B.'} },
  { id:'fl8', name:'Falcon 9 | Dragon CRS-32',          net:ahead(28.6), status:'TBD',           rocket:{name:'Falcon 9 Block 5',family:'Falcon'},  launch_service_provider:{name:'SpaceX',type:'Commercial'},         pad:{name:'LC-39A',  location:{name:'Kennedy Space Center, FL'}},       mission:{name:'Dragon CRS-32',       type:'Resupply',         orbit:{abbrev:'LEO'}, description:'32nd commercial resupply mission to the ISS.'} },
]

function parseLaunch(l) {
  return {
    id:    l.id, name: l.name, net: l.net, status: l.status?.name ?? 'TBD',
    rocket: { name: l.rocket?.configuration?.name ?? '—', family: l.rocket?.configuration?.family ?? '—' },
    launch_service_provider: { name: l.launch_service_provider?.name ?? '—', type: l.launch_service_provider?.type?.name ?? '—' },
    pad: { name: l.pad?.name ?? '—', location: { name: l.pad?.location?.name ?? '—' } },
    mission: { name: l.mission?.name ?? l.name, type: l.mission?.type ?? '—', orbit: { abbrev: l.mission?.orbit?.abbrev ?? '—' }, description: l.mission?.description ?? '' },
    image: l.image ?? null, webcast_live: l.webcast_live ?? false,
  }
}

export default function useLaunchData() {
  const [launches, setLaunches] = useState(FALLBACK_LAUNCHES)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [source,   setSource]   = useState('fallback')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(API_URL, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.results?.length) throw new Error('empty')
      setLaunches(json.results.map(parseLaunch))
      setSource('thespacedevs'); setError(null)
    } catch (e) {
      setError(e.message); setSource('fallback')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  return { launches, loading, error, source, refetch: fetchData }
}