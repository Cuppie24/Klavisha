import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation, useNavigationType } from 'react-router-dom'
import { X } from 'lucide-react'
import { saveCatalogView, loadCatalogView, type CatalogReturnState } from '../lib/catalogState'
import {
  type MedusaCategory,
  type CatalogPriceItem,
  listCategories,
  getDefaultRegion,
  getActiveCategoryIds,
  getCatalogPriceItems,
  getCachedCategories,
  getCachedActiveCategoryIds,
  getCachedDefaultRegion,
  OTHER_CATEGORY,
} from '../lib/medusa'
import { filterEmptyCategories, collectDescendantIds } from '../components/CategoryTree'
import { AllCategoriesView } from '../components/catalog/AllCategoriesView'
import { CatalogFilter, PRICE_INFINITY, type CatalogSort } from '../components/catalog/CatalogFilter'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'
import { useFavoritesContext } from '../context/FavoritesContext'

// Must stay in sync with --header-h in index.css
const HEADER_H = 64
const CATBAR_H = 54

export function CatalogPage() {
  const { categoryHandle } = useParams<{ categoryHandle: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const [searchParams] = useSearchParams()

  // Scroll position is restored by <ScrollRestoration> (see App.tsx). Here we only
  // restore the *filters* (sort + price), which are React state the framework
  // can't see. Decide once, before any effect runs, whether this is a return:
  //  • the product page's return button passes the snapshot in `state.restore`;
  //  • a browser back/forward (POP) lands on an entry we have a snapshot for.
  const [restoreState] = useState<CatalogReturnState | null>(() => {
    const fromButton = (location.state as { restore?: CatalogReturnState } | null)?.restore
    if (fromButton) return fromButton
    if (navigationType === 'POP') return loadCatalogView(location.key)
    return null
  })

  // Seed the catalog shell synchronously from the session cache so a returning
  // catalog renders at its full previous height on the very first commit — the
  // precondition for <ScrollRestoration> to land the scroll position exactly.
  const cachedActive = getCachedActiveCategoryIds()
  const [categories, setCategories] = useState<MedusaCategory[]>(() => getCachedCategories() ?? [])
  const [catLoading, setCatLoading] = useState(() => getCachedCategories() === null)
  const [activeCategoryIds, setActiveCategoryIds] = useState<Set<string>>(() => cachedActive?.categoryIds ?? new Set())
  const [hasUncategorized, setHasUncategorized] = useState(() => cachedActive?.hasUncategorized ?? false)
  const [regionId, setRegionId] = useState<string | null | undefined>(() => getCachedDefaultRegion()?.id ?? undefined)

  const initialQ = searchParams.get('q') ?? ''
  const [inputQuery, setInputQuery] = useState(initialQ)
  const [activeSearch, setActiveSearch] = useState(initialQ)

  const [scrolled, setScrolled] = useState(false)
  const [activeCatId, setActiveCatId] = useState<string | null>(null)

  // Filter state (sort + price range), driven by the global price list.
  // Seeded from the restore snapshot so the first render already matches.
  const [priceItems, setPriceItems] = useState<CatalogPriceItem[]>([])
  const [sort, setSort] = useState<CatalogSort>(restoreState?.sort ?? 'default')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(restoreState?.priceRange ?? null)

  const { favoriteIds, toggleFavorite } = useFavoritesContext()

  // Persist the current filters (keyed by this history entry) so a return — by
  // button or by browser back/forward — can re-apply them. Scroll itself is
  // handled by <ScrollRestoration>; we only carry the filter state here.
  useEffect(() => {
    saveCatalogView(location.key, {
      path: location.pathname + location.search,
      scrollY: window.scrollY,
      sort,
      priceRange,
      search: activeSearch,
    })
  }, [location.key, location.pathname, location.search, sort, priceRange, activeSearch])

  // Header scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (getCachedDefaultRegion()) return // already seeded synchronously
    getDefaultRegion()
      .then((r) => setRegionId(r?.id ?? null))
      .catch(() => setRegionId(null))
  }, [])

  useEffect(() => {
    // Already hydrated from cache → don't flip catLoading (it would collapse the
    // page height for a frame and break scroll restoration on return).
    if (getCachedCategories() && getCachedActiveCategoryIds()) return
    setCatLoading(true)
    Promise.all([listCategories(), getActiveCategoryIds()])
      .then(([cats, { categoryIds, hasUncategorized: uncategorized }]) => {
        setCategories(cats)
        setActiveCategoryIds(categoryIds)
        setHasUncategorized(uncategorized)
      })
      .catch(() => {})
      .finally(() => setCatLoading(false))
  }, [])

  // Global price list — drives slider bounds, chip counts and live preview.
  useEffect(() => {
    if (regionId === undefined) return
    let cancelled = false
    getCatalogPriceItems(regionId ?? undefined)
      .then((items) => { if (!cancelled) setPriceItems(items) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [regionId])

  const rootCategories = useMemo(
    () =>
      filterEmptyCategories(
        categories.filter((c) => c.parent_category_id === null),
        activeCategoryIds
      ),
    [categories, activeCategoryIds]
  )

  const prices = useMemo(() => priceItems.map((i) => i.price), [priceItems])
  // Fixed bounds: [0, PRICE_INFINITY] where PRICE_INFINITY is the ∞ sentinel.
  const priceBounds = useMemo<[number, number]>(() => [0, PRICE_INFINITY], [])
  const appliedRange = useMemo<[number, number]>(
    () => priceRange ?? priceBounds,
    [priceRange, priceBounds]
  )
  const priceFilterActive =
    priceItems.length > 0 &&
    (appliedRange[0] !== priceBounds[0] || appliedRange[1] !== priceBounds[1])

  // Map every category id (root + descendants) to its root id.
  const rootIdByCat = useMemo(() => {
    const m = new Map<string, string>()
    for (const root of categories.filter((c) => c.parent_category_id === null)) {
      for (const id of collectDescendantIds(root)) m.set(id, root.id)
    }
    return m
  }, [categories])

  // Per-root + uncategorized counts of products within the applied range.
  const appliedStats = useMemo(() => {
    const byRoot = new Map<string, number>()
    let other = 0
    let total = 0
    const [lo, hi] = appliedRange
    for (const it of priceItems) {
      if (it.price < lo || it.price > hi) continue
      total++
      const roots = new Set<string>()
      for (const cid of it.categoryIds) {
        const r = rootIdByCat.get(cid)
        if (r) roots.add(r)
      }
      if (roots.size === 0) other++
      else roots.forEach((r) => byRoot.set(r, (byRoot.get(r) ?? 0) + 1))
    }
    return { byRoot, other, total }
  }, [priceItems, rootIdByCat, appliedRange])

  const visibleRootIds = useMemo(() => {
    if (!priceFilterActive) return null
    const ids = new Set<string>()
    appliedStats.byRoot.forEach((n, id) => { if (n > 0) ids.add(id) })
    if (appliedStats.other > 0) ids.add(OTHER_CATEGORY.id)
    return ids
  }, [priceFilterActive, appliedStats])

  const countFor = (cat: MedusaCategory) =>
    cat.id === OTHER_CATEGORY.id ? appliedStats.other : appliedStats.byRoot.get(cat.id) ?? 0

  const navCategories = useMemo(() => {
    const base = [...rootCategories, ...(hasUncategorized ? [OTHER_CATEGORY] : [])]
    if (!priceFilterActive) return base
    return base.filter((cat) => countFor(cat) > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootCategories, hasUncategorized, priceFilterActive, appliedStats])

  const hasAnyCategory = rootCategories.length > 0 || hasUncategorized
  const showCounts = priceItems.length > 0

  // Scroll-spy: highlight the chip for the section currently in view
  useEffect(() => {
    if (activeSearch || navCategories.length === 0) return

    const THRESHOLD = HEADER_H + CATBAR_H + 24
    let rafId: number | null = null

    const compute = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        let cur: string | null = null
        for (const cat of navCategories) {
          const el = document.getElementById(`category-${cat.handle}`)
          if (el && el.getBoundingClientRect().top <= THRESHOLD) {
            cur = cat.id
          }
        }
        const doc = document.documentElement
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
          cur = navCategories[navCategories.length - 1].id
        }
        setActiveCatId(cur)
      })
    }

    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    compute()
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [activeSearch, navCategories])

  const scrollToCategory = useCallback((handle: string) => {
    const el = document.getElementById(`category-${handle}`)
    if (!el) return
    const offset = HEADER_H + CATBAR_H - 2
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  // On route change scroll to the target category — unless we're restoring an
  // exact scroll position, which takes precedence.
  useEffect(() => {
    if (restoreState) return
    if (!categoryHandle || categories.length === 0) return
    const id = requestAnimationFrame(() => scrollToCategory(categoryHandle))
    return () => cancelAnimationFrame(id)
  }, [categoryHandle, categories, scrollToCategory, restoreState])

  const handleSearchSubmit = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setActiveSearch(trimmed)
    navigate(`/catalog?q=${encodeURIComponent(trimmed)}`)
  }

  const handleBackToCategories = () => {
    setInputQuery('')
    setActiveSearch('')
    navigate('/catalog')
  }

  const handleSelectCategory = (cat: MedusaCategory) => {
    setInputQuery('')
    setActiveSearch('')
    navigate(`/catalog/${encodeURIComponent(cat.handle)}`)
  }

  return (
    <div className="layout">
      <AppHeader
        scrolled={scrolled}
        searchValue={inputQuery}
        onSearchChange={setInputQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <div className="edt-page">
        {/* Hero */}
        <div className="edt-hero-wrap">
          <div className="edt-wrap">
            <div className="edt-hero-kicker">Механические клавиатуры · Ташкент</div>
            <h1 className="edt-hero-mark">Klavisha<b>.</b></h1>
            <div className="edt-hero-row">
              <p className="edt-hero-tag">
                Клавиатуры, кейкапы, свитчи и аксессуары — всё для сборки клавиатуры вашей мечты.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky category chips + filter */}
        {!catLoading && hasAnyCategory && (
          <div className="edt-catbar">
            <div className="edt-wrap edt-catbar-in">
              <nav className="edt-cat-chips" aria-label="Категории">
                {navCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`edt-chip${activeCatId === cat.id ? ' edt-chip--on' : ''}`}
                    onClick={() => scrollToCategory(cat.handle)}
                  >
                    {cat.name}
                    {showCounts && <span className="edt-chip__n">{countFor(cat)}</span>}
                  </button>
                ))}
              </nav>
              {priceItems.length > 0 && (
                <CatalogFilter
                  priceBounds={priceBounds}
                  range={appliedRange}
                  sort={sort}
                  prices={prices}
                  onApply={(s, r) => { setSort(s); setPriceRange(r) }}
                />
              )}
            </div>
          </div>
        )}

        {/* Product sections */}
        <div className="edt-catalog-body">
          <div className="edt-wrap">
            {/* Search indicator — shown above sections when a query is active */}
            {activeSearch && (
              <div className="edt-search-banner">
                <span className="edt-search-banner__label">Результаты поиска</span>
                <span className="edt-search-banner__query">«{activeSearch}»</span>
                <button
                  className="edt-search-banner__clear"
                  onClick={handleBackToCategories}
                  aria-label="Очистить поиск"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {!catLoading && !activeSearch && priceFilterActive && appliedStats.total === 0 ? (
              <div className="edt-empty">
                <div className="edt-empty__t">Нет товаров в выбранном диапазоне</div>
                <div className="edt-empty__s">Попробуйте расширить диапазон цен.</div>
              </div>
            ) : !catLoading ? (
              <AllCategoriesView
                categories={categories}
                regionId={regionId}
                favorites={favoriteIds}
                onToggleFavorite={(product) => toggleFavorite({
                  productId: product.id,
                  productHandle: product.handle!,
                })}
                activeCategoryIds={activeCategoryIds}
                hasUncategorized={hasUncategorized}
                sort={sort}
                priceRange={priceFilterActive ? appliedRange : null}
                visibleRootIds={visibleRootIds}
                q={activeSearch || undefined}
              />
            ) : (
              <div className="edt-grid" style={{ marginTop: 54 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="product-skeleton" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
