import {
  AlertTriangle, Car, Check, ChevronDown, Clock, CloudRain, Droplets, Gauge, MapPin, Mountain, Navigation, Pencil, Phone, Sparkles,
  SkipForward, Ticket, TimerReset, Utensils, Waves, Gem, Flag, RotateCcw,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CT, ET, OPTIONAL_AARTI, type Category } from '../data/trip'
import { useItinerary, useStopStatus, useTimeEdits, usePlanId, type ResolvedStop, type StopStatus } from '../lib/itinerary'
import { useLocal } from '../lib/store'
import { fmtDuration, fmtTime, nowIn } from '../lib/time'
import { Callout, ExtLink, Photo, Reveal, Section } from './ui'

export const CAT_ICON: Record<Category, (p: { size?: number }) => ReactNode> = {
  Driving: (p) => <Car {...p} />,
  Waterfall: (p) => <Waves {...p} />,
  'Scenic viewpoint': (p) => <Mountain {...p} />,
  Adventure: (p) => <Gem {...p} />,
  Dining: (p) => <Utensils {...p} />,
  'Spiritual visit': (p) => <Sparkles {...p} />,
}

const STATUS_STYLE: Record<StopStatus, string> = {
  upcoming: 'border-[var(--border)] text-[var(--muted)]',
  arrived: 'border-teal/50 bg-teal/15 text-teal',
  completed: 'border-teal bg-teal text-midnight',
  skipped: 'border-sand/40 bg-sand/10 text-sand line-through',
}

function TimeBlock({ s, late }: { s: ResolvedStop; late: number }) {
  if (s.timePending)
    return (
      <div>
        <span className="chip !border-sand/50 !bg-sand/15 !text-sand">
          <Clock size={12} /> Tour time pending booking confirmation
        </span>
        <p className="muted mt-1.5 text-xs">Target check-in 10:30 AM CT · desired tour 11:00 AM CT (11:30 AM · 12:00 PM ET) — not a verified slot</p>
      </div>
    )
  const shift = (d: Date) => new Date(d.getTime() + late * 60000)
  const start = shift(s.startAt)
  const end = s.endAt && shift(s.endAt)
  const other = s.start.tz === CT ? ET : CT
  const endTz = s.id === 'return' ? ET : s.start.tz
  return (
    <div>
      <div className="h-display text-lg leading-tight sm:text-xl">
        {fmtTime(start, s.start.tz)}
        {end && <span className="muted font-semibold"> – {fmtTime(end, endTz)}</span>}
      </div>
      <div className="muted text-xs">
        = {fmtTime(start, other)}
        {s.id === 'caverns' && ' · confirmed booking'}
        {s.edited && ' · edited'}
        {late > 0 && <span className="text-sand"> · shifted +{late} min</span>}
      </div>
    </div>
  )
}

