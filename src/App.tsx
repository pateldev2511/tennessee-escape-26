import { useEffect } from 'react'
import { BudgetCalculator } from './components/BudgetCalculator'
import { Footer, Gallery, MobileNavigation, TopBar } from './components/Chrome'
import { GroupPanel } from './components/GroupPanel'
import { ItineraryTimeline } from './components/ItineraryTimeline'
import { PackingChecklist } from './components/PackingChecklist'
import { AlternatePlanSelector, BookingDashboard, MapSection } from './components/Planning'
import { ShareTrip } from './components/ShareTrip'
import { DestinationPreview, TripHero } from './components/TripHero'
import { WeatherPanel } from './components/WeatherPanel'
import { useLocal } from './lib/store'

export default function App() {
  const [theme, setTheme] = useLocal<'dark' | 'light'>('theme', 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0B1515' : '#F7F5EF')
  }, [theme])

  return (
    <>
      <a href="#journey" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-teal focus:px-4 focus:py-2 focus:text-midnight">
        Skip to itinerary
      </a>
      <TopBar theme={theme} setTheme={setTheme} />
      <TripHero />
      <main>
        <DestinationPreview />
        <ItineraryTimeline />
        <MapSection theme={theme} />
        <BookingDashboard />
        <AlternatePlanSelector />
        <WeatherPanel />
        <BudgetCalculator />
        <PackingChecklist />
        <GroupPanel />
        <Gallery />
        <ShareTrip />
      </main>
      <Footer />
      <MobileNavigation />
    </>
  )
}
