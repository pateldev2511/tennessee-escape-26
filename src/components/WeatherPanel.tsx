import { AlertTriangle, CloudRain, ExternalLink, RefreshCw, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CT, TRIP_DATE, WARNINGS, WEATHER_POINTS } from '../data/trip'
import { Callout, ExtLink, Reveal, Section } from './ui'

interface Daily { tmax: number; tmin: number; pop: number | null; rain: number; wind: number; gust: number; sunrise: string; sunset: string; code: number }
interface Hour { t: string; temp: number; pop: number | null }
interface Point { id: string; name: string; daily?: Daily; hours: Hour[]; alerts: { event: string; headline: string; url: string }[] }

const WMO: Record<number, string> = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers', 95: 'Thunderstorm', 96: 'Thunderstorm, hail', 99: 'Thunderstorm, hail' }
const hhmm = (iso: string) => new Date(iso + ':00').toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

async function load(): Promise<{ points: Point[]; note?: string }> {
  const lat = WEATHER_POINTS.map((p) => p.lat).join(',')
  const lng = WEATHER_POINTS.map((p) => p.lng).join(',')
  const base = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(CT)}`
  let note: string | undefined
  let res = await fetch(`${base}&start_date=${TRIP_DATE}&end_date=${TRIP_DATE}`)
  if (!res.ok) {
    note = 'Trip day is beyond the forecast window — showing today’s forecast instead.'
    res = await fetch(`${base}&forecast_days=1`)
  }
  if (!res.ok) throw new Error('Forecast unavailable')
  const raw = await res.json()
  const arr = Array.isArray(raw) ? raw : [raw]
  const alerts = await Promise.all(
    WEATHER_POINTS.map((p) =>
      fetch(`https://api.weather.gov/alerts/active?point=${p.lat.toFixed(4)},${p.lng.toFixed(4)}`, { headers: { Accept: 'application/geo+json' } })
        .then((r) => (r.ok ? r.json() : { features: [] }))
        .then((j) => (j.features ?? []).map((f: { properties: { event: string; headline: string; id: string } }) => ({ event: f.properties.event, headline: f.properties.headline, url: f.properties.id })))
        .catch(() => null),
    ),
  )
  const points = WEATHER_POINTS.map((p, i) => {
    const d = arr[i]?.daily
    const h = arr[i]?.hourly
    const hours: Hour[] = h ? h.time.map((t: string, j: number) => ({ t, temp: h.temperature_2m[j], pop: h.precipitation_probability?.[j] ?? null })).filter((x: Hour) => { const hr = +x.t.slice(11, 13); return hr >= 7 && hr <= 18 && hr % 2 === 1 }) : []
    return {
      id: p.id,
      name: p.name,
      daily: d ? { tmax: d.temperature_2m_max[0], tmin: d.temperature_2m_min[0], pop: d.precipitation_probability_max?.[0] ?? null, rain: d.precipitation_sum[0], wind: d.wind_speed_10m_max[0], gust: d.wind_gusts_10m_max[0], sunrise: d.sunrise[0], sunset: d.sunset[0], code: d.weather_code[0] } : undefined,
      hours,
      alerts: alerts[i] ?? [],
      alertsFailed: alerts[i] === null,
    }
  })
  return { points, note }
}

