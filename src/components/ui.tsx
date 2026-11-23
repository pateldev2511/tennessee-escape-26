import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ImageKey } from '../data/trip'
import { IMAGES } from '../data/images'

const BASE = import.meta.env.BASE_URL

/** Adds the `in` class once the element scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return el.classList.add('in')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

export function Section({ id, eyebrow, title, intro, children, className = '' }: { id: string; eyebrow: string; title: ReactNode; intro?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 ${className}`}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h-display mt-3 text-[2rem] leading-[1.05] sm:text-5xl">{title}</h2>
        {intro && <p className="muted mt-4 max-w-2xl text-[0.98rem] leading-relaxed sm:text-lg">{intro}</p>}
      </Reveal>
      <div className="mt-8 sm:mt-12">{children}</div>
    </section>
  )
}

/** Responsive, lazy photo with graceful skeleton. */
export function Photo({ k, alt, className = '', sizes = '(min-width: 768px) 50vw, 100vw', eager = false }: { k: ImageKey; alt: string; className?: string; sizes?: string; eager?: boolean }) {
  const img = IMAGES[k]
  const [loaded, setLoaded] = useState(false)
  if (!img)
    return (
      <div className={`relative overflow-hidden bg-[radial-gradient(120%_90%_at_10%_0%,#2b5a4c_0%,#183b32_35%,#0b1515_100%)] ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
          <path d="M-10 150 C 80 110, 120 140, 200 90 S 330 40, 420 60" fill="none" stroke="#D6B98C" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
          <path d="M0 160 L70 95 L120 130 L190 70 L260 120 L330 80 L400 115 L400 160Z" fill="#0B1515" opacity=".55" />
          <circle cx="330" cy="38" r="14" fill="#D6B98C" opacity=".8" />
        </svg>
      </div>
    )
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0 rounded-none" aria-hidden />}
      <img
        src={`${BASE}img/${img.file}-800.webp`}
        srcSet={img.widths.map((w) => `${BASE}img/${img.file}-${w}.webp ${w}w`).join(', ')}
        sizes={sizes}
        alt={alt}
        width={img.w}
        height={img.h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectPosition: img.focus ?? 'center' }}
      />
    </div>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 text-left">
      <div className="h-display text-2xl sm:text-3xl">{value}</div>
      <div className="muted mt-0.5 text-[0.78rem] leading-tight">{label}</div>
    </div>
  )
}

export function ExtLink({ href, children, className = 'btn btn-ghost btn-sm' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export function Callout({ tone = 'warn', children }: { tone?: 'warn' | 'info' | 'danger'; children: ReactNode }) {
  const c = tone === 'danger' ? 'border-red-400/40 bg-red-500/10' : tone === 'info' ? 'border-teal/30 bg-teal/10' : 'border-sand/40 bg-sand/10'
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${c}`}>{children}</div>
}
