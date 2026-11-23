import { CalendarPlus, Check, Copy, Download, FileDown, MessageCircle, Printer, Share2 } from 'lucide-react'
import { useState } from 'react'
import { SHARE_MESSAGE, SITE_URL } from '../data/trip'
import { buildIcs, useItinerary } from '../lib/itinerary'
import { download, useLocal } from '../lib/store'
import { packingText } from './PackingChecklist'
import { Reveal, Section } from './ui'

const gcal = (title: string, startUtc: string, endUtc: string, details: string) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUtc}/${endUtc}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('Gainesville, GA → McMinnville, TN')}`
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function ShareTrip() {
  const { stops } = useItinerary()
  const [copied, setCopied] = useState(false)
  const [done] = useLocal<Record<string, boolean>>('checklist', {})
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL)
    } catch {
      const t = Object.assign(document.createElement('textarea'), { value: SITE_URL })
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  const first = stops[0]?.startAt
  const last = stops.at(-1)?.endAt ?? stops.at(-1)?.startAt

  const actions = [
    { icon: copied ? <Check size={20} /> : <Copy size={20} />, label: copied ? 'Link copied!' : 'Copy Link', onClick: copy },
    ...(canShare ? [{ icon: <Share2 size={20} />, label: 'Share…', onClick: () => navigator.share({ title: 'Tennessee Escape ’26', text: SHARE_MESSAGE.replace(SITE_URL, '').trim(), url: SITE_URL }).catch(() => {}) }] : []),
    { icon: <MessageCircle size={20} />, label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(SHARE_MESSAGE)}` },
    { icon: <Printer size={20} />, label: 'Print itinerary', onClick: () => window.print() },
    { icon: <FileDown size={20} />, label: 'Save as PDF', onClick: () => window.print(), hint: 'Choose “Save as PDF” in the print dialog' },
    { icon: <CalendarPlus size={20} />, label: 'Add to Calendar (.ics)', onClick: () => download('tennessee-escape-26.ics', buildIcs(stops), 'text/calendar') },
    ...(first && last ? [{ icon: <CalendarPlus size={20} />, label: 'Google Calendar', href: gcal('Tennessee Escape ’26', utc(first), utc(last), `Full itinerary: ${SITE_URL}`) }] : []),
    { icon: <Download size={20} />, label: 'Packing checklist', onClick: () => download('tennessee-escape-26-checklist.txt', packingText(done)) },
  ]

  return (
    <Section id="share" eyebrow="Share" title={<>Send it to <span className="serif text-sand">the crew</span></>}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {actions.map((a) => {
              const inner = (
                <>
                  <span className="accent">{a.icon}</span>
                  <span className="text-sm font-semibold">{a.label}</span>
                  {'hint' in a && a.hint && <span className="muted text-[0.68rem] leading-tight">{a.hint}</span>}
                </>
              )
              const cls = 'card flex min-h-[96px] flex-col items-start gap-2 !rounded-2xl p-4 text-left transition-colors hover:border-teal'
              return 'href' in a && a.href ? (
                <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <button key={a.label} onClick={'onClick' in a ? a.onClick : undefined} className={cls}>
                  {inner}
                </button>
              )
            })}
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="card p-5">
            <p className="eyebrow">WhatsApp message</p>
            <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">{SHARE_MESSAGE}</pre>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
