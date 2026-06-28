import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, ChevronLeft } from 'lucide-react'

export type CatalogSort = 'default' | 'asc' | 'desc' | 'az'

// Slider physical max — represents ∞ (no upper bound). One step below = REAL_MAX.
export const PRICE_INFINITY = 2_200_000
const REAL_MAX = 2_000_000
const STEP = 25_000

const SORTS: { id: CatalogSort; label: string }[] = [
  { id: 'default', label: 'По умолчанию' },
  { id: 'asc', label: 'Цена ↑' },
  { id: 'desc', label: 'Цена ↓' },
  { id: 'az', label: 'А–Я' },
]

interface Props {
  priceBounds: [number, number]
  range: [number, number]
  sort: CatalogSort
  prices: number[]
  onApply: (sort: CatalogSort, range: [number, number]) => void
}

function PriceInput({
  value,
  onCommit,
  isInfinity = false,
  onSetInfinity,
}: {
  value: number
  onCommit: (n: number) => void
  isInfinity?: boolean
  onSetInfinity?: () => void
}) {
  const [draft, setDraft] = useState(isInfinity ? '∞' : String(value))

  useEffect(() => {
    setDraft(isInfinity ? '∞' : String(value))
  }, [value, isInfinity])

  const commit = () => {
    if (draft === '∞' || draft.trim() === '') {
      onSetInfinity?.()
      return
    }
    const n = parseInt(draft.replace(/\s/g, ''), 10)
    if (Number.isFinite(n)) onCommit(n)
    else setDraft(isInfinity ? '∞' : String(value))
  }

  return (
    <span className="edt-pricebox">
      <input
        type={isInfinity ? 'text' : 'number'}
        inputMode="numeric"
        value={draft}
        aria-label="Цена"
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => { if (isInfinity) setDraft('') }}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
      />
      {!isInfinity && <span className="edt-pricebox__u">сум</span>}
    </span>
  )
}

function RangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [lo, hi] = value
  const span = max - min || 1
  const pct = (v: number) => ((v - min) / span) * 100

  // When thumbs overlap at max, lo must be on top so it can be dragged left.
  // Otherwise hi sits on top (higher DOM order) so it can be dragged right to separate.
  const loZ = lo === hi && lo >= max - STEP ? 5 : 2

  return (
    <div className="edt-range">
      <div className="edt-range__track" />
      <div className="edt-range__fill" style={{ left: pct(lo) + '%', right: 100 - pct(hi) + '%' }} />
      <input
        type="range"
        min={min}
        max={max}
        step={STEP}
        value={lo}
        aria-label="Минимальная цена"
        style={{ zIndex: loZ }}
        onChange={(e) => {
          const newLo = Math.min(+e.target.value, hi === PRICE_INFINITY ? REAL_MAX : hi)
          onChange([newLo, hi])
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={STEP}
        value={hi}
        aria-label="Максимальная цена"
        style={{ zIndex: 3 }}
        onChange={(e) => {
          const raw = +e.target.value
          // Any value above REAL_MAX snaps to PRICE_INFINITY (∞)
          const snapped = raw > REAL_MAX ? PRICE_INFINITY : Math.max(raw, lo)
          onChange([lo, snapped])
        }}
      />
    </div>
  )
}

export function CatalogFilter({ priceBounds, range, sort, prices, onApply }: Props) {
  const [pmin, pmax] = priceBounds
  const [open, setOpen] = useState(false)
  const [dSort, setDSort] = useState<CatalogSort>(sort)
  const [dRange, setDRange] = useState<[number, number]>(range)
  const ref = useRef<HTMLDivElement>(null)

  const activeCount =
    (sort !== 'default' ? 1 : 0) + (range[0] !== pmin || range[1] !== pmax ? 1 : 0)
  const preview = prices.filter(
    (p) => p >= dRange[0] && (dRange[1] >= PRICE_INFINITY || p <= dRange[1])
  ).length

  const openMenu = () => {
    setDSort(sort)
    setDRange(range)
    setOpen(true)
  }
  const toggle = () => (open ? setOpen(false) : openMenu())
  const apply = () => {
    onApply(dSort, dRange)
    setOpen(false)
  }
  const reset = () => {
    setDSort('default')
    setDRange([pmin, pmax])
  }

  useEffect(() => {
    if (!open) return

    history.pushState({ klavishaFilter: true }, '')
    let poppedBySystem = false

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onPopState = () => { poppedBySystem = true; setOpen(false) }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)

    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
      if (!poppedBySystem) history.back()
    }
  }, [open])

  return (
    <div className="edt-filter-anchor" ref={ref}>
      <button
        className={`edt-filter-btn${activeCount ? ' edt-filter-btn--act' : ''}${open ? ' edt-filter-btn--open' : ''}`}
        onClick={toggle}
        aria-expanded={open}
      >
        <SlidersHorizontal size={15} strokeWidth={1.8} />
        <span className="edt-filter-btn__label">Фильтр</span>
        {activeCount > 0 && <span className="edt-fb-dot">{activeCount}</span>}
      </button>

      {open && (
        <>
          <div className="edt-filter-backdrop" onClick={() => setOpen(false)} />
          <div className="edt-filter-panel">
          <div className="edt-fp-head">
            <button className="edt-fp-back" onClick={() => setOpen(false)} aria-label="Назад">
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
            <span className="edt-fp-title">Фильтр и сортировка</span>
            <span className="edt-fp-count"><b>{preview}</b> из {prices.length}</span>
          </div>

          <div className="edt-fp-sec">
            <span className="edt-fp-lab">Сортировка</span>
            <div className="edt-tb-sort">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  className={dSort === s.id ? 'on' : ''}
                  onClick={() => setDSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="edt-fp-sec">
            <span className="edt-fp-lab">Цена, сум</span>
            <RangeSlider min={pmin} max={pmax} value={dRange} onChange={setDRange} />
            <div className="edt-tb-inputs">
              <PriceInput
                value={dRange[0]}
                onCommit={(v) =>
                  setDRange([
                    Math.min(Math.max(pmin, v), dRange[1] === PRICE_INFINITY ? REAL_MAX : dRange[1]),
                    dRange[1],
                  ])
                }
              />
              <span className="edt-tb-dash">—</span>
              <PriceInput
                value={dRange[1] >= PRICE_INFINITY ? REAL_MAX : dRange[1]}
                isInfinity={dRange[1] >= PRICE_INFINITY}
                onSetInfinity={() => setDRange([dRange[0], PRICE_INFINITY])}
                onCommit={(v) =>
                  setDRange([dRange[0], Math.min(REAL_MAX, Math.max(dRange[0], v))])
                }
              />
            </div>
          </div>

          <div className="edt-fp-foot">
            <button className="edt-fp-reset" onClick={reset}>Сбросить</button>
            <button className="edt-fp-apply" onClick={apply}>Применить</button>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
