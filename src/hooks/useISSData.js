// src/hooks/useISSData.js
import { useState, useEffect, useRef, useCallback } from 'react'

const ISS_API      = 'https://api.wheretheiss.at/v1/satellites/25544'
const POLL_MS      = 5000
const HISTORY_MAX  = 120   // keep last 120 positions for trail

function toXY(lat, lon, w, h) {
  const x = ((lon + 180) / 360) * w
  const y = ((90 - lat) / 180) * h
  return { x, y }
}

export default function useISSData() {
  const [data,    setData]    = useState(null)
  const [history, setHistory] = useState([])
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)
  const abortRef = useRef(null)

  const fetch_ = useCallback(async () => {
    try {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      const res  = await fetch(ISS_API, { signal: abortRef.current.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      const pos = {
        lat:       parseFloat(json.latitude),
        lon:       parseFloat(json.longitude),
        alt:       parseFloat(json.altitude),
        velocity:  parseFloat(json.velocity),
        timestamp: json.timestamp,
        visibility:json.visibility,
      }

      setData(pos)
      setHistory(h => {
        const next = [...h, pos]
        return next.length > HISTORY_MAX ? next.slice(-HISTORY_MAX) : next
      })
      setError(null)
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    const id = setInterval(fetch_, POLL_MS)
    return () => {
      clearInterval(id)
      abortRef.current?.abort()
    }
  }, [fetch_])

  // Map coords (0-1 normalized)
  const mapPos = data
    ? toXY(data.lat, data.lon, 1, 1)
    : null

  return { data, history, mapPos, error, loading, refetch: fetch_ }
}