import { AlertTriangle, CheckCircle2, ExternalLink, Lock, MapPinned, Navigation, Phone, Route, ShieldCheck, Ticket } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BOOKINGS, BOOKING_STATUSES, PLANS, ROUTE_URL, type BookingStatus } from '../data/trip'
import { useBookings, useItinerary, usePlanId } from '../lib/itinerary'
import { fmtTime } from '../lib/time'
import { CAT_ICON } from './ItineraryTimeline'
import { Callout, ExtLink, Reveal, Section } from './ui'

const RouteMap = lazy(() => import('./RouteMap'))

export function MapSection({ theme }: { theme: 'dark' | 'light' }) {
  const { stops } = useItinerary()
  const holder = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const [focus, setFocus] = useState<'all' | 'tn'>('tn')
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: '400px' })
    if (holder.current) io.observe(holder.current)
    return () => io.disconnect()
  }, [])
  return (
    <Section id="map" eyebrow="Route" title={<>Every stop, <span className="serif text-sand">one tap away</span></>} intro="Markers use verified coordinates (source listed in each stop’s details). No exact road line is drawn — open Google Maps for live routing.">
      <div className="no-print glass mb-3 inline-flex rounded-full p-1" role="tablist" aria-label="Map view">
        {([['tn', 'Tennessee stops'], ['all', 'Whole trip']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={focus === k} onClick={() => setFocus(k)} className={`btn btn-sm !min-h-[40px] ${focus === k ? 'btn-primary' : '!bg-transparent'}`}>
            {l}
          </button>
        ))}
      </div>
      <div ref={holder} className="card overflow-hidden p-1.5">
        {show ? (
          <Suspense fallback={<div className="skeleton h-[440px] sm:h-[560px]" />}>
            <RouteMap theme={theme} focus={focus} />
          </Suspense>
        ) : (
          <div className="skeleton h-[440px] sm:h-[560px]" />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ExtLink href={ROUTE_URL} className="btn btn-primary">
          <Route size={18} /> OPEN COMPLETE ROUTE IN GOOGLE MAPS
        </ExtLink>
      </div>
      <div className="mt-4">
        <Callout>
          <AlertTriangle size={14} className="mr-1.5 inline" />
          Verify the final route, travel times and road closures inside Google Maps before and during the drive. Multi-stop links can hit waypoint limits on some phones — use the segment links below as reliable fallbacks.
        </Callout>
      </div>

      <h3 className="h-display mt-8 text-xl">Segment navigation</h3>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {stops.map((s, i) => {
          const Icon = CAT_ICON[s.category]
          return (
            <a key={s.id} href={s.navUrl} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 !rounded-2xl p-3 transition-colors hover:border-teal">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {i === 0 ? 'Gainesville → Twin Falls' : s.id === 'return' ? 'Isha → Gainesville' : `→ ${s.name}`}
                </span>
                <span className="muted block text-xs">{s.timePending ? 'Time pending booking' : fmtTime(s.startAt, s.start.tz)}</span>
              </span>
              <Navigation size={16} className="accent shrink-0" />
            </a>
          )
        })}
      </div>

      <div className="mt-6">
        <Callout tone="info">
          <MapPinned size={14} className="mr-1.5 inline" />
          <strong>Isha Institute directions (official):</strong> Isha Lane intersects Tennessee Highway 8; look for the large “Isha Institute of Inner Sciences” sign at the entrance on Route 8, about 16 miles from central McMinnville. The center warns that many GPS systems give incorrect or outdated directions — check the route in advance.{' '}
          <a className="accent underline" href="https://isha.sadhguru.org/en/center/isha-institute-inner-sciences-usa" target="_blank" rel="noopener noreferrer">
            Official page
          </a>
        </Callout>
      </div>
    </Section>
  )
}

const STATUS_TONE: Record<BookingStatus, string> = {
  'Not booked': 'bg-red-500/15 text-red-300 light:text-red-700 border-red-400/40',
  Pending: 'bg-sand/15 text-sand border-sand/40',
  Booked: 'bg-teal/20 text-[var(--accent)] border-teal/50',
  Cancelled: 'bg-white/5 text-[var(--muted)] border-[var(--border)]',
  'Not required': 'bg-sage/15 text-[var(--muted)] border-sage/40',
  'Needs confirmation': 'bg-sand/15 text-sand border-sand/40',
}

export function BookingDashboard() {
  const [bookings, setBookings] = useBookings()
  const [planId] = usePlanId()
  return (
    <Section id="bookings" eyebrow="Bookings & tickets" title={<>Booking <span className="serif text-sand">center</span></>} intro="Statuses change only when you change them — opening a booking link never marks anything as booked. Confirmation details stay on this device and are never published.">
      <div className="grid gap-4 lg:grid-cols-3">
        {BOOKINGS.map((b, i) => {
          const st = bookings[b.id] ?? { status: b.defaultStatus }
          const affected = b.id === 'caverns' && planId === 'C'
          return (
            <Reveal key={b.id} delay={i * 80}>
              <div className={`card flex h-full flex-col p-5 ${b.priority && st.status !== 'Booked' ? 'ring-1 ring-red-400/40' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {b.priority && <span className="chip mb-2 !border-red-400/50 !bg-red-500/80 !text-white">PRIORITY: {b.priority}</span>}
                    <h3 className="h-display text-xl">{b.title}</h3>
                  </div>
                  <span className={`chip shrink-0 ${STATUS_TONE[st.status]}`}>{st.status}</span>
                </div>
                <ul className="muted mt-3 space-y-1 text-sm">
                  {b.detail.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
                {affected && (
                  <div className="mt-3">
                    <Callout>Plan C is active — cave tickets are not needed. Cancel any purchase per the venue’s policy.</Callout>
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="muted text-xs">Status</span>
                    <select className="input mt-1" value={st.status} onChange={(e) => setBookings((p) => ({ ...p, [b.id]: { ...st, status: e.target.value as BookingStatus } }))}>
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  {b.hasTime && (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="muted text-xs">Confirmed tour time (CT)</span>
                        <input type="time" className="input mt-1" value={st.time ?? ''} onChange={(e) => setBookings((p) => ({ ...p, [b.id]: { ...st, time: e.target.value } }))} />
                      </label>
                      <label className="block">
                        <span className="muted text-xs">Tour</span>
                        <select className="input mt-1" value={st.tour ?? 'Discovery'} onChange={(e) => setBookings((p) => ({ ...p, [b.id]: { ...st, tour: e.target.value } }))}>
                          <option value="Discovery">Discovery (90 min)</option>
                          <option value="Cardwell">Cardwell Mountain (45 min)</option>
                        </select>
                      </label>
                      <p className="muted col-span-2 text-[0.72rem]">The timeline only uses this time once the status is “Booked”.</p>
                    </div>
                  )}
                  <label className="block">
                    <span className="muted flex items-center gap-1 text-xs">
                      <Lock size={11} /> Private note / confirmation # (this device only)
                    </span>
                    <input type="password" autoComplete="off" className="input mt-1" placeholder="Hidden — not shared" value={st.note ?? ''} onChange={(e) => setBookings((p) => ({ ...p, [b.id]: { ...st, note: e.target.value } }))} />
                  </label>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  {b.url && (
                    <ExtLink href={b.url} className={b.priority ? 'btn btn-sand btn-sm' : 'btn btn-ghost btn-sm'}>
                      {b.priority ? <Ticket size={15} /> : <ExternalLink size={15} />} {b.urlLabel}
                    </ExtLink>
                  )}
                  {b.phone && (
                    <a href={`tel:${b.phone.replace(/\D/g, '')}`} className="btn btn-ghost btn-sm">
                      <Phone size={15} /> Call
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
      <p className="muted mt-4 text-xs">Nothing is booked automatically. Prices are published rates and may change; fees and taxes may apply.</p>
    </Section>
  )
}

export function AlternatePlanSelector() {
  const [planId, setPlanId] = usePlanId()
  const plan = PLANS.find((p) => p.id === planId)!
  const { stops } = useItinerary()
  return (
    <Section id="plans" eyebrow="Plan B" title={<>Weather or tickets <span className="serif text-sand">change the plan?</span></>} intro="Switching plans recalculates the itinerary, map and calendar export. No other caves or distant attractions are substituted.">
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Itinerary plan">
        {PLANS.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={p.id === planId}
            onClick={() => setPlanId(p.id)}
            className={`card p-5 text-left transition-colors ${p.id === planId ? '!border-teal ring-1 ring-teal' : 'hover:border-teal/50'}`}
          >
            <div className="flex items-center justify-between">
              <span className="h-display text-lg">{p.name.split(' — ')[0]}</span>
              {p.id === planId && <CheckCircle2 size={20} className="accent" />}
            </div>
            <p className="mt-1 font-semibold">{p.name.split(' — ')[1]}</p>
            <p className="muted mt-1 text-sm">{p.tagline}</p>
          </button>
        ))}
      </div>
      <Reveal className="mt-5">
        <div className="card p-5 sm:p-6">
          <p className="eyebrow">Proposed itinerary · {plan.name}</p>
          <ol className="mt-4 space-y-2">
            {stops.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-3 text-sm">
                <span className="accent w-28 shrink-0 font-semibold tabular-nums">{s.timePending ? 'Pending' : fmtTime(s.startAt, s.start.tz)}</span>
                <span>
                  {i + 1}. {s.name}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="muted text-xs tracking-wider uppercase">What changes</p>
              <ul className="mt-2 space-y-1 text-sm">
                {plan.changes.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="muted text-xs tracking-wider uppercase">Affected bookings</p>
              {plan.affectedBookings.length ? (
                <ul className="mt-2 space-y-1 text-sm text-sand">
                  {plan.affectedBookings.map((c) => (
                    <li key={c}>
                      <AlertTriangle size={13} className="mr-1 inline" />
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-sm">
                  <ShieldCheck size={15} className="accent" /> None
                </p>
              )}
            </div>
          </div>
          {plan.id !== 'A' && <p className="muted mt-4 text-xs">Times marked here are proposals — confirm venue hours and drive times before relying on them.</p>}
        </div>
      </Reveal>
    </Section>
  )
}
