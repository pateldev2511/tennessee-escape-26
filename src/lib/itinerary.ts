import { useMemo } from 'react'
import { BOOKINGS, PLANS, STOPS, type BookingStatus, type PlanId, type Stop, type WallTime } from '../data/trip'
import { useLocal } from './store'
import { wallToDate } from './time'

export type StopStatus = 'upcoming' | 'arrived' | 'completed' | 'skipped'

export interface BookingState { status: BookingStatus; time?: string; note?: string; tour?: string }

export function useBookings() {
  const init = Object.fromEntries(BOOKINGS.map((b) => [b.id, { status: b.defaultStatus } as BookingState]))
  return useLocal<Record<string, BookingState>>('bookings', init)
}

export function usePlanId() {
  return useLocal<PlanId>('plan', 'A')
}

export function useStopStatus() {
  return useLocal<Record<string, StopStatus>>('stopStatus', {})
}

export function useTimeEdits() {
  return useLocal<Record<string, string>>('timeEdits', {})
}

export interface ResolvedStop extends Stop {
  startAt: Date
  endAt?: Date
  timePending: boolean
  edited: boolean
}

/** Applies plan overrides, manual time edits and a confirmed cave booking time. */
export function useItinerary() {
  const [planId] = usePlanId()
  const [bookings] = useBookings()
  const [edits] = useTimeEdits()
  return useMemo(() => {
    const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0]
    const stops: ResolvedStop[] = plan.stops.map((id) => {
      const base = STOPS.find((s) => s.id === id)!
      const s: Stop = { ...base, ...(plan.overrides?.[id] ?? {}) }
      let start: WallTime = s.start
      const edited = Boolean(edits[`${planId}:${id}`])
      if (edited) start = { ...start, time: edits[`${planId}:${id}`] }
      let timePending = false
      if (id === 'caverns') {
        const b = bookings.caverns
        if (b?.status === 'Booked' && b.time) {
          start = { ...start, time: b.time }
        } else timePending = true
      }
      const startAt = wallToDate(start)
      let endAt = s.end ? wallToDate(s.end) : undefined
      if (id === 'caverns' && !timePending && bookings.caverns?.time) {
        const mins = bookings.caverns.tour === 'Cardwell' ? 45 : 90
        endAt = new Date(startAt.getTime() + mins * 60000)
      }
      if (endAt && endAt < startAt) endAt = undefined
      return { ...s, start, startAt, endAt, timePending, edited }
    })
    return { plan, stops }
  }, [planId, bookings, edits])
}

// ── Calendar (.ics) ──────────────────────────────────────────────────────────
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n')

export function buildIcs(stops: ResolvedStop[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tennessee Escape 26//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Tennessee Escape ’26']
  for (const s of stops) {
    const end = s.endAt ?? new Date(s.startAt.getTime() + 30 * 60000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}-20261127@tennessee-escape-26`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(s.startAt)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${esc((s.timePending ? '[TIME UNCONFIRMED] ' : '') + s.name)}`,
      `LOCATION:${esc(s.place)}`,
      `DESCRIPTION:${esc(`${s.summary}\nMaps: ${s.mapsUrl}${s.bookingUrl ? `\nBooking: ${s.bookingUrl}` : ''}\nPlanning target only — verify times.`)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