export function WeatherPanel() {
  const [data, setData] = useState<{ points: Point[]; note?: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [at, setAt] = useState<Date | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = useCallback(() => {
    setBusy(true)
    setErr(null)
    load()
      .then((d) => (setData(d), setAt(new Date())))
      .catch((e) => setErr(String(e.message ?? e)))
      .finally(() => setBusy(false))
  }, [])
  useEffect(refresh, [refresh])

  return (
    <Section id="safety" eyebrow="Weather & safety" title={<>Forecast for <span className="serif text-sand">Nov 27</span></>} intro="Live forecast from Open-Meteo and active alerts from the National Weather Service. Nothing here is simulated.">
      <div className="mb-5">
        <Callout>
          <ul className="space-y-1.5">
            {WARNINGS.map((w) => (
              <li key={w} className="flex gap-2">
                <AlertTriangle size={15} className="sand mt-0.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </Callout>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={busy}>
          <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Refresh
        </button>
        {at && <span className="muted text-xs">Updated {at.toLocaleString('en-US', { timeZone: CT, dateStyle: 'medium', timeStyle: 'short' })} CT</span>}
      </div>
      {data?.note && <div className="mb-4"><Callout tone="info">{data.note}</Callout></div>}
      {err && (
        <Callout tone="danger">
          Couldn’t load the forecast ({err}). Use the official links below — no fallback numbers are shown.
        </Callout>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(data?.points ?? WEATHER_POINTS.map((p) => ({ id: p.id, name: p.name, hours: [], alerts: [] }) as Point)).map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <div className="card h-full p-5">
              <div className="flex items-start justify-between">
                <h3 className="h-display text-lg">{p.name}</h3>
                {p.daily && <span className="chip">{WMO[p.daily.code] ?? 'Forecast'}</span>}
              </div>
              {!data && !err ? (
                <div className="mt-4 space-y-2">
                  <div className="skeleton h-10" />
                  <div className="skeleton h-16" />
                </div>
              ) : p.daily ? (
                <>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="h-display text-4xl">{Math.round(p.daily.tmax)}°</span>
                    <span className="muted mb-1 text-lg">/ {Math.round(p.daily.tmin)}°F</span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5"><CloudRain size={14} className="accent" />{p.daily.pop ?? '–'}% · {p.daily.rain.toFixed(2)} in</div>
                    <div className="flex items-center gap-1.5"><Wind size={14} className="accent" />{Math.round(p.daily.wind)} mph (gust {Math.round(p.daily.gust)})</div>
                    <div className="flex items-center gap-1.5"><Sunrise size={14} className="accent" />{hhmm(p.daily.sunrise)} CT</div>
                    <div className="flex items-center gap-1.5"><Sunset size={14} className="accent" />{hhmm(p.daily.sunset)} CT</div>
                  </dl>
                  {p.hours.length > 0 && (
                    <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                      {p.hours.map((h) => (
                        <div key={h.t} className="min-w-[56px] rounded-xl bg-[var(--bg-2)] px-2 py-2 text-center text-xs">
                          <div className="muted">{hhmm(h.t).replace(':00', '')}</div>
                          <div className="mt-0.5 font-semibold"><Thermometer size={10} className="mr-0.5 inline" />{Math.round(h.temp)}°</div>
                          <div className="accent">{h.pop ?? '–'}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-sm">
                    {(p as Point & { alertsFailed?: boolean }).alertsFailed ? (
                      <p className="muted text-xs">NWS alerts couldn’t be loaded — check weather.gov.</p>
                    ) : p.alerts.length ? (
                      p.alerts.map((a) => (
                        <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="mb-1.5 block rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs">
                          <strong>{a.event}</strong> — {a.headline}
                        </a>
                      ))
                    ) : (
                      <p className="muted text-xs">No active NWS alerts right now.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted mt-3 text-sm">No forecast data.</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <ExtLink href="https://www.weather.gov/"><ExternalLink size={14} /> National Weather Service</ExtLink>
        <ExtLink href="https://tnstateparks.com/parks/rock-island"><ExternalLink size={14} /> Rock Island conditions & access</ExtLink>
        <ExtLink href="https://cumberlandcaverns.com/plan-your-visit/what-to-expect/"><ExternalLink size={14} /> Cave tour guidance</ExtLink>
        <ExtLink href="https://smartway.tn.gov/"><ExternalLink size={14} /> TDOT SmartWay road conditions</ExtLink>
        <ExtLink href="https://511ga.org/"><ExternalLink size={14} /> Georgia 511</ExtLink>
      </div>
      <p className="muted mt-3 text-[0.7rem]">Forecast data: Open-Meteo.com (CC BY 4.0). Alerts: api.weather.gov.</p>
    </Section>
  )
}