function StopCard({ s, index, status, setStatus, live, late, next }: { s: ResolvedStop; index: number; status: StopStatus; setStatus: (st: StopStatus) => void; live: boolean; late: number; next?: ResolvedStop }) {
  const leaveBy = s.endAt ?? null
  const conflictMin = leaveBy && next && next.id !== 'return' && s.driveNext && !next.timePending && !s.timePending ? Math.round((leaveBy.getTime() + s.driveNext.min * 60000 - next.startAt.getTime()) / 60000) : 0
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [, setEdits] = useTimeEdits()
  const [planId] = usePlanId()
  const key = `${planId}:${s.id}`
  const Icon = CAT_ICON[s.category]
  return (
    <article id={`stop-${s.id}`} className="relative scroll-mt-24 pl-12 sm:pl-16">
      <div className={`absolute top-6 left-0 grid h-10 w-10 place-items-center rounded-full border-2 sm:h-12 sm:w-12 ${status === 'completed' ? 'border-teal bg-teal text-midnight' : 'border-teal/60 bg-[var(--bg)] text-teal'}`}>
        {status === 'completed' ? <Check size={18} /> : <Icon size={18} />}
      </div>
      <Reveal>
        <div className={`card overflow-hidden ${status === 'skipped' ? 'opacity-60' : ''}`}>
          <div className="relative">
            <Photo k={s.image} alt={s.name} className="aspect-[16/9] sm:aspect-[21/9]" sizes="(min-width: 1024px) 900px, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/10 to-transparent" />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="chip glass !text-cream">
                <Icon size={12} /> {s.category}
              </span>
              {s.optional && <span className="chip glass !text-sand">Optional</span>}
              {s.id === 'caverns' && <span className="chip !border-red-300/50 !bg-red-500/80 !text-white">Critical booking</span>}
            </div>
            <div className="absolute right-3 bottom-3 left-3 text-cream">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-sand uppercase">Stop {index + 1}</p>
              <h3 className="h-display text-2xl leading-tight sm:text-3xl">{s.name}</h3>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <TimeBlock s={s} late={late} />
              <span className={`chip capitalize ${STATUS_STYLE[status]}`}>{status}</span>
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed">{s.summary}</p>
            {conflictMin > 10 && next && (
              <div className="mt-3">
                <Callout tone="danger">
                  <AlertTriangle size={14} className="mr-1.5 inline" />
                  Schedule conflict: leaving at {fmtTime(leaveBy!, s.start.tz)} plus the ≈{s.driveNext!.min}-min drive reaches {next.name} {conflictMin} min after its planned {fmtTime(next.startAt, next.start.tz)} start. Edit the next stop’s time in its Details.
                </Callout>
              </div>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Meta icon={<Clock size={14} />} k="Duration" v={s.durationLabel} />
              <Meta icon={<Ticket size={14} />} k="Cost" v={s.cost} />
              <Meta icon={<Gauge size={14} />} k="Difficulty" v={s.difficulty} />
              <Meta icon={<CloudRain size={14} />} k="Weather impact" v={s.weather} />
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <ExtLink href={s.navUrl} className="btn btn-primary btn-sm">
                <Navigation size={15} /> Navigate
              </ExtLink>
              <ExtLink href={s.mapsUrl}>
                <MapPin size={15} /> Google Maps
              </ExtLink>
              {s.bookingUrl && (
                <ExtLink href={s.bookingUrl} className="btn btn-sand btn-sm">
                  <Ticket size={15} /> {s.bookingLabel}
                </ExtLink>
              )}
              {s.phone && (
                <a href={`tel:${s.phone.replace(/\D/g, '')}`} className="btn btn-ghost btn-sm">
                  <Phone size={15} /> {s.phone}
                </a>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                Details <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {live && (
              <div className="no-print mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button className="btn btn-ghost btn-sm" onClick={() => setStatus('arrived')}>
                  <Flag size={15} /> We Arrived
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setStatus('completed')}>
                  <Check size={15} /> Mark Completed
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setStatus('skipped')}>
                  <SkipForward size={15} /> Skip This Stop
                </button>
                {next ? (
                  <ExtLink href={next.navUrl} className="btn btn-ghost btn-sm">
                    <Navigation size={15} /> Navigate Next
                  </ExtLink>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus('upcoming')}>
                    <RotateCcw size={15} /> Reset
                  </button>
                )}
              </div>
            )}

            {open && (
              <div className="mt-5 space-y-4 border-t border-[var(--border)] pt-5 text-sm leading-relaxed">
                <p>{s.description}</p>
                <p className="muted text-xs">
                  <MapPin size={12} className="mr-1 inline" />
                  {s.place}
                </p>
                <div>
                  <p className="eyebrow mb-2">Activities</p>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {s.activities.map((a) => (
                      <li key={a} className="flex gap-2">
                        <Droplets size={14} className="accent mt-0.5 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                {s.extraSchedule && (
                  <div>
                    <p className="eyebrow mb-2">Suggested experience (CT)</p>
                    <ol className="space-y-1.5">
                      {s.extraSchedule.map((x) => (
                        <li key={x.time} className="flex gap-3">
                          <span className="accent w-16 shrink-0 font-semibold">{x.time}</span>
                          {x.text}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {s.notes && (
                  <ul className="space-y-1.5">
                    {s.notes.map((n) => (
                      <li key={n} className="muted flex gap-2">
                        <span className="sand">•</span>
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
                {s.safety?.map((n) => (
                  <Callout key={n} tone="danger">
                    <AlertTriangle size={14} className="mr-1.5 inline" />
                    {n}
                  </Callout>
                ))}
                {s.id === 'isha' && (
                  <Callout tone="info">
                    <strong>{OPTIONAL_AARTI.title}.</strong> {OPTIONAL_AARTI.text}
                  </Callout>
                )}
                {s.officialUrl && (
                  <ExtLink href={s.officialUrl}>{s.officialLabel}</ExtLink>
                )}
                {s.id !== 'caverns' && (
                  <div className="no-print">
                    {editing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="muted text-xs" htmlFor={`t-${s.id}`}>
                          Start ({s.start.tz === ET ? 'Eastern' : 'Central'})
                        </label>
                        <input
                          id={`t-${s.id}`}
                          type="time"
                          className="input !w-36"
                          defaultValue={s.start.time}
                          onChange={(e) => e.target.value && setEdits((p) => ({ ...p, [key]: e.target.value }))}
                        />
                        <button className="btn btn-ghost btn-sm" onClick={() => (setEdits((p) => { const n = { ...p }; delete n[key]; return n }), setEditing(false))}>
                          Reset
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setEditing(false)}>
                          Done
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                        <Pencil size={14} /> Edit planned time
                      </button>
                    )}
                  </div>
                )}
                <p className="muted text-[0.7rem]">Map pin source: {s.coord.source}</p>
              </div>
            )}
          </div>
        </div>
      </Reveal>
      {s.driveNext && (
        <div className="muted flex items-center gap-2 py-4 pl-1 text-xs">
          <Car size={14} className="accent" />
          ≈ {fmtDuration(s.driveNext.min * 60000)} · {s.driveNext.mi} mi to {s.driveNext.to}
          <span className="opacity-70">· OSRM estimate, no traffic</span>
        </div>
      )}
    </article>
  )
}

function Meta({ icon, k, v }: { icon: ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-2)] px-3 py-2">
      <dt className="muted flex items-center gap-1.5 text-[0.68rem] tracking-wide uppercase">
        {icon}
        {k}
      </dt>
      <dd className="mt-0.5 leading-snug font-medium">{v}</dd>
    </div>
  )
}

function LivePanel({ stops, status, late, setLate }: { stops: ResolvedStop[]; status: Record<string, StopStatus>; late: number; setLate: (n: number) => void }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  const shift = late * 60000
  const remaining = stops.filter((s) => status[s.id] !== 'completed' && status[s.id] !== 'skipped')
  const current = remaining.find((s) => status[s.id] === 'arrived') ?? remaining.find((s) => (s.endAt ? s.endAt.getTime() + shift : s.startAt.getTime() + shift + 3600000) > now) ?? remaining[0]
  const next = current ? remaining[remaining.indexOf(current) + 1] : undefined
  const depart = current?.endAt ? current.endAt.getTime() + shift : undefined
  const behind = current?.endAt && now > current.endAt.getTime() + shift && status[current.id] !== 'completed' ? now - (current.endAt.getTime() + shift) : 0
  const beforeTrip = stops[0] && now < stops[0].startAt.getTime()

  return (
    <div className="card no-print mb-8 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Live trip</p>
        <p className="muted text-xs">
          Now: {nowIn(ET)} ET · {nowIn(CT)} CT
        </p>
      </div>
      {beforeTrip && <p className="muted mt-2 text-sm">The trip hasn’t started yet — this panel follows your manual check-ins and the clock on the day.</p>}
      {current ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[var(--bg-2)] p-4">
            <p className="muted text-xs uppercase tracking-wider">Current planned stop</p>
            <p className="h-display mt-1 text-xl">{current.name}</p>
            {depart && !current.timePending && (
              <p className="mt-1 text-sm">
                Scheduled departure {fmtTime(new Date(depart), current.id === 'return' ? ET : current.start.tz)}
                {depart > now && <span className="accent"> · in {fmtDuration(depart - now)}</span>}
              </p>
            )}
            {behind > 5 * 60000 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-sand">
                <AlertTriangle size={14} /> Running {fmtDuration(behind)} behind plan
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-[var(--bg-2)] p-4">
            <p className="muted text-xs uppercase tracking-wider">Next stop</p>
            <p className="h-display mt-1 text-xl">{next?.name ?? 'Home — drive safe'}</p>
            {next && (
              <ExtLink href={next.navUrl} className="btn btn-primary btn-sm mt-3">
                <Navigation size={15} /> Navigate Next
              </ExtLink>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-lg font-semibold">All stops done — welcome home! 🎉</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="muted text-sm">Running late?</span>
        {[15, 30, 45, 60].map((m) => (
          <button key={m} className={`btn btn-sm ${late === m ? 'btn-sand' : 'btn-ghost'}`} onClick={() => setLate(late === m ? 0 : m)}>
            <TimerReset size={14} /> +{m}
          </button>
        ))}
        {late > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setLate(0)}>
            Clear
          </button>
        )}
      </div>
      {late >= 45 && (
        <div className="mt-3">
          <Callout>
            Running {late} min late. Consider skipping the optional Great Falls stop, shortening lunch, and calling Cumberland Caverns (931-668-4396) if your tour time is at risk. Never speed to catch up.
          </Callout>
        </div>
      )}
      <p className="muted mt-3 text-[0.7rem]">No GPS is used. “Current stop” comes from your check-ins and the planned schedule — it never guesses your location.</p>
    </div>
  )
}

export function ItineraryTimeline() {
  const { plan, stops } = useItinerary()
  const [status, setStatusMap] = useStopStatus()
  const [mode, setMode] = useLocal<'plan' | 'live'>('mode', 'plan')
  const [late, setLate] = useLocal<number>('lateBy', 0)
  const done = useMemo(() => stops.filter((s) => status[s.id] === 'completed' || status[s.id] === 'skipped').length, [stops, status])
  const pct = stops.length ? Math.round((done / stops.length) * 100) : 0
  const firstLeg = stops[0]?.driveNext && stops[1] ? stops[1].startAt.getTime() - stops[0].startAt.getTime() - stops[0].driveNext.min * 60000 : null

  return (
    <Section
      id="journey"
      eyebrow={`Journey · ${plan.name}`}
      title={
        <>
          The day, <span className="serif text-sand">stop by stop</span>
        </>
      }
      intro="All times are planning targets. Tennessee stops run on Central Time (America/Chicago); Gainesville departure and arrival on Eastern Time (America/New_York)."
    >
      <div className="no-print mb-6">
        <div className="glass inline-flex rounded-full p-1" role="tablist" aria-label="Timeline mode">
          {(['plan', 'live'] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`btn btn-sm !min-h-[40px] ${mode === m ? 'btn-primary' : '!bg-transparent'}`}>
              {m === 'plan' ? 'Plan Mode' : 'Live Trip Mode'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'plan' && firstLeg !== null && firstLeg < 20 * 60000 && (
        <div className="mb-6">
          <Callout>
            <strong>Tight first leg:</strong> the drive alone is estimated at ≈ {fmtDuration(stops[0].driveNext!.min * 60000)}, leaving only {Math.max(0, Math.round(firstLeg / 60000))} min of buffer for breakfast, fuel and restrooms before {fmtTime(stops[1].startAt, CT)}. Consider leaving earlier or arriving at the falls later — edit times in each stop’s Details.
          </Callout>
        </div>
      )}
      {mode === 'live' && <LivePanel stops={stops} status={status} late={late} setLate={setLate} />}

      <div className="relative">
        <div className="absolute top-6 bottom-6 left-[19px] w-0.5 rounded bg-[var(--border)] sm:left-[23px]" aria-hidden>
          <div className="w-full rounded bg-teal transition-[height] duration-700" style={{ height: `${pct}%` }} />
        </div>
        {stops.map((s, i) => (
          <StopCard
            key={s.id}
            s={s}
            index={i}
            status={status[s.id] ?? 'upcoming'}
            setStatus={(st) => setStatusMap((p) => ({ ...p, [s.id]: st }))}
            live={mode === 'live'}
            late={mode === 'live' && status[s.id] !== 'completed' ? late : 0}
            next={stops[i + 1]}
          />
        ))}
      </div>
      <p className="muted mt-2 text-xs">
        Progress: {done}/{stops.length} stops completed or skipped. Changes are saved on this device.
      </p>
    </Section>
  )
}
