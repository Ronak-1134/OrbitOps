// src/sections/Hero/HeroSection.jsx
import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion } from 'framer-motion'
import EarthGlobe  from '@three/EarthGlobe'
import HeroContent from './HeroContent'
import HeroHUD     from './HeroHUD'
import HeroTicker  from './HeroTicker'

function CanvasFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 h-64 rounded-full border border-pulsar/20 animate-pulse" />
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-void-950">

      {/* ── BACKGROUND LAYERS ── */}

      {/* Deep radial void */}
      <div className="absolute inset-0 bg-radial-void" />

      {/* HUD grid */}
      <div className="absolute inset-0 bg-hud-grid pointer-events-none opacity-60"
        style={{ backgroundSize: '60px 60px' }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-vignette pointer-events-none" style={{ zIndex: 4 }} />

      {/* Scanlines */}
      <div className="scanlines" style={{ zIndex: 5 }} />

      {/* Left edge fade — so content doesn't compete with canvas */}
      <div
        className="absolute inset-y-0 left-0 w-64 pointer-events-none hidden lg:block"
        style={{
          background: 'linear-gradient(90deg, rgba(1,2,10,0.92) 0%, rgba(1,2,10,0.5) 60%, transparent 100%)',
          zIndex: 6,
        }}
      />

      {/* ── 3D CANVAS ── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 2.9]} fov={55} />
          <ambientLight intensity={0.0} />
          <Suspense fallback={null}>
            <EarthGlobe />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            rotateSpeed={0.35}
            minPolarAngle={Math.PI * 0.25}
            maxPolarAngle={Math.PI * 0.75}
          />
        </Canvas>
      </div>

      {/* ── NAVIGATION ── */}
      {/* Handled by GlobalNav in App.jsx */}

      {/* ── MAIN CONTENT LAYOUT ── */}
      <div className="absolute inset-0 flex items-center" style={{ zIndex: 10 }}>
        <div className="w-full px-6 lg:px-10 pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
            {/* Left — text content */}
            <HeroContent />
            {/* Right — empty, canvas shows through */}
            <div />
          </div>
        </div>
      </div>

      {/* ── FLOATING HUD PANELS ── */}
      <HeroHUD />

      {/* ── CORNER FRAME DECORATIONS ── */}
      <FrameDecorations />

      {/* ── SCROLL INDICATOR ── */}
      <ScrollIndicator />

      {/* ── BOTTOM TICKER ── */}
      <HeroTicker />
    </section>
  )
}

// ── Frame corner SVGs ─────────────────────────────────────────────
function FrameDecorations() {
  return (
    <>
      {/* Top-left */}
      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 15 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L0 0 L40 0" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="0" r="3" fill="#00d4ff" opacity="0.6" />
          <path d="M8 20 L8 8 L20 8" stroke="#00d4ff" strokeWidth="0.5" opacity="0.25" />
        </svg>
      </motion.div>

      {/* Top-right */}
      <motion.div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ zIndex: 15 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M80 40 L80 0 L40 0" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
          <circle cx="80" cy="0" r="3" fill="#00d4ff" opacity="0.6" />
          <path d="M72 20 L72 8 L60 8" stroke="#00d4ff" strokeWidth="0.5" opacity="0.25" />
        </svg>
      </motion.div>

      {/* Bottom-left */}
      <motion.div
        className="absolute bottom-8 left-0 pointer-events-none"
        style={{ zIndex: 15 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M0 40 L0 80 L40 80" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="80" r="3" fill="#00d4ff" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Bottom-right */}
      <motion.div
        className="absolute bottom-8 right-0 pointer-events-none"
        style={{ zIndex: 15 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M80 40 L80 80 L40 80" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
          <circle cx="80" cy="80" r="3" fill="#00d4ff" opacity="0.6" />
        </svg>
      </motion.div>
    </>
  )
}

// ── Scroll indicator ──────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      style={{ zIndex: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.6 }}
    >
      <span className="label-mono text-white/20">SCROLL</span>
      <div className="w-px h-8 relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.5), transparent)' }}
        />
        <motion.div
          className="absolute inset-x-0 h-3 bg-pulsar/50"
          animate={{ y: ['0%', '200%'] }}
          transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
        />
      </div>
    </motion.div>
  )
}