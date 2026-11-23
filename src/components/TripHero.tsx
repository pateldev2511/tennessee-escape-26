import { ArrowDown, CalendarDays, Map, Share2, Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { STOPS } from '../data/trip'
import { wallToDate } from '../lib/time'
import { Photo, Reveal, Stat } from './ui'

const DEPART = wallToDate(STOPS[0].start) // 3:30 AM America/New_York, Nov 27 2026

export function Countdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = DEPART.getTime() - now
  if (diff <= 0) {
    const home = wallToDate({ date: '2026-11-28', time: '06:00', tz: 'America/New_York' })
    return (
      <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
        {now < home.getTime() ? 'The escape is underway — open Live Trip mode below.' : 'Trip complete. What a day!'}
      </div>
    )
  }
  const s = Math.floor(diff / 1000)
  const parts: [number, string][] = [
    [Math.floor(s / 86400), 'days'],
    [Math.floor((s % 86400) / 3600), 'hrs'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'sec'],
  ]
  return (
    <div role="timer" aria-label="Countdown to departure" className="flex flex-col items-center gap-2">
      <div className="flex gap-2 sm:gap-3">
        {parts.map(([v, l]) => (
          <div key={l} className="glass w-[4.3rem] rounded-2xl py-2.5 text-center sm:w-20">
            <div className="h-display text-2xl tabular-nums sm:text-3xl">{String(v).padStart(2, '0')}</div>
            <div className="muted text-[0.65rem] uppercase tracking-[0.18em]">{l}</div>
          </div>
        ))}
      </div>
      <p className="text-[0.72rem] text-cream/70">until departure · Fri Nov 27, 3:30 AM ET (America/New_York)</p>
    </div>
  )
}

export function TripHero() {
  return (
    <header id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden text-cream">
      <Photo k="hero" alt="Twin Falls cascading into the gorge at Rock Island State Park, Tennessee" eager sizes="100vw" className="kenburns absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_21_21/0.55)_0%,rgb(11_21_21/0.25)_35%,rgb(11_21_21/0.75)_75%,#0b1515_100%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pt-28 pb-10 sm:px-6 sm:pb-16">
        <p className="rise eyebrow !text-sand" style={{ animationDelay: '0.1s' }}>
          Friday, November 27, 2026
        </p>
        <h1 className="rise h-display mt-3 text-[2.9rem] leading-[0.95] sm:text-7xl lg:text-8xl" style={{ animationDelay: '0.2s' }}>
          TENNESSEE
          <br />
          ESCAPE <span className="text-teal">’26</span>
        </h1>
        <p className="rise serif mt-4 text-2xl text-cream/90 sm:text-3xl" style={{ animationDelay: '0.35s' }}>
          One Day. Three Worlds. Endless Memories.
        </p>
        <p className="rise mt-3 max-w-xl text-[0.95rem] text-cream/75" style={{ animationDelay: '0.45s' }}>
          Waterfalls. Underground Adventures. Inner Peace. — 4 Friends. 1 Road Trip. 3 Unforgettable Destinations.
        </p>

        <p className="rise mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] font-medium text-cream/85" style={{ animationDelay: '0.55s' }}>
          {['Gainesville, GA', 'Rock Island', 'Cumberland Caverns', 'Isha Institute', 'Gainesville, GA'].map((p, i, a) => (
            <span key={i} className="inline-flex items-center gap-2">
              {p}
              {i < a.length - 1 && <span className="text-teal">→</span>}
            </span>
          ))}
        </p>

        <div className="rise mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3" style={{ animationDelay: '0.65s' }}>
          <Stat value="4" label="Travelers" />
          <Stat value="3" label="Main Destinations" />
          <Stat value="1 / 2" label="Car / Drivers" />
          <Stat value="1" label="Incredible Day" />
        </div>

        <div className="rise mt-7 flex justify-center sm:justify-start" style={{ animationDelay: '0.75s' }}>
          <Countdown />
        </div>

        <nav aria-label="Primary actions" className="rise no-print mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap" style={{ animationDelay: '0.85s' }}>
          <a href="#journey" className="btn btn-primary">
            <CalendarDays size={18} /> Explore Our Journey
          </a>
          <a href="#map" className="btn btn-ghost !border-cream/25 !bg-cream/10 !text-cream">
            <Map size={18} /> View Trip Map
          </a>
          <a href="#bookings" className="btn btn-ghost !border-cream/25 !bg-cream/10 !text-cream">
            <Ticket size={18} /> Bookings & Tickets
          </a>
          <a href="#share" className="btn btn-ghost !border-cream/25 !bg-cream/10 !text-cream">
            <Share2 size={18} /> Share With Friends
          </a>
        </nav>
      </div>

      <a href="#destinations" aria-label="Scroll down" className="bob no-print mx-auto mb-24 grid h-11 w-11 place-items-center rounded-full border border-cream/30 sm:mb-8">
        <ArrowDown size={18} />
      </a>
    </header>
  )
}

const DESTS = [
  { k: 'twin', title: 'Rock Island Waterfalls', sub: 'Twin Falls & Great Falls', time: 'Morning · 7:15 AM CT', href: '#stop-twin', alt: 'Twin Falls at Rock Island State Park' },
  { k: 'cave', title: 'Cumberland Caverns', sub: 'Discovery Walking Tour', time: 'Late morning · booking pending', href: '#stop-caverns', alt: 'Limestone formations inside Cumberland Caverns' },
  { k: 'plateau', title: 'Isha Institute', sub: 'Adiyogi · quiet reflection', time: 'Afternoon · 2:45 PM CT', href: '#stop-isha', alt: 'Cumberland Plateau river landscape in Warren County, Tennessee' },
] as const

export function DestinationPreview() {
  return (
    <section id="destinations" className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
      <Reveal>
        <p className="eyebrow">Three worlds</p>
        <h2 className="h-display mt-3 text-[2rem] leading-tight sm:text-5xl">
          Falls, caves & <span className="serif text-sand">stillness</span>
        </h2>
      </Reveal>
      <div className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
        {DESTS.map((d, i) => (
          <Reveal key={d.k} delay={i * 90} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <a href={d.href} className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] text-cream">
              <Photo k={d.k} alt={d.alt} sizes="(min-width: 640px) 33vw, 78vw" className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-sand">{d.time}</p>
                <h3 className="h-display mt-1.5 text-2xl">{d.title}</h3>
                <p className="mt-1 text-sm text-cream/75">{d.sub}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
