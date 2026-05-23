// src/utils/motionVariants.js
// Framer Motion variant presets for ORBITOPS components

// ── ENTRANCE VARIANTS ─────────────────────────────────────────────

export const fadeUp = {
  hidden:  { y: 20,  opacity: 0, filter: 'blur(4px)' },
  visible: { y: 0,   opacity: 1, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
}

export const fadeDown = {
  hidden:  { y: -20, opacity: 0 },
  visible: { y: 0,   opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
}

export const scaleIn = {
  hidden:  { scale: 0.85, opacity: 0 },
  visible: { scale: 1,    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
}

export const hudReveal = {
  hidden:  { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0 },
  visible: { clipPath: 'inset(0% 0% 0% 0%)',    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  },
}

// ── STAGGER CONTAINER ─────────────────────────────────────────────

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden:  {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay }
  },
})

export const staggerItem = {
  hidden:  { y: 16, opacity: 0 },
  visible: { y: 0,  opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  },
}

// ── PANEL / CARD VARIANTS ─────────────────────────────────────────

export const panelVariants = {
  hidden:  { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, y: -8, scale: 0.98,
    transition: { duration: 0.3, ease: [0.77, 0, 0.175, 1] }
  },
}

// ── HUD LINE / BORDER DRAW ────────────────────────────────────────

export const lineDrawH = {
  hidden:  { scaleX: 0, originX: 0 },
  visible: { scaleX: 1,
    transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] }
  },
}

export const lineDrawV = {
  hidden:  { scaleY: 0, originY: 0 },
  visible: { scaleY: 1,
    transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] }
  },
}

// ── AMBIENT LOOP ──────────────────────────────────────────────────

export const floatVariant = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 6, ease: 'easeInOut', repeat: Infinity }
  },
}

export const pulseVariant = (scale = 1.04, duration = 2.5) => ({
  animate: {
    scale: [1, scale, 1],
    transition: { duration, ease: 'easeInOut', repeat: Infinity }
  },
})

export const glowVariant = (color = 'rgba(0,212,255,0.5)') => ({
  animate: {
    boxShadow: [
      `0 0 10px ${color.replace(/[\d.]+\)$/, '0.15)')}`,
      `0 0 30px ${color}, 0 0 70px ${color.replace(/[\d.]+\)$/, '0.1)')}`,
      `0 0 10px ${color.replace(/[\d.]+\)$/, '0.15)')}`,
    ],
    transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity }
  },
})

// ── PAGE TRANSITIONS ──────────────────────────────────────────────

export const pageTransition = {
  initial:  { opacity: 0, scale: 1.02, filter: 'blur(6px)' },
  animate:  { opacity: 1, scale: 1,    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  },
  exit:     { opacity: 0, scale: 0.98, filter: 'blur(6px)',
    transition: { duration: 0.35, ease: [0.77, 0, 0.175, 1] }
  },
}

// ── HOVER PRESETS ─────────────────────────────────────────────────

export const hoverGlow = {
  rest:  { scale: 1 },
  hover: { scale: 1.03,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
}

export const hoverLift = {
  rest:  { y: 0, boxShadow: '0 0 10px rgba(0,212,255,0.15)' },
  hover: { y: -3, boxShadow: '0 0 25px rgba(0,212,255,0.35)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
}