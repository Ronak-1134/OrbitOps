import { useState, useEffect } from 'react'

export default function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { threshold: 0.3 }
    )
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return active
}