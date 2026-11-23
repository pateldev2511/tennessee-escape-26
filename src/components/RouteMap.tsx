import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { useItinerary } from '../lib/itinerary'
import { fmtTime } from '../lib/time'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Leaflet map with verified stop markers only. No road polyline is drawn (no routing service configured). */
export default function RouteMap({ theme, focus }: { theme: 'dark' | 'light'; focus: 'all' | 'tn' }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const { stops } = useItinerary()

  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { zoomControl: true, scrollWheelZoom: false, tap: true } as L.MapOptions)
    layer.current = L.layerGroup().addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current) return
    tiles.current?.remove()
    tiles.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: theme === 'dark' ? 'tiles-dark' : '',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current)
  }, [theme])

  useEffect(() => {
    if (!map.current || !layer.current) return
    layer.current.clearLayers()
    const seen = new Map<string, number>()
    const bounds: L.LatLngExpression[] = []
    stops.forEach((s, i) => {
      const key = `${s.coord.lat},${s.coord.lng}`
      if (seen.has(key)) return // Gainesville start & return share one pin
      seen.set(key, i)
      const label = s.id === 'depart' ? 'GA' : String(i)
      const isHome = s.id === 'depart'
      const time = s.timePending ? 'Tour time pending booking confirmation' : fmtTime(s.startAt, s.start.tz)
      const icon = L.divIcon({ className: '', html: `<div class="pin" style="${isHome ? 'background:#D6B98C' : ''}"><span>${label}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] })
      const name = isHome ? 'Gainesville, GA — start & finish' : s.name
      const html = `<div style="min-width:200px">
        <div style="font:700 10px/1 Inter;letter-spacing:.18em;text-transform:uppercase;color:var(--sand)">${esc(s.category)}</div>
        <div style="font:800 15px/1.25 'Plus Jakarta Sans';margin:4px 0">${esc(name)}</div>
        <div style="color:var(--accent);font-weight:600">${esc(time)}</div>
        <div style="color:var(--muted);margin:6px 0">${esc(s.summary)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          <a class="btn btn-primary btn-sm" style="color:#0B1515" target="_blank" rel="noopener" href="${esc(s.navUrl)}">Start Navigation</a>
          <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${esc(s.mapsUrl)}">Google Maps</a>
        </div></div>`
      L.marker([s.coord.lat, s.coord.lng], { icon, title: name, alt: name, keyboard: true }).bindPopup(html).addTo(layer.current!)
      bounds.push([s.coord.lat, s.coord.lng])
    })
    const pts = focus === 'tn' ? bounds.filter((b) => (b as [number, number])[1] < -84.5) : bounds
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts), { padding: [36, 36] })
  }, [stops, focus])

  return <div ref={el} className="h-[440px] w-full sm:h-[560px]" role="region" aria-label="Map of trip stops" />
}
