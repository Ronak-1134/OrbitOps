// src/components/ui/HudPanel.jsx
import { cn } from '@utils/cn'

/**
 * Reusable HUD glass panel
 * @param {string}  className
 * @param {boolean} corners   — show corner SVG decorations
 * @param {string}  label     — optional top label
 * @param {string}  accent    — 'pulsar' | 'solar' | 'alert' | 'telemetry'
 * @param {ReactNode} children
 */
export default function HudPanel({ className, corners = true, label, accent = 'pulsar', children, ...props }) {
  const accentColor = {
    pulsar:    '#00d4ff',
    solar:     '#f5a623',
    alert:     '#ff3d5a',
    telemetry: '#00e5a0',
  }[accent] ?? '#00d4ff'

  return (
    <div
      className={cn('relative panel-glass rounded-sm overflow-hidden', className)}
      style={{ borderColor: `${accentColor}18` }}
      {...props}
    >
      {corners && (
        <>
          <span className="corner-tl" style={{ borderColor: accentColor }} />
          <span className="corner-tr" style={{ borderColor: accentColor }} />
          <span className="corner-bl" style={{ borderColor: accentColor }} />
          <span className="corner-br" style={{ borderColor: accentColor }} />
        </>
      )}
      {label && (
        <div className="px-4 pt-3 pb-0">
          <span className="label-mono" style={{ color: `${accentColor}80` }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  )
}