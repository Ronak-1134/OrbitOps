// src/styles/tokens.js
// Runtime-accessible design tokens (mirrors tailwind.config.js)
// Use in JS/GSAP/Three.js where Tailwind classes aren't available

export const colors = {
  void: {
    950: '#01020a',
    900: '#03050f',
    800: '#060b1a',
    700: '#0b1228',
  },
  nebula: {
    DEFAULT: '#0d1f3c',
    light:   '#142a52',
    glow:    '#1a3566',
  },
  pulsar: {
    DEFAULT: '#00d4ff',
    dim:     '#0099cc',
    bright:  '#33eeff',
    glow:    'rgba(0,212,255,0.15)',
  },
  solar: {
    DEFAULT: '#f5a623',
    dim:     '#c47d0e',
    bright:  '#ffbd4a',
    glow:    'rgba(245,166,35,0.15)',
  },
  alert: {
    DEFAULT: '#ff3d5a',
    dim:     '#cc1e38',
    glow:    'rgba(255,61,90,0.15)',
  },
  telemetry: {
    DEFAULT: '#00e5a0',
    dim:     '#00b87e',
    glow:    'rgba(0,229,160,0.15)',
  },
  white: {
    full:  'rgba(255,255,255,1)',
    80:    'rgba(255,255,255,0.80)',
    60:    'rgba(255,255,255,0.60)',
    40:    'rgba(255,255,255,0.40)',
    20:    'rgba(255,255,255,0.20)',
    10:    'rgba(255,255,255,0.10)',
    6:     'rgba(255,255,255,0.06)',
  },
}

export const shadows = {
  pulsarSm: '0 0 10px rgba(0,212,255,0.30)',
  pulsar:   '0 0 20px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.08)',
  pulsarLg: '0 0 40px rgba(0,212,255,0.35), 0 0 100px rgba(0,212,255,0.12)',
  solar:    '0 0 20px rgba(245,166,35,0.25)',
  alert:    '0 0 20px rgba(255,61,90,0.30)',
  telemetry:'0 0 20px rgba(0,229,160,0.25)',
}

export const fonts = {
  display: '"Orbitron", monospace',
  body:    '"Rajdhani", sans-serif',
  mono:    '"Share Tech Mono", monospace',
}

export const easing = {
  hud:       [0.16, 1, 0.3, 1],     // spring-like
  cinematic: [0.77, 0, 0.175, 1],   // dramatic in-out
  smooth:    [0.25, 0.46, 0.45, 0.94],
  // GSAP string equivalents
  hudStr:       'cubic-bezier(0.16, 1, 0.3, 1)',
  cinematicStr: 'cubic-bezier(0.77, 0, 0.175, 1)',
}

export const duration = {
  instant:  0.15,
  fast:     0.3,
  normal:   0.5,
  slow:     0.8,
  cinematic:1.2,
  epic:     2.0,
}

export const zIndex = {
  canvas:  0,
  base:    10,
  panel:   20,
  hud:     30,
  overlay: 40,
  modal:   50,
  loader:  100,
}