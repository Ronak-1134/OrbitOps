// src/App.jsx — ORBITOPS v1.0
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import CinematicLoader  from '@components/Loader/CinematicLoader'
import GlobalNav        from '@components/layout/GlobalNav'
import SectionWrapper   from '@components/layout/SectionWrapper'
import ScrollProgress   from '@components/ui/ScrollProgress'
import SectionDivider   from '@components/ui/SectionDivider'
import HeroSection      from '@sections/Hero/HeroSection'
import ISSTracker       from '@sections/ISSTracker/ISSTracker'
import SolarWind        from '@sections/SolarWind/SolarWind'
import LaunchSchedule   from '@sections/LaunchSchedule/LaunchSchedule'
import Footer           from '@sections/Footer/Footer'
import useAppStore      from '@stores/useAppStore'

// Heavy sections — lazy loaded
const AsteroidRadar = lazy(() => import('@sections/AsteroidRadar/AsteroidRadar'))

export default function App() {
  const isLoading = useAppStore(s => s.isLoading)

  return (
    <BrowserRouter>
      <AnimatePresence>
        {isLoading && <CinematicLoader key="loader" />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ScrollProgress />
          <GlobalNav />
          <main className="bg-void-950">
            <SectionWrapper id="hero"      label="HERO">       <HeroSection />    </SectionWrapper>
            <SectionDivider />
            <SectionWrapper id="iss"       label="ISS">        <ISSTracker />     </SectionWrapper>
            <SectionDivider flip />
            <SectionWrapper id="asteroids" label="ASTEROID">   <AsteroidRadar />  </SectionWrapper>
            <SectionDivider />
            <SectionWrapper id="solar"     label="SOLAR WIND"> <SolarWind />      </SectionWrapper>
            <SectionDivider flip />
            <SectionWrapper id="launches"  label="LAUNCHES">   <LaunchSchedule /> </SectionWrapper>
          </main>
          <Footer />
        </motion.div>
      )}
    </BrowserRouter>
  )
}