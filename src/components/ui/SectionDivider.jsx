// src/components/ui/SectionDivider.jsx
export default function SectionDivider({ flip = false }) {
  return (
    <div className="relative w-full h-px overflow-visible" style={{ zIndex: 20 }}>
      {/* Main line */}
      <div
        className="absolute inset-0"
        style={{
          background: flip
            ? 'linear-gradient(90deg, transparent, rgba(0,212,255,0.25), rgba(0,212,255,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,212,255,0.08), rgba(0,212,255,0.25), transparent)',
        }}
      />

      {/* Center diamond */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
        style={{ background: '#00d4ff', boxShadow: '0 0 6px rgba(0,212,255,0.8)' }}
      />

      {/* Left dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
        style={{ left: '25%', background: 'rgba(0,212,255,0.4)' }}
      />

      {/* Right dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
        style={{ right: '25%', background: 'rgba(0,212,255,0.4)' }}
      />

      {/* Label */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 label-mono px-3"
        style={{
          left: flip ? '75%' : '25%',
          color: 'rgba(0,212,255,0.3)',
          background: 'var(--void-950, #01020a)',
          fontSize: '0.55rem',
        }}
      >
        ◆ ORBITOPS
      </div>
    </div>
  )
}