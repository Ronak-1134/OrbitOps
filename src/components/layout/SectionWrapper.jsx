// src/components/layout/SectionWrapper.jsx
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import ErrorBoundary from '@components/ui/ErrorBoundary'

function LoadingFallback({ label = 'LOADING MODULE' }) {
  return (
    <div className="w-full py-32 flex items-center justify-center bg-void-950">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border border-pulsar/40 border-t-pulsar rounded-full animate-spin" />
        <span className="label-mono text-pulsar/40">{label}</span>
      </div>
    </div>
  )
}

/**
 * Wraps every section with:
 * - ErrorBoundary (catches render errors)
 * - Suspense fallback
 * - Framer Motion viewport entrance fade
 */
export default function SectionWrapper({ id, label, children }) {
  return (
    <div id={id}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback label={label ? `LOADING ${label}` : undefined} />}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}