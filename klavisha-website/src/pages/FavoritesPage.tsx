import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import {
  type MedusaProduct,
  listProducts,
  getDefaultRegion,
  formatPrice,
  getCheapestPrice,
  isVariantInStock,
} from '../lib/medusa'
import { type FavoriteItem } from '../hooks/useFavorites'
import { useFavoritesContext } from '../context/FavoritesContext'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'

interface FavCard {
  item: FavoriteItem
  product: MedusaProduct
  image: string | null
  subtitle: string | null
}

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, isFavorite } = useFavoritesContext()

  // Snapshot at mount — removed items stay visible until page refresh
  const snapshotRef = useRef<FavoriteItem[]>(favorites)
  const snapshot = snapshotRef.current

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

  useEffect(() => {
    if (snapshot.length === 0) {
      setProducts([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    listProducts({ id: snapshot.map((f) => f.productId), regionId, limit: 100 })
      .then(({ products: p }) => { if (!cancelled) setProducts(p) })
      .catch((err: Error) => { if (!cancelled) setError(err.message ?? 'Ошибка загрузки') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [regionId]) // snapshot is stable

  // Build display cards preserving snapshot order, resolving variant data from fetched products
  const cards = useMemo<FavCard[]>(() => {
    return snapshot
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return null
        const variant = item.variantId
          ? (product.variants?.find((v) => v.id === item.variantId) ?? null)
          : null
        const image = variant?.images?.[0]?.url ?? product.thumbnail ?? null
        const subtitle = variant?.title ?? null
        return { item, product, image, subtitle } satisfies FavCard
      })
      .filter(Boolean) as FavCard[]
  }, [products]) // snapshot is stable

  const count = cards.length
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

      <div className="edt-page edt-page--favorites">
        {/* Hero */}
        <div className="edt-hero-wrap">
          <div className="edt-wrap">
            <div className="edt-hero-kicker">Избранные товары</div>
            <h1 className="edt-hero-mark">
              Избранное<b>.</b>
            </h1>
            <div className="edt-hero-row">
              {!loading && !error && count > 0 ? (
                <p className="edt-hero-tag">
                  {count} {pluralize(count)} в вашем списке избранного.
                </p>
              ) : (
                <p className="edt-hero-tag">
                  Товары, которые вы отметили сердечком.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Catalog body */}
        <div className="edt-catalog-body">
          <div className="edt-wrap">

            {/* Skeleton */}
            {loading && (
              <div className="edt-grid" style={{ marginTop: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="product-skeleton" />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="edt-empty">
                <div className="edt-empty__t">Ошибка загрузки</div>
                <div className="edt-empty__s">{error}</div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && snapshot.length === 0 && (
              <div className="edt-empty">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48" aria-hidden="true" style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: 8 }}>
                  <path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="edt-empty__t">Здесь пока ничего нет</div>
                <div className="edt-empty__s">
                  Нажмите&nbsp;♥ на карточке товара, чтобы добавить в избранное
                </div>
                <button className="fav-page__empty-btn" onClick={() => navigate('/catalog')}>
                  Перейти в каталог
                </button>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && cards.length > 0 && (
              <div className="edt-grid" style={{ marginTop: 8 }}>
                {cards.map(({ item, product, image, subtitle }) => {
                  const variant = item.variantId
                    ? (product.variants?.find((v) => v.id === item.variantId) ?? null)
                    : null
                  const variantPrice = variant?.calculated_price
                  const price = variantPrice
                    ? {
                        calculated: variantPrice.calculated_amount,
                        original: variantPrice.original_amount,
                        currency: variantPrice.currency_code,
                        isOnSale: variantPrice.calculated_amount < variantPrice.original_amount,
                      }
                    : getCheapestPrice(product)
                  const inStock = variant
                    ? isVariantInStock(variant)
                    : product.variants?.some(isVariantInStock) ?? false
                  const fav = isFavorite(product.id)
                  const href = item.variantId
                    ? `/product/${item.productHandle}?variant=${item.variantId}`
                    : `/product/${item.productHandle}`

                  return (
                    <article
                      key={item.productId}
                      className={`edt-card${!inStock ? ' edt-card--soldout' : ''}`}
                      onClick={() => navigate(href)}
                    >
                      <div className="edt-imgwrap">
                        {!inStock && <span className="edt-soldtag">Нет в наличии</span>}

                        <button
                          className={`edt-heart${fav ? ' edt-heart--on' : ''}`}
                          aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(item)
                          }}
                        >
                          <Heart size={17} strokeWidth={1.8} fill={fav ? 'currentColor' : 'none'} />
                        </button>

                        {image ? (
                          <img className="edt-img" src={image} alt={product.title} />
                        ) : (
                          <div className="edt-img-placeholder" />
                        )}
                      </div>

                      <div className="edt-meta">
                        <div className="edt-m-row">
                          <div className="edt-m-name">
                            {product.title}
                            {subtitle && (
                              <span className="edt-m-variant">{subtitle}</span>
                            )}
                          </div>
                          <div className={`edt-m-price${price?.isOnSale ? ' edt-m-price--sale' : ''}`}>
                            {price?.isOnSale && (
                              <span className="edt-m-orig">
                                {formatPrice(price.original, price.currency)}
                              </span>
                            )}
                            {price ? formatPrice(price.calculated, price.currency) : '—'}
                          </div>
                        </div>

                        <div className="edt-m-sub">
                          <span className={`edt-m-stock${inStock ? ' edt-m-stock--ok' : ' edt-m-stock--off'}`}>
                            <span className="edt-m-sd" />
                            {inStock ? 'В наличии' : 'Нет в наличии'}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}
