import { CalendarDays, Home, Map, Moon, Share2, Sun, Ticket, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IMAGES } from '../data/images'
import type { ImageKey } from '../data/trip'
import { Photo, Reveal, Section } from './ui'

export function TopBar({ theme, setTheme }: { theme: 'dark' | 'light'; setTheme: (t: 'dark' | 'light') => void }) {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <div className={`no-print fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'glass !border-x-0 !border-t-0' : ''}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className={`mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 ${solid ? '' : 'text-cream'}`}>
        <a href="#top" className="h-display text-[0.95rem] tracking-tight">
          TENNESSEE ESCAPE <span className="text-teal">’26</span>
        </a>
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Sections">
          {[['#journey', 'Journey'], ['#map', 'Map'], ['#bookings', 'Bookings'], ['#budget', 'Budget'], ['#safety', 'Weather'], ['#packing', 'Checklist'], ['#share', 'Share']].map(([h, l]) => (
            <a key={h} href={h} className="rounded-full px-3 py-2 opacity-80 transition-opacity hover:opacity-100">
              {l}
            </a>
          ))}
        </nav>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-current/20"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  )
}

const NAV = [
  { href: '#top', label: 'Home', icon: Home },
  { href: '#journey', label: 'Journey', icon: CalendarDays },
  { href: '#map', label: 'Map', icon: Map },
  { href: '#bookings', label: 'Tickets', icon: Ticket },
  { href: '#budget', label: 'Budget', icon: Wallet },
  { href: '#share', label: 'Share', icon: Share2 },
]

export function MobileNavigation() {
  const [active, setActive] = useState('#top')
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive('#' + e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
  return (
    <nav aria-label="Quick navigation" className="no-print fixed inset-x-3 z-50 md:hidden" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
      <div className="glass mx-auto flex max-w-md justify-between rounded-[26px] px-1.5 py-1.5 shadow-[var(--shadow)]">
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = active === href
          return (
            <a key={href} href={href} aria-current={on ? 'true' : undefined} className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] text-[0.62rem] font-semibold transition-colors ${on ? 'bg-teal text-midnight' : 'muted'}`}>
              <Icon size={19} />
              {label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

const GALLERY: { k: ImageKey; caption: string; span?: string }[] = [
  { k: 'hero', caption: 'Twin Falls, Rock Island State Park', span: 'col-span-2 row-span-2' },
  { k: 'great', caption: 'Great Falls, Rock Island' },
  { k: 'gorge', caption: 'Great Falls gorge' },
  { k: 'cave2', caption: 'Three Chessmen, Cumberland Caverns' },
  { k: 'cave3', caption: 'Inside Cumberland Caverns' },
  { k: 'town2', caption: 'Warren County Courthouse, McMinnville', span: 'col-span-2' },
]

export function Gallery() {
  return (
    <Section id="gallery" eyebrow="Gallery" title={<>Postcards from <span className="serif text-sand">Warren County</span></>} intro="Photos of the real places on our route. Add your own favorite moments here after the trip.">
      <div className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[200px] sm:grid-cols-4">
        {GALLERY.map((g, i) => (
          <Reveal key={g.k} delay={i * 50} className={g.span ?? ''}>
            <figure className="group relative h-full overflow-hidden rounded-2xl">
              <Photo k={g.k} alt={g.caption} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 640px) 50vw, 100vw" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/85 to-transparent p-3 text-xs font-medium text-cream">{g.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-4 pt-12 pb-32 sm:px-6 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <p className="h-display text-2xl">
          TENNESSEE ESCAPE <span className="accent">’26</span>
        </p>
        <p className="serif mt-1 text-lg text-sand">Waterfalls. Underground Adventures. Inner Peace.</p>
        <p className="muted mt-4 max-w-2xl text-xs leading-relaxed">
          All times are planning targets, not guaranteed travel predictions. Tour times stay unconfirmed until a real reservation is entered. Drive estimates come from OSRM (OpenStreetMap) without traffic — always verify in Google Maps. Your edits are stored only in this browser. No location tracking.
        </p>
        <details className="mt-6 text-xs">
          <summary className="cursor-pointer font-semibold">Photo credits & licences</summary>
          <ul className="muted mt-3 space-y-1.5">
            {Object.entries(IMAGES).map(([k, v]) => (
              <li key={k}>
                <a className="underline" href={v!.credit.page} target="_blank" rel="noopener noreferrer">
                  {v!.credit.title}
                </a>{' '}
                — {v!.credit.artist || 'Unknown'} ·{' '}
                {v!.credit.licenseUrl ? (
                  <a className="underline" href={v!.credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {v!.credit.license}
                  </a>
                ) : (
                  v!.credit.license
                )}{' '}
                · via Wikimedia Commons, resized
              </li>
            ))}
            <li>Map data © OpenStreetMap contributors, tiles © CARTO. Weather © Open-Meteo (CC BY 4.0), alerts by NOAA/NWS.</li>
          </ul>
        </details>
        <p className="muted mt-6 text-[0.7rem]">Made for four friends · Not affiliated with Tennessee State Parks, Cumberland Caverns or Isha Foundation.</p>
      </div>
    </footer>
  )
}
