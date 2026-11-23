import { CT, ET, type WallTime, type Zone } from '../data/trip'

/** Offset (ms) of an IANA zone at a given instant, derived via Intl — no hard-coded offsets. */
function zoneOffset(at: Date, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(at).map((x) => [x.type, x.value]),
  )
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second)
  return asUTC - at.getTime()
}

/** Convert a wall-clock time in a zone to an absolute Date. */
export function wallToDate(w: WallTime): Date {
  const [y, m, d] = w.date.split('-').map(Number)
  const [hh, mm] = w.time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  let ts = guess - zoneOffset(new Date(guess), w.tz)
  ts = guess - zoneOffset(new Date(ts), w.tz) // second pass handles DST edges
  return new Date(ts)
}

export const zoneAbbr = (tz: Zone) => (tz === ET ? 'ET' : 'CT')

export function fmtTime(d: Date, tz: Zone): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(d) + ' ' + zoneAbbr(tz)
}

/** "7:15 AM CT · 8:15 AM ET" */
export function dualTime(w: WallTime): string {
  const d = wallToDate(w)
  const other: Zone = w.tz === CT ? ET : CT
  return `${fmtTime(d, w.tz)} · ${fmtTime(d, other)}`
}

export function fmtDuration(ms: number): string {
  const neg = ms < 0
  ms = Math.abs(ms)
  const m = Math.round(ms / 60000)
  const h = Math.floor(m / 60)
  const r = m % 60
  const s = h ? `${h} h ${r} min` : `${r} min`
  return neg ? `-${s}` : s
}

export function nowIn(tz: Zone): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date())
}
