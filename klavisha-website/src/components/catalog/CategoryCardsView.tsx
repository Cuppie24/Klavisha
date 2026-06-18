import { Keyboard, Layers, Zap, Cable, Droplets, Wrench, Square, Package, Briefcase, ArrowRight } from 'lucide-react'
import type { MedusaCategory } from '../../lib/medusa'

interface Props {
  categories: MedusaCategory[]
  loading: boolean
  error: string | null
  onSelect: (cat: MedusaCategory) => void
  categoryImages?: Record<string, string>
}

const PALETTE = [
  { bg: '#00c47a', label: 'Зелёный' },
  { bg: '#6366f1', label: 'Индиго' },
  { bg: '#f97316', label: 'Оранжевый' },
  { bg: '#ec4899', label: 'Розовый' },
  { bg: '#14b8a6', label: 'Бирюзовый' },
  { bg: '#a855f7', label: 'Фиолетовый' },
  { bg: '#ca8a04', label: 'Жёлтый' },
  { bg: '#ef4444', label: 'Красный' },
]

function getCategoryIcon(handle: string) {
  const h = handle.toLowerCase()
  const props = { size: 44, strokeWidth: 1.5 }
  if (h.includes('keyboard') || h.includes('klaviat')) return <Keyboard {...props} />
  if (h.includes('switch') || h.includes('klapish') || h.includes('svitch') || h.includes('perekl')) return <Zap {...props} />
  if (h.includes('keycap') || h.includes('kolpach') || h.includes('kaps')) return <Layers {...props} />
  if (h.includes('cable') || h.includes('kabel') || h.includes('provod')) return <Cable {...props} />
  if (h.includes('lube') || h.includes('smazk')) return <Droplets {...props} />
  if (h.includes('tool') || h.includes('instrument')) return <Wrench {...props} />
  if (h.includes('mat') || h.includes('kovrik')) return <Square {...props} />
  if (h.includes('bag') || h.includes('sumka')) return <Briefcase {...props} />
  return <Package {...props} />
}

export function CategoryCardsView({ categories, loading, error, onSelect, categoryImages = {} }: Props) {
  if (loading) {
    return (
      <div className="cat-hero-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cat-hero-skeleton" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__text">Ошибка загрузки</p>
        <p className="empty-state__hint">{error}</p>
      </div>
    )
  }

  const isOdd = categories.length % 2 !== 0

  return (
    <div className="cat-hero-grid">
      {categories.map((cat, idx) => {
        const palette = PALETTE[idx % PALETTE.length]
        const isLastOdd = isOdd && idx === categories.length - 1
        const previewImg = categoryImages[cat.name.toLowerCase()]
        return (
          <button
            key={cat.id}
            className={`cat-hero-card${isLastOdd ? ' cat-hero-card--center' : ''}`}
            onClick={() => onSelect(cat)}
          >
            <div
              className="cat-hero-card__top"
              style={previewImg ? undefined : { background: palette.bg }}
            >
              {previewImg ? (
                <img
                  src={previewImg}
                  alt={cat.name}
                  className="cat-hero-card__preview-img"
                />
              ) : (
                <>
                  <div className="cat-hero-card__blob cat-hero-card__blob--1" />
                  <div className="cat-hero-card__blob cat-hero-card__blob--2" />
                  <div className="cat-hero-card__icon-wrap">
                    {getCategoryIcon(cat.handle)}
                  </div>
                </>
              )}
            </div>
            <div className="cat-hero-card__body">
              <div className="cat-hero-card__text">
                <span className="cat-hero-card__name">{cat.name}</span>
                {cat.category_children.length > 0 && (
                  <span className="cat-hero-card__sub">
                    {cat.category_children.length} {pluralizeSubcategories(cat.category_children.length)}
                  </span>
                )}
              </div>
              <span className="cat-hero-card__arrow" style={{ color: palette.bg }}>
                <ArrowRight size={22} strokeWidth={2} />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function pluralizeSubcategories(n: number): string {
  if (n === 1) return 'подкатегория'
  if (n >= 2 && n <= 4) return 'подкатегории'
  return 'подкатегорий'
}
