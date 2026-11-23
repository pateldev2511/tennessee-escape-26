import { ArrowRight, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BUDGET_DEFAULTS, EXPENSE_CATEGORIES, type BudgetLine, type ExpenseCategory } from '../data/trip'
import { useLocal } from '../lib/store'
import { useTravelers } from './GroupPanel'
import { Reveal, Section } from './ui'

interface Expense { id: string; label: string; amount: number; category: ExpenseCategory; paidBy: string; at: string }

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 })
const COLORS: Record<ExpenseCategory, string> = { Tickets: '#55BFA7', Fuel: '#D6B98C', Breakfast: '#A7B7A4', Lunch: '#7FA88F', 'Dinner & snacks': '#C98F5A', Misc: '#6E7F7A' }

function Donut({ data }: { data: { k: ExpenseCategory; v: number }[] }) {
  const total = data.reduce((a, b) => a + b.v, 0)
  const r = 54
  const c = 2 * Math.PI * r
  let off = 0
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0" role="img" aria-label="Spending by category">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
      {total > 0 &&
        data.filter((d) => d.v > 0).map((d) => {
          const len = (d.v / total) * c
          const el = <circle key={d.k} cx="70" cy="70" r={r} fill="none" stroke={COLORS[d.k]} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />
          off += len
          return el
        })}
      <text x="70" y="66" textAnchor="middle" className="fill-[var(--muted)] text-[9px]">spent</text>
      <text x="70" y="82" textAnchor="middle" className="fill-[var(--text)] text-[15px] font-bold">{usd(total)}</text>
    </svg>
  )
}

