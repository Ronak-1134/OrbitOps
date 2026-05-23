/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── COLOR TOKENS ──────────────────────────────────────────
      colors: {
        // Voids — deep background layers
        void: {
          950: '#01020a',
          900: '#03050f',
          800: '#060b1a',
          700: '#0b1228',
        },
        // Nebula — atmospheric mid-tones
        nebula: {
          DEFAULT: '#0d1f3c',
          light: '#142a52',
          glow: '#1a3566',
        },
        // Pulsar — primary accent (cold cyan)
        pulsar: {
          DEFAULT: '#00d4ff',
          dim:    '#0099cc',
          bright: '#33eeff',
          glow:   'rgba(0,212,255,0.15)',
        },
        // Solar — secondary accent (amber/gold)
        solar: {
          DEFAULT: '#f5a623',
          dim:    '#c47d0e',
          bright: '#ffbd4a',
          glow:   'rgba(245,166,35,0.15)',
        },
        // Alert — status red
        alert: {
          DEFAULT: '#ff3d5a',
          dim:    '#cc1e38',
          glow:   'rgba(255,61,90,0.15)',
        },
        // Telemetry — data green
        telemetry: {
          DEFAULT: '#00e5a0',
          dim:    '#00b87e',
          glow:   'rgba(0,229,160,0.15)',
        },
        // HUD — neutral surface
        hud: {
          100: 'rgba(255,255,255,0.06)',
          200: 'rgba(255,255,255,0.10)',
          300: 'rgba(255,255,255,0.16)',
          border: 'rgba(0,212,255,0.12)',
          'border-bright': 'rgba(0,212,255,0.35)',
        },
      },

      // ── TYPOGRAPHY ────────────────────────────────────────────
      fontFamily: {
        // Display — headlines, mission titles
        display: ['"Orbitron"', 'monospace'],
        // Body — data readouts, paragraphs
        body: ['"Rajdhani"', 'sans-serif'],
        // Mono — telemetry, coordinates, code
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      fontSize: {
        'hud-xs':  ['0.625rem', { letterSpacing: '0.12em', lineHeight: '1' }],
        'hud-sm':  ['0.75rem',  { letterSpacing: '0.10em', lineHeight: '1.2' }],
        'hud-base':['0.875rem', { letterSpacing: '0.08em', lineHeight: '1.4' }],
        'hud-lg':  ['1rem',     { letterSpacing: '0.06em', lineHeight: '1.4' }],
        'hud-xl':  ['1.25rem',  { letterSpacing: '0.04em', lineHeight: '1.3' }],
        'hud-2xl': ['1.5rem',   { letterSpacing: '0.04em', lineHeight: '1.2' }],
        'hud-4xl': ['2.5rem',   { letterSpacing: '0.06em', lineHeight: '1' }],
        'hud-6xl': ['4rem',     { letterSpacing: '0.08em', lineHeight: '0.95' }],
        'hud-8xl': ['6rem',     { letterSpacing: '0.10em', lineHeight: '0.9' }],
      },

      // ── SPACING / SIZING ──────────────────────────────────────
      spacing: {
        'panel': '1.5rem',
        'panel-lg': '2.5rem',
      },
      borderRadius: {
        'panel': '2px',
        'panel-lg': '4px',
      },

      // ── SHADOWS / GLOW ────────────────────────────────────────
      boxShadow: {
        'pulsar':     '0 0 20px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.08)',
        'pulsar-sm':  '0 0 10px rgba(0,212,255,0.30)',
        'pulsar-lg':  '0 0 40px rgba(0,212,255,0.35), 0 0 100px rgba(0,212,255,0.12)',
        'solar':      '0 0 20px rgba(245,166,35,0.25)',
        'solar-sm':   '0 0 10px rgba(245,166,35,0.30)',
        'alert':      '0 0 20px rgba(255,61,90,0.30)',
        'telemetry':  '0 0 20px rgba(0,229,160,0.25)',
        'hud-inset':  'inset 0 1px 0 rgba(255,255,255,0.05)',
        'panel':      '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
      },

      // ── BACKGROUNDS ───────────────────────────────────────────
      backgroundImage: {
        'grid-hud': `
          linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
        `,
        'scanline': `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.15) 2px,
          rgba(0,0,0,0.15) 4px
        )`,
        'radial-void': 'radial-gradient(ellipse at center, #060b1a 0%, #01020a 70%)',
        'radial-pulsar': 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
        'vignette': 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
        'grid-80': '80px 80px',
      },

      // ── ANIMATION ─────────────────────────────────────────────
      keyframes: {
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
          '75%': { opacity: 0.92 },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.2)' },
          '50%':       { boxShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'orbit': {
          from: { transform: 'rotate(0deg) translateX(var(--orbit-r)) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'data-flow': {
          '0%':   { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'blink': {
          '0%, 100%': { opacity: 1 },
          '50%':       { opacity: 0 },
        },
        'hud-open': {
          from: { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0 },
          to:   { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
        'count-up': {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'flicker':       'flicker 4s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 3s ease-in-out infinite',
        'scan':          'scan 8s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 10s ease-in-out infinite',
        'radar-sweep':   'radar-sweep 4s linear infinite',
        'blink':         'blink 1.2s step-end infinite',
        'blink-slow':    'blink 2.4s step-end infinite',
        'hud-open':      'hud-open 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up':      'slide-up 0.5s ease forwards',
        'count-up':      'count-up 0.4s ease forwards',
      },

      // ── TRANSITION ────────────────────────────────────────────
      transitionTimingFunction: {
        'hud': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'cinematic': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [],
}