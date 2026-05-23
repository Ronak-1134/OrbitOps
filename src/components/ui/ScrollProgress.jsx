// src/components/ui/ScrollProgress.jsx
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 origin-left z-50 pointer-events-none"
      style={{
        scaleX,
        height: '1px',
        background: 'linear-gradient(90deg, #00d4ff, #00e5a0)',
        boxShadow: '0 0 8px rgba(0,212,255,0.6)',
      }}
    />
  )
}