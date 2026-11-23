import { Car, Download, Plus, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { TRAVELERS_DEFAULT } from '../data/trip'
import { download, exportAll, importAll, useLocal } from '../lib/store'
import { Callout, Reveal, Section } from './ui'

export interface Traveler { id: string; name: string; driver: boolean; emoji: string; tasks?: string[] }
export const useTravelers = () => useLocal<Traveler[]>('travelers', TRAVELERS_DEFAULT)

const EMOJIS = ['🧭', '📸', '🗺️', '🎒', '🏞️', '🦇', '🧘', '🚗', '☕', '🍗', '🌄', '⛰️']

function TravelerCard({ t, onChange }: { t: Traveler; onChange: (t: Traveler) => void }) {
  const [task, setTask] = useState('')
  const addTask = () => task.trim() && (onChange({ ...t, tasks: [...(t.tasks ?? []), task.trim()] }), setTask(''))
  return (
    <div className="card h-full p-4">
      <div className="flex items-center gap-3">
        <button
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--bg-2)] text-2xl"
          aria-label={`Change avatar for ${t.name}`}
          onClick={() => onChange({ ...t, emoji: EMOJIS[(EMOJIS.indexOf(t.emoji) + 1) % EMOJIS.length] })}
        >
          {t.emoji}
        </button>
        <input className="input !min-h-[40px] font-semibold" aria-label="Display name" maxLength={24} value={t.name} onChange={(e) => onChange({ ...t, name: e.target.value })} />
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5 accent-[#55BFA7]" checked={t.driver} onChange={(e) => onChange({ ...t, driver: e.target.checked })} />
        <Car size={15} className="accent" /> Designated driver
      </label>
      <div className="mt-3">
        <p className="muted text-xs">Prep tasks</p>
        <ul className="mt-1.5 space-y-1">
          {(t.tasks ?? []).map((x, i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg bg-[var(--bg-2)] px-2.5 py-1.5 text-sm">
              <span className="flex-1">{x}</span>
              <button aria-label={`Remove task ${x}`} className="muted p-1" onClick={() => onChange({ ...t, tasks: t.tasks!.filter((_, j) => j !== i) })}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-1.5">
          <input className="input !min-h-[38px] text-sm" placeholder="e.g. Book cave tickets" value={task} onChange={(e) => setTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
          <button className="btn btn-ghost btn-sm !px-3" aria-label="Add task" onClick={addTask}>
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function GroupPanel() {
  const [travelers, setTravelers] = useTravelers()
  const [notes, setNotes] = useLocal<string>('notes', '')
  const file = useRef<HTMLInputElement>(null)
  const drivers = travelers.filter((t) => t.driver).length
  return (
    <Section id="group" eyebrow="The crew" title={<>Four friends, <span className="serif text-sand">one plan</span></>} intro="Set names, drivers and who’s doing what. No contact details or home addresses are stored or published.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {travelers.map((t, i) => (
          <Reveal key={t.id} delay={i * 60}>
            <TravelerCard t={t} onChange={(nt) => setTravelers((p) => p.map((x) => (x.id === nt.id ? nt : x)))} />
          </Reveal>
        ))}
      </div>
      {drivers !== 2 && (
        <div className="mt-4">
          <Callout>The plan assumes 2 drivers — currently {drivers} selected.</Callout>
        </div>
      )}

      <Reveal className="mt-5">
        <div className="card p-4 sm:p-6">
          <label htmlFor="notes" className="h-display text-lg">Group notes</label>
          <textarea
            id="notes"
            className="input mt-3 !min-h-[140px] py-3 leading-relaxed"
            placeholder="Snack list, playlist ideas, who brings the cooler…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="mt-4">
            <Callout tone="info">
              <strong>Saved on this device only.</strong> This site has no server, so edits (checklists, expenses, bookings, notes) stay in this browser. To share your copy, export it and send the file to a friend — they can import it here.
            </Callout>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => download('tennessee-escape-26-backup.json', exportAll(), 'application/json')}>
              <Download size={15} /> Export my trip data
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => file.current?.click()}>
              <Upload size={15} /> Import trip data
            </button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                if (!confirm('Replace your current trip data on this device with the imported file?')) return
                try {
                  importAll(await f.text())
                } catch (err) {
                  alert(String((err as Error).message))
                }
              }}
            />
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
