import { Car, Check, Download, RotateCcw, Shield, Shirt, Ticket, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { CHECKLIST } from '../data/trip'
import { download, useLocal } from '../lib/store'
import { Reveal, Section } from './ui'

const ICONS: Record<string, ReactNode> = { Car: <Car size={18} />, Clothing: <Shirt size={18} />, Personal: <User size={18} />, Bookings: <Ticket size={18} />, Safety: <Shield size={18} /> }

export function packingText(done: Record<string, boolean>) {
  return ['TENNESSEE ESCAPE ’26 — Packing & prep checklist', 'Friday, November 27, 2026', '']
    .concat(...Object.entries(CHECKLIST).map(([g, items]) => [`${g.toUpperCase()}`, ...items.map((i) => `  [${done[`${g}:${i}`] ? 'x' : ' '}] ${i}`), '']))
    .join('\n')
}

export function PackingChecklist() {
  const [done, setDone] = useLocal<Record<string, boolean>>('checklist', {})
  const all = Object.entries(CHECKLIST).flatMap(([g, items]) => items.map((i) => `${g}:${i}`))
  const count = all.filter((k) => done[k]).length
  const pct = Math.round((count / all.length) * 100)
  return (
    <Section id="packing" eyebrow="Checklist" title={<>Ready to <span className="serif text-sand">roll?</span></>}>
      <div className="card no-print sticky top-[64px] z-10 mb-5 flex items-center gap-4 p-4 sm:static">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} style={{ transition: 'stroke-dasharray .5s' }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-bold">{pct}%</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">
            {count} of {all.length} done
          </p>
          <p className="muted text-xs">Saved on this device</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => download('tennessee-escape-26-checklist.txt', packingText(done))} aria-label="Download checklist">
          <Download size={15} />
          <span className="hidden sm:inline">Download</span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => confirm('Uncheck every item?') && setDone({})} aria-label="Reset checklist">
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(CHECKLIST).map(([g, items], gi) => {
          const n = items.filter((i) => done[`${g}:${i}`]).length
          return (
            <Reveal key={g} delay={gi * 60}>
              <div className="card h-full p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/15 text-teal">{ICONS[g]}</span>
                  <h3 className="h-display flex-1 text-lg">{g}</h3>
                  <span className="muted text-xs">
                    {n}/{items.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-1">
                  {items.map((i) => {
                    const k = `${g}:${i}`
                    const on = !!done[k]
                    return (
                      <li key={k}>
                        <button
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => setDone((p) => ({ ...p, [k]: !p[k] }))}
                          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-2 text-left text-[0.95rem] transition-colors hover:bg-[var(--bg-2)]"
                        >
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${on ? 'border-teal bg-teal text-midnight' : 'border-[var(--border)]'}`}>{on && <Check size={14} strokeWidth={3} />}</span>
                          <span className={on ? 'muted line-through' : ''}>{i}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
