import type { CatalogSort } from '../components/catalog/CatalogFilter'

// Snapshot of a catalog view so we can send the user back to the exact place —
// same path, filters and scroll position. Snapshots are stored per history
// entry (keyed by React Router's stable `location.key`) so browser back/forward
// restores the right one, plus a "latest" lookup for the explicit return button
// (which creates a brand-new history entry of its own).
export interface CatalogReturnState {
  path: string                       // pathname + search (e.g. "/catalog/switches?q=...")
  scrollY: number
  sort: CatalogSort
  priceRange: [number, number] | null
  search: string
  ts: number
}

const KEY = 'klavisha:catalog-views'
const MAX_AGE = 30 * 60 * 1000 // ignore snapshots older than 30 min
const MAX_ENTRIES = 24         // cap stored history entries

type ViewMap = Record<string, CatalogReturnState>

function readMap(): ViewMap {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return {}
    const map = JSON.parse(raw) as ViewMap
    return map && typeof map === 'object' ? map : {}
  } catch {
    return {}
  }
}

function writeMap(map: ViewMap): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* sessionStorage unavailable (private mode / quota) — ignore */
  }
}

function fresh(s: CatalogReturnState | undefined | null): CatalogReturnState | null {
  if (!s || !s.path || typeof s.scrollY !== 'number') return null
  if (Date.now() - (s.ts ?? 0) > MAX_AGE) return null
  return s
}

// Save the current catalog view under its history-entry key, pruning stale and
// excess entries so the map stays small.
export function saveCatalogView(historyKey: string, state: Omit<CatalogReturnState, 'ts'>): void {
  const map = readMap()
  map[historyKey] = { ...state, ts: Date.now() }
  const kept = Object.entries(map)
    .filter(([, v]) => fresh(v))
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, MAX_ENTRIES)
  writeMap(Object.fromEntries(kept))
}

// Restore the snapshot for a specific history entry (browser back/forward).
export function loadCatalogView(historyKey: string): CatalogReturnState | null {
  return fresh(readMap()[historyKey])
}

// The most recently saved catalog view — used by the explicit return button.
export function loadLatestCatalogView(): CatalogReturnState | null {
  const entries = Object.values(readMap())
    .map(fresh)
    .filter((v): v is CatalogReturnState => v !== null)
  if (!entries.length) return null
  return entries.sort((a, b) => b.ts - a.ts)[0]
}
