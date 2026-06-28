import { useState, useEffect, useRef, useMemo } from 'react'
import { X, List, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  type MedusaProduct,
  type MedusaCategory,
  listProducts,
  getCheapestPrice,
} from '../../lib/medusa'
import { ProductCard } from '../ProductCard'
import { CategoryTree, collectDescendantIds, filterEmptyCategories } from '../CategoryTree'
import { OTHER_CATEGORY } from '../../lib/medusa'

interface Props {
  categories: MedusaCategory[]
  selectedCategory: MedusaCategory
  onSelectCategory: (cat: MedusaCategory) => void
  onBackToCategories: () => void
  regionId: string | null | undefined
  query: string
  favorites: string[]
  onToggleFavorite: (product: MedusaProduct) => void
  activeCategoryIds?: Set<string>
  hasUncategorized?: boolean
}

function buildAncestors(cat: MedusaCategory, all: MedusaCategory[]): MedusaCategory[] {
  const ancestors: MedusaCategory[] = []
  let current = cat
  while (current.parent_category_id) {
    const parent = all.find((c) => c.id === current.parent_category_id)
    if (!parent) break
    ancestors.unshift(parent)
    current = parent
  }
  return ancestors
}

type SortOrder = 'default' | 'asc' | 'desc'

export function ProductsView({
  categories,
  selectedCategory,
  onSelectCategory,
  onBackToCategories,
  regionId,
  query,
  favorites,
  onToggleFavorite,
  activeCategoryIds = new Set(),
  hasUncategorized = false,
}: Props) {
  const navigate = useNavigate()
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [productCount, setProductCount] = useState(0)
  const [prodLoading, setProdLoading] = useState(true)
  const [prodError, setProdError] = useState<string | null>(null)
  const isInitialLoad = useRef(true)
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [priceFromDraft, setPriceFromDraft] = useState('')
  const [priceToDraft, setPriceToDraft] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const mobileFiltersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Сбрасываем фильтры при смене категории
  useEffect(() => {
    setSortOrder('default')
    setPriceFrom('')
    setPriceTo('')
    setPriceFromDraft('')
    setPriceToDraft('')
    setSidebarOpen(false)
    setSortDropdownOpen(false)
    setMobileFiltersOpen(false)
  }, [selectedCategory.id])

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false)
      }
      if (mobileFiltersRef.current && !mobileFiltersRef.current.contains(e.target as Node)) {
        setMobileFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (regionId === undefined) return

    let cancelled = false
    setProdLoading(true)
    setProdError(null)

    const isOther = selectedCategory.id === '__other__'
    listProducts({
      regionId: regionId ?? undefined,
      categoryId: isOther ? undefined : collectDescendantIds(selectedCategory),
      q: debouncedQuery.trim() || undefined,
      limit: 100,
    })
      .then(({ products: p, count }) => {
        if (!cancelled) {
          const filtered = isOther
            ? p.filter((prod) => !prod.categories || prod.categories.length === 0)
            : p
          setProducts(filtered)
          setProductCount(isOther ? filtered.length : count)
          isInitialLoad.current = false
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setProdError(err.message ?? 'Ошибка загрузки товаров')
      })
      .finally(() => {
        if (!cancelled) setProdLoading(false)
      })

    return () => { cancelled = true }
  }, [regionId, selectedCategory, debouncedQuery])

  const displayProducts = useMemo(() => {
    let result = [...products]

    const from = priceFrom !== '' ? Number(priceFrom) : null
    const to = priceTo !== '' ? Number(priceTo) : null

    if (from !== null || to !== null) {
      result = result.filter((p) => {
        const price = getCheapestPrice(p)
        if (!price) return false
        if (from !== null && price.calculated < from) return false
        if (to !== null && price.calculated > to) return false
        return true
      })
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => (getCheapestPrice(a)?.calculated ?? Infinity) - (getCheapestPrice(b)?.calculated ?? Infinity))
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (getCheapestPrice(b)?.calculated ?? 0) - (getCheapestPrice(a)?.calculated ?? 0))
    }

    return result
  }, [products, sortOrder, priceFrom, priceTo])

  const hasFilters = priceFrom !== '' || priceTo !== '' || sortOrder !== 'default'

  const favSet = useMemo(() => new Set(favorites), [favorites])

  const pluralize = (n: number) =>
    n === 1 ? 'товар' : n >= 2 && n <= 4 ? 'товара' : 'товаров'

  const handleCategorySelect = (cat: MedusaCategory) => {
    onSelectCategory(cat)
    setSidebarOpen(false)
  }

  const sortLabels: Record<SortOrder, string> = {
    default: 'По умолчанию',
    asc: 'Цена ↑',
    desc: 'Цена ↓',
  }

  const resetFilters = () => {
    setSortOrder('default')
    setPriceFrom('')
    setPriceTo('')
    setPriceFromDraft('')
    setPriceToDraft('')
    setMobileFiltersOpen(false)
  }

  return (
    <>
      <div className="catalog-page-header">
        <nav className="catalog-breadcrumb" aria-label="Навигация">
          <button className="catalog-breadcrumb__link" onClick={() => navigate('/')}>Главная</button>
          <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
          <button className="catalog-breadcrumb__link" onClick={onBackToCategories}>Каталог</button>
          {buildAncestors(selectedCategory, categories).map((ancestor) => (
            <span key={ancestor.id} className="catalog-breadcrumb__item">
              <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
              <button className="catalog-breadcrumb__link" onClick={() => handleCategorySelect(ancestor)}>
                {ancestor.name}
              </button>
            </span>
          ))}
          <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
          <span className="catalog-breadcrumb__current">{selectedCategory.name}</span>
        </nav>
        <div className="catalog-title-row">
          <h1 className="catalog-title">{selectedCategory.name}</h1>
          {!prodLoading && !prodError && (
            <span className="catalog-count-badge">
              {hasFilters && displayProducts.length !== productCount
                ? `${displayProducts.length} из ${productCount} ${pluralize(productCount)}`
                : `${productCount} ${pluralize(productCount)}`}
            </span>
          )}
        </div>
      </div>

      <div className="catalog-layout">
        {sidebarOpen && (
          <div className="catalog-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`catalog-sidebar${sidebarOpen ? ' catalog-sidebar--open' : ''}`}>
          <div className="sidebar-mobile-header">
            <span className="sidebar-label">Категории</span>
            <button
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Закрыть"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
          <span className="sidebar-label sidebar-label--desktop">Категории</span>
          <CategoryTree
            categories={[
              ...filterEmptyCategories(
                categories.filter((c) => c.parent_category_id === null),
                activeCategoryIds
              ),
              ...(hasUncategorized ? [OTHER_CATEGORY] : []),
            ]}
            selectedId={selectedCategory.id}
            onSelect={handleCategorySelect}
          />
        </aside>

        <div className={`catalog-content${prodLoading && !isInitialLoad.current ? ' catalog-content--loading' : ''}`}>
          {(!isInitialLoad.current || !prodLoading) && !prodError && (
            <div className="catalog-toolbar" ref={mobileFiltersRef}>
              <div className="toolbar-top">
                <button
                  className="sidebar-toggle-btn"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Открыть категории"
                >
                  <List size={15} strokeWidth={2} />
                  Категории
                </button>
                <div className="toolbar-icon-group">
                  <button
                    className={`toolbar-icon-btn${hasFilters ? ' toolbar-icon-btn--active' : ''}`}
                    onClick={() => setMobileFiltersOpen(v => !v)}
                    aria-label="Фильтры и сортировка"
                  >
                    <SlidersHorizontal size={15} strokeWidth={2} />
                  </button>
                  {hasFilters && (
                    <button className="filter-reset filter-reset--mobile" onClick={resetFilters} aria-label="Сбросить фильтры">
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                <div className={`toolbar-main toolbar-main--sort${!mobileFiltersOpen ? ' toolbar-panel--mobile-hidden' : ''}`}>
                  <div className="sort-dropdown" ref={sortDropdownRef}>
                    <button
                      className={`sort-btn${sortOrder !== 'default' ? ' sort-btn--active' : ''}`}
                      onClick={() => setSortDropdownOpen((v) => !v)}
                      aria-haspopup="listbox"
                      aria-expanded={sortDropdownOpen}
                    >
                      <span className="sort-btn__label">Сортировка</span>
                      <span className="sort-btn__value">{sortLabels[sortOrder]}</span>
                      <ChevronDown size={12} strokeWidth={2.5} className={`sort-chevron${sortDropdownOpen ? ' sort-chevron--open' : ''}`} />
                    </button>
                    {sortDropdownOpen && (
                      <ul className="sort-dropdown__list" role="listbox">
                        {(['default', 'asc', 'desc'] as SortOrder[]).map((opt) => (
                          <li
                            key={opt}
                            role="option"
                            aria-selected={sortOrder === opt}
                            className={`sort-dropdown__item${sortOrder === opt ? ' sort-dropdown__item--active' : ''}`}
                            onClick={() => { setSortOrder(opt); setSortDropdownOpen(false) }}
                          >
                            {sortLabels[opt]}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className={`toolbar-main toolbar-main--price${!mobileFiltersOpen ? ' toolbar-panel--mobile-hidden' : ''}`}>
                <div className="price-filter">
                  <span className="price-filter__label">Цена</span>
                  <label className="price-field">
                    <span className="price-field__tag">от</span>
                    <input
                      className="price-input"
                      type="text"
                      inputMode="numeric"
                      value={priceFromDraft}
                      onChange={(e) => setPriceFromDraft(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
                      onKeyDown={(e) => e.key === 'Enter' && setPriceFrom(priceFromDraft.replace(/\s/g, ''))}
                      onBlur={() => setPriceFrom(priceFromDraft.replace(/\s/g, ''))}
                      aria-label="Цена от"
                    />
                  </label>
                  <span className="price-sep">—</span>
                  <label className="price-field">
                    <span className="price-field__tag">до</span>
                    <input
                      className="price-input"
                      type="text"
                      inputMode="numeric"
                      value={priceToDraft}
                      onChange={(e) => setPriceToDraft(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))}
                      onKeyDown={(e) => e.key === 'Enter' && setPriceTo(priceToDraft.replace(/\s/g, ''))}
                      onBlur={() => setPriceTo(priceToDraft.replace(/\s/g, ''))}
                      aria-label="Цена до"
                    />
                  </label>
                </div>

                {hasFilters && (
                  <>
                    <span className="toolbar-sep" />
                    <button className="filter-reset" onClick={resetFilters} aria-label="Сбросить фильтры">
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {prodLoading && isInitialLoad.current && (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          )}

          {!isInitialLoad.current && prodError && (
            <div className="empty-state">
              <div className="empty-state__icon">⚠️</div>
              <p className="empty-state__text">Ошибка загрузки</p>
              <p className="empty-state__hint">{prodError}</p>
            </div>
          )}

          {!prodLoading && !prodError && displayProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__text">Ничего не найдено</p>
              <p className="empty-state__hint">
                {hasFilters
                  ? 'Попробуйте изменить фильтры'
                  : 'Попробуйте изменить запрос или выбрать другую категорию'}
              </p>
            </div>
          )}

          {(!prodLoading || !isInitialLoad.current) && !prodError && displayProducts.length > 0 && (
            <div className="products-grid">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favSet.has(product.id)}
                  onToggleFavorite={() => onToggleFavorite(product)}
                  onCardClick={() => navigate(`/product/${product.handle}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  )
}