export function BudgetCalculator() {
  const [lines, setLines] = useLocal<BudgetLine[]>('budget', BUDGET_DEFAULTS)
  const [tip, setTip] = useLocal<number>('tipPct', 0)
  const [tax, setTax] = useLocal<number>('taxPct', 0)
  const [expenses, setExpenses] = useLocal<Expense[]>('expenses', [])
  const [travelers] = useTravelers()
  const [form, setForm] = useState({ label: '', amount: '', category: 'Fuel' as ExpenseCategory, paidBy: travelers[0]?.id ?? '' })

  const low = lines.reduce((a, l) => a + l.low, 0)
  const high = lines.reduce((a, l) => a + l.high, 0)
  const mult = 1 + (tip + tax) / 100
  const n = travelers.length || 4
  const spent = expenses.reduce((a, e) => a + e.amount, 0)
  const byCat = EXPENSE_CATEGORIES.map((k) => ({ k, v: expenses.filter((e) => e.category === k).reduce((a, e) => a + e.amount, 0) }))

  const settlement = useMemo(() => {
    const share = spent / n
    const bal = travelers.map((t) => ({ t, b: expenses.filter((e) => e.paidBy === t.id).reduce((a, e) => a + e.amount, 0) - share }))
    const debtors = bal.filter((x) => x.b < -0.005).map((x) => ({ ...x, b: -x.b }))
    const creditors = bal.filter((x) => x.b > 0.005).map((x) => ({ ...x }))
    const moves: { from: string; to: string; amt: number }[] = []
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].b, creditors[j].b)
      moves.push({ from: debtors[i].t.name, to: creditors[j].t.name, amt })
      debtors[i].b -= amt
      creditors[j].b -= amt
      if (debtors[i].b < 0.005) i++
      if (creditors[j].b < 0.005) j++
    }
    return { share, bal, moves }
  }, [expenses, travelers, spent, n])

  const add = () => {
    const amount = parseFloat(form.amount)
    if (!form.label.trim() || !(amount > 0)) return
    setExpenses((p) => [...p, { id: crypto.randomUUID?.() ?? String(Date.now()), label: form.label.trim(), amount: Math.round(amount * 100) / 100, category: form.category, paidBy: form.paidBy || travelers[0]?.id, at: new Date().toISOString() }])
    setForm((f) => ({ ...f, label: '', amount: '' }))
  }
  const setLine = (id: string, k: 'low' | 'high', v: string) => setLines((p) => p.map((l) => (l.id === id ? { ...l, [k]: Math.max(0, parseFloat(v) || 0) } : l)))

  return (
    <Section id="budget" eyebrow="Budget" title={<>Costs, split <span className="serif text-sand">fairly</span></>} intro="Editable planning estimates for four adults, plus a live who-paid-what tracker. Everything is saved in this browser only — use Export in the Group section to share a copy.">
      <div className="grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="h-display text-lg">Planning estimate (group of {n})</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => (setLines(BUDGET_DEFAULTS), setTip(0), setTax(0))}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="muted text-left text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Low $</th>
                    <th className="pb-2 font-medium">High $</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-2">{l.label}</td>
                      <td className="py-1.5 pr-2"><input aria-label={`${l.label} low`} inputMode="decimal" className="input !min-h-[38px] !w-20" value={l.low} onChange={(e) => setLine(l.id, 'low', e.target.value)} /></td>
                      <td className="py-1.5"><input aria-label={`${l.label} high`} inputMode="decimal" className="input !min-h-[38px] !w-20" value={l.high} onChange={(e) => setLine(l.id, 'high', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label><span className="muted text-xs">Tip % (meals)</span><input inputMode="decimal" className="input mt-1" value={tip} onChange={(e) => setTip(Math.max(0, parseFloat(e.target.value) || 0))} /></label>
              <label><span className="muted text-xs">Tax / fees %</span><input inputMode="decimal" className="input mt-1" value={tax} onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))} /></label>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--bg-2)] p-4">
                <p className="muted text-xs">Group total</p>
                <p className="h-display mt-1 text-2xl">{usd(low * mult)} – {usd(high * mult)}</p>
              </div>
              <div className="rounded-2xl bg-teal/15 p-4">
                <p className="muted text-xs">Per traveler</p>
                <p className="h-display accent mt-1 text-2xl">{usd((low * mult) / n)} – {usd((high * mult) / n)}</p>
              </div>
            </div>
            <p className="muted mt-3 text-xs">Default estimate: $328–$498 before fees, taxes and tips (≈ $82–$125 each). Activity target: $50–$100 per person.</p>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={80}>
          <div className="card h-full p-4 sm:p-6">
            <h3 className="h-display text-lg">Spent so far</h3>
            <div className="mt-4 flex items-center gap-4">
              <Donut data={byCat} />
              <ul className="space-y-1 text-xs">
                {byCat.map((c) => (
                  <li key={c.k} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[c.k] }} />
                    <span className="muted">{c.k}</span>
                    <span className="font-semibold">{usd(c.v)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5">
              <div className="muted flex justify-between text-xs">
                <span>Budget used (vs. high estimate)</span>
                <span>{usd(Math.max(0, high * mult - spent))} left</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--bg-2)]">
                <div className={`h-full rounded-full ${spent > high * mult ? 'bg-red-400' : 'bg-teal'}`} style={{ width: `${Math.min(100, (spent / (high * mult || 1)) * 100)}%`, transition: 'width .6s' }} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-5">
        <div className="card p-4 sm:p-6">
          <h3 className="h-display text-lg">Group expense tracker</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <input className="input" placeholder="What was it? e.g. Fuel at Monteagle" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <input className="input" inputMode="decimal" placeholder="$ Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="input" value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} aria-label="Paid by">
              {travelers.map((t) => <option key={t.id} value={t.id}>Paid by {t.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={add}><Plus size={16} /> Add</button>
          </div>

          {expenses.length === 0 ? (
            <p className="muted mt-5 text-sm">No expenses yet. Add the cave tickets once they’re bought.</p>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--border)]">
              {expenses.slice().reverse().map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[e.category] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.label}</span>
                    <span className="muted text-xs">{e.category} · {travelers.find((t) => t.id === e.paidBy)?.name ?? '—'}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{usd(e.amount)}</span>
                  <button className="btn btn-ghost btn-sm !min-h-[36px] !px-2.5" aria-label={`Delete ${e.label}`} onClick={() => setExpenses((p) => p.filter((x) => x.id !== e.id))}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Balances</p>
              <p className="muted mt-1 text-xs">Equal share: {usd(settlement.share)} each</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {settlement.bal.map(({ t, b }) => (
                  <li key={t.id} className="flex justify-between">
                    <span>{t.emoji} {t.name}</span>
                    <span className={b >= 0 ? 'accent font-semibold' : 'font-semibold text-sand'}>{b >= 0 ? '+' : '−'}{usd(Math.abs(b))}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Settle up</p>
              {settlement.moves.length ? (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {settlement.moves.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl bg-[var(--bg-2)] px-3 py-2">
                      {m.from} <ArrowRight size={14} className="accent" /> {m.to}
                      <span className="ml-auto font-semibold">{usd(m.amt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted mt-2 text-sm">Everyone is square.</p>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
