import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'tn26:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

const listeners = new Map<string, Set<(v: unknown) => void>>()

/** Persistent state stored in this browser only (localStorage). Syncs across components and tabs. */
export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))

  useEffect(() => {
    const set = listeners.get(key) ?? new Set()
    const fn = (v: unknown) => setValue(v as T)
    set.add(fn)
    listeners.set(key, set)
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREFIX + key) setValue(read(key, fallback))
    }
    window.addEventListener('storage', onStorage)
    return () => {
      set.delete(fn)
      window.removeEventListener('storage', onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback)
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(v))
      } catch {
        /* storage unavailable — keep in memory */
      }
      listeners.get(key)?.forEach((fn) => fn(v))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, update] as const
}

export function exportAll(): string {
  const out: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (k.startsWith(PREFIX)) out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)!)
  }
  return JSON.stringify({ app: 'tennessee-escape-26', exported: new Date().toISOString(), data: out }, null, 1)
}

export function importAll(json: string) {
  const parsed = JSON.parse(json)
  if (parsed?.app !== 'tennessee-escape-26') throw new Error('Not a Tennessee Escape backup file')
  for (const [k, v] of Object.entries(parsed.data as Record<string, unknown>)) localStorage.setItem(PREFIX + k, JSON.stringify(v))
  location.reload()
}

export function download(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
