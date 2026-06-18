import { useState, useEffect, useRef, useMemo } from 'react'
import { X, List, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  type MedusaProduct,
  type MedusaCategory,
  listProducts,
  getCheapestPrice,
} from '../../lib/medusa'
import { ProductCard } from '../ProductCard'
import { CategoryTree } from '../CategoryTree'

interface Props {
  categories: MedusaCategory[]
  searchQuery: string
  onSelectCategory: (cat: MedusaCategory) => void
  onBackToCategories: () => void
  regionId: string | null | undefined
  favorites: string[]
  onToggleFavorite: (id: string) => void
}

type SortOrder = 'default' | 'asc' | 'desc'

export function SearchResultsView({
  categories,
  searchQuery,
  onSelectCategory,
  onBackToCategories,
  regionId,
  favorites,
  onToggleFavorite,
}: Props) {
  const navigate = useNavigate()
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [productCount, setProductCount] = useState(0)
  const [prodLoading, setProdLoading] = useState(true)
  const [prodError, setProdError] = useState<string | null>(null)
  const isInitialLoad = useRef(true)

  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (regionId === undefined) return

    isInitialLoad.current = true
    let cancelled = false
    setProdLoading(true)
    setProdError(null)
    setSortOrder('default')
    setPriceFrom('')
    setPriceTo('')

    listProducts({
      regionId: regionId ?? undefined,
      q: searchQuery,
      limit: 100,
    })
      .then(({ products: p, count }) => {
        if (!cancelled) {
          setProducts(p)
          setProductCount(count)
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
  }, [regionId, searchQuery])

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
  }

  return (
    <>
      <div className="catalog-page-header">
        <nav className="catalog-breadcrumb" aria-label="Навигация">
          <button className="catalog-breadcrumb__link" onClick={() => navigate('/')}>Главная</button>
          <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
          <button className="catalog-breadcrumb__link" onClick={onBackToCategories}>Каталог</button>
          <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
          <span className="catalog-breadcrumb__current">Результат поиска</span>
        </nav>
        <div className="catalog-title-row">
          <h1 className="catalog-title">Результат поиска: «{searchQuery}»</h1>
          {!prodLoading && !prodError && (
            <span className="catalog-count-badge">
              {hasFilters && displayProducts.length !== productCount
                ? `${displayProducts.length} из ${productCount} ${pluralize(productCount)}`
                : `${productCount} ${pluralize(productCount)}`}
            </span>
          )}
        </div>
        <p className="catalog-search-hint">По запросу: «{searchQuery}»</p>
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
            categories={categories.filter((c) => c.parent_category_id === null)}
            selectedId={null}
            onSelect={handleCategorySelect}
          />
        </aside>

        <div className={`catalog-content${prodLoading && !isInitialLoad.current ? ' catalog-content--loading' : ''}`}>
          {(!isInitialLoad.current || !prodLoading) && !prodError && (
            <div className="catalog-toolbar">
              <div className="toolbar-main">
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

                <span className="toolbar-sep" />

                <div className="price-filter">
                  <span className="price-filter__label">Цена</span>
                  <label className="price-field">
                    <span className="price-field__tag">от</span>
                    <input
                      className="price-input"
                      type="number"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      min={0}
                      aria-label="Цена от"
                    />
                  </label>
                  <span className="price-sep">—</span>
                  <label className="price-field">
                    <span className="price-field__tag">до</span>
                    <input
                      className="price-input"
                      type="number"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      min={0}
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

              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Открыть категории"
              >
                <List size={15} strokeWidth={2} />
                Категории
              </button>
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
                  onToggleFavorite={() => onToggleFavorite(product.id)}
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
