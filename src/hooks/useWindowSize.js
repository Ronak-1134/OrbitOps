// src/hooks/useWindowSize.js
import { useState, useEffect } from 'react'

export default function useWindowSize() {
  const [size, setSize] = useState({
    width:  typeof window !== 'undefined' ? window.innerWidth  : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    ...size,
    isMobile:  size.width < 768,
    isTablet:  size.width >= 768 && size.width < 1024,
    isDesktop: size.width >= 1024,
  }
}