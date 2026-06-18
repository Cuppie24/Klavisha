import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { type MedusaProduct, listProducts, getDefaultRegion } from '../lib/medusa'
import { useFavoritesContext } from '../context/FavoritesContext'
import { ProductCard } from '../components/ProductCard'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite } = useFavoritesContext()

  // Фиксируем список ID при открытии страницы —
  // товары не исчезают при снятии избранного на этой странице
  const snapshotRef = useRef<string[]>(favorites)
  const snapshot = snapshotRef.current   // стабильная ссылка, не меняется

  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regionId, setRegionId] = useState<string | undefined>(undefined)
  const [scrolled, setScrolled] = useState(false)
  const [searchInput, setSearchInput] = useState('')


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getDefaultRegion()
      .then((r) => setRegionId(r?.id))
      .catch(() => setRegionId(undefined))
  }, [])

  // Загружаем один раз по snapshot + regionId
  useEffect(() => {
    if (snapshot.length === 0) {
      setProducts([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    listProducts({ id: snapshot, regionId, limit: 100 })
      .then(({ products: p }) => {
        if (!cancelled) setProducts(p)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message ?? 'Ошибка загрузки товаров')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [regionId]) // snapshot стабилен — не нужен в зависимостях

  // Для сердечка используем живые favorites (filled/unfilled актуально)
  const favSet = useMemo(() => new Set(favorites), [favorites])

  // Порядок карточек — по snapshot, не по живым favorites
  const orderedProducts = useMemo(
    () => snapshot.map((id) => products.find((p) => p.id === id)).filter(Boolean) as MedusaProduct[],
    [products] // snapshot стабилен
  )


  const count = orderedProducts.length
  const pluralize = (n: number) =>
    n === 1 ? 'товар' : n >= 2 && n <= 4 ? 'товара' : 'товаров'

  return (
    <div className="layout">
      <AppHeader
        scrolled={scrolled}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(q) => {
          if (q.trim()) navigate(`/catalog?q=${encodeURIComponent(q.trim())}`)
        }}
      />

      <main className="main" id="favorites">
        {/* Breadcrumbs */}
        <div className="catalog-page-header">
          <nav className="catalog-breadcrumb" aria-label="Навигация">
            <button className="catalog-breadcrumb__link" onClick={() => navigate('/')}>Главная</button>
            <ChevronDown size={11} strokeWidth={2} className="catalog-breadcrumb__sep" />
            <span className="catalog-breadcrumb__current">Избранное</span>
          </nav>
          <div className="catalog-title-row">
            <h1 className="catalog-title">Избранное</h1>
            {!loading && !error && count > 0 && (
              <span className="catalog-count-badge">{count} {pluralize(count)}</span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="fav-page__loading">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-card-skeleton" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="fav-page__empty">
            <p className="fav-page__empty-title">Ошибка загрузки</p>
            <span className="fav-page__empty-sub">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && snapshot.length === 0 && (
          <div className="fav-page__empty">
            <svg viewBox="0 0 24 24" fill="none" width="48" height="48" aria-hidden="true" className="fav-page__empty-icon">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="fav-page__empty-title">Здесь пока ничего нет</p>
            <span className="fav-page__empty-sub">
              Нажмите&nbsp;♥ на карточке товара, чтобы добавить в избранное
            </span>
            <button className="fav-page__empty-btn" onClick={() => navigate('/catalog')}>
              Перейти в каталог
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && orderedProducts.length > 0 && (
          <div className="products-grid">
            {orderedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favSet.has(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}

                onCardClick={() => navigate(`/product/${product.handle}`)}
              />
            ))}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
