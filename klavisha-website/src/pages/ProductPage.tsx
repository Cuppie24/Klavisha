import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Heart } from 'lucide-react'
import {
  type MedusaProduct,
  type MedusaProductVariant,
  getProduct,
  getDefaultRegion,
  listCategories,
  listProducts,
  addToCart,
  formatPrice,
  getCheapestPrice,
  isVariantInStock,
} from '../lib/medusa'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'
import { useFavoritesContext } from '../context/FavoritesContext'


export function ProductPage() {
  const { productHandle } = useParams<{ productHandle: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<MedusaProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regionId, setRegionId] = useState<string | undefined>(undefined)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<MedusaProductVariant | null>(null)
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({})
  const [scrolled, setScrolled] = useState(false)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<MedusaProduct[]>([])
  const [categoryName, setCategoryName] = useState('')

  const uniqueImagesRef = useRef<string[]>([])

  const { toggleFavorite, isFavorite } = useFavoritesContext()

  useEffect(() => { window.scrollTo(0, 0) }, [])

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
    if (!productHandle) return
    setLoading(true)
    setError(null)
    setActiveImage(0)
    setRelatedProducts([])
    setCategoryName('')
    getProduct(productHandle, regionId)
      .then((p) => {
        setProduct(p)
        if (p?.variants?.length) {
          const initialVariant = p.variants.find(isVariantInStock) ?? p.variants[0]
          setSelectedVariant(initialVariant)
          const initial: Record<string, string> = {}
          p.options?.forEach((opt) => {
            const fromVariant = initialVariant?.options?.find(
              (vo) => (vo as any).option_id === opt.id || opt.values?.some((pov) => pov.value === vo.value)
            )?.value
            const val = fromVariant ?? opt.values?.[0]?.value
            if (val) initial[opt.id] = val
          })
          setSelectedOptionValues(initial)
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [productHandle, regionId])

  // Load category name
  useEffect(() => {
    const catId = product?.categories?.[0]?.id
    if (!catId) return
    let cancelled = false
    listCategories().then((cats) => {
      if (!cancelled) {
        const found = cats.find((c) => c.id === catId)
        if (found) setCategoryName(found.name)
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [product?.categories?.[0]?.id])

  // Load related products
  useEffect(() => {
    const catId = product?.categories?.[0]?.id
    const prodId = product?.id
    if (!catId || !prodId || regionId === undefined) return
    let cancelled = false
    listProducts({ categoryId: catId, regionId: regionId ?? undefined, limit: 5 })
      .then(({ products: p }) => {
        if (!cancelled) {
          setRelatedProducts(p.filter((rp) => rp.id !== prodId).slice(0, 4))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [product?.id, product?.categories?.[0]?.id, regionId])

  // Lightbox keyboard
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setActiveImage((i) => Math.min(i + 1, uniqueImagesRef.current.length - 1))
      if (e.key === 'ArrowLeft') setActiveImage((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen])

  // Reset qty when variant changes
  useEffect(() => { setQty(1) }, [selectedVariant?.id])

  const handleAddToCart = async () => {
    if (!inStock || !selectedVariant?.id || !regionId) return
    if (addingToCart) return
    setAddingToCart(true)
    try {
      await addToCart(regionId, selectedVariant.id, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {
      // silent fail
    } finally {
      setAddingToCart(false)
    }
  }

  const uniqueImages = (() => {
    if (!product) return []
    if (selectedVariant?.images?.length) {
      return [...new Set(selectedVariant.images.map((i) => i.url))]
    }
    const allImages = [product.thumbnail, ...(product.images?.map((i) => i.url) ?? [])]
      .filter(Boolean) as string[]
    return [...new Set(allImages)]
  })()
  uniqueImagesRef.current = uniqueImages

  useEffect(() => { setActiveImage(0) }, [selectedVariant?.id])

  const variantPrice = selectedVariant?.calculated_price
  const price = variantPrice
    ? {
        calculated: variantPrice.calculated_amount,
        original: variantPrice.original_amount,
        currency: variantPrice.currency_code,
        isOnSale: variantPrice.calculated_amount < variantPrice.original_amount,
        discountPercent: variantPrice.calculated_amount < variantPrice.original_amount
          ? Math.round(((variantPrice.original_amount - variantPrice.calculated_amount) / variantPrice.original_amount) * 100)
          : 0,
      }
    : product ? getCheapestPrice(product) : null

  const inStock = selectedVariant
    ? isVariantInStock(selectedVariant)
    : product?.variants?.some(isVariantInStock) ?? false

  const descriptionIsHtml = product?.description
    ? /<[a-z][\s\S]*>/i.test(product.description)
    : false

  const headerProps = {
    scrolled,
    searchValue: '',
    onSearchChange: () => {},
    onSearchSubmit: (q: string) => { if (q.trim()) navigate(`/catalog?q=${encodeURIComponent(q.trim())}`) },
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="layout">
        <AppHeader {...headerProps} />
        <div className="pp-edt-page">
          <div className="pp-edt-wrap">
            <div className="pp-edt-skel-pdp">
              <div className="pp-edt-skel-img" />
              <div style={{ paddingTop: 8 }}>
                <div className="pp-edt-skel-line" style={{ width: '40%', height: 13, marginBottom: 24 }} />
                <div className="pp-edt-skel-line" style={{ width: '80%', height: 48, marginBottom: 20 }} />
                <div className="pp-edt-skel-line" style={{ width: '55%', height: 14, marginBottom: 32 }} />
                <div className="pp-edt-skel-line" style={{ width: '100%', height: 40, marginBottom: 16 }} />
                <div className="pp-edt-skel-line" style={{ width: '100%', height: 56, marginBottom: 12 }} />
                <div className="pp-edt-skel-line" style={{ width: '100%', height: 56 }} />
              </div>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    )
  }

  // ── Error / not found ─────────────────────────────────────────────────────────

  if (error || !product) {
    return (
      <div className="layout">
        <AppHeader {...headerProps} />
        <div className="pp-edt-page">
          <div className="pp-edt-wrap">
            <div className="empty-state" style={{ padding: '80px 0' }}>
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__text">Товар не найден</p>
              <p className="empty-state__hint">{error ?? 'Возможно, он был удалён или ссылка устарела'}</p>
              <button className="pp-back-link" onClick={() => navigate('/catalog')}>
                Вернуться в каталог
              </button>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    )
  }

  const productIsFavorite = isFavorite(product.id)
  const catHandle = product.categories?.[0]?.handle

  // ── Product page ──────────────────────────────────────────────────────────────

  return (
    <div className="layout">
      <AppHeader {...headerProps} />

      <div className="pp-edt-page">
        <div className="pp-edt-wrap">
          <div className="pp-edt-pdp">

            {/* ── Gallery ── */}
            <div className="pp-edt-gallery">
              <div
                className="pp-edt-g-main"
                onClick={() => uniqueImages.length > 0 && setLightboxOpen(true)}
                style={{ cursor: uniqueImages.length > 0 ? 'zoom-in' : 'default' }}
              >
                {!inStock && <span className="pp-edt-g-soldtag">Нет в наличии</span>}
                {uniqueImages.length > 0
                  ? <img className="pp-edt-g-img" src={uniqueImages[activeImage]} alt={product.title} loading="eager" decoding="async" />
                  : <div className="pp-edt-g-placeholder" />
                }
                {uniqueImages.length > 0 && (
                  <span className="pp-edt-g-cap">/ {String(activeImage + 1).padStart(2, '0')}</span>
                )}
              </div>

              {uniqueImages.length >= 2 && (
                <div className="pp-edt-g-thumbs">
                  {uniqueImages.map((url, i) => (
                    <button
                      key={i}
                      className={`pp-edt-g-thumb${activeImage === i ? ' pp-edt-g-thumb--on' : ''}`}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Фото ${i + 1}`}
                    >
                      <img src={url} alt="" draggable={false} loading="lazy" decoding="async" />
                      <span>{String(i + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="pp-edt-info">

              {/* Breadcrumb */}
              <div className="pp-edt-crumb">
                <button onClick={() => navigate('/catalog')}>Каталог</button>
                {categoryName && (
                  <>
                    <ChevronRight size={12} strokeWidth={2} />
                    <button
                      className="pp-edt-crumb-neon"
                      onClick={() => navigate(catHandle ? `/catalog/${catHandle}` : '/catalog')}
                    >
                      {categoryName}
                    </button>
                  </>
                )}
              </div>

              <h1 className="pp-edt-name">{product.title}</h1>

              {/* Spec line */}
              <div className="pp-edt-specline">
                {product.collection && (
                  <span className="pp-edt-tag">{product.collection.title}</span>
                )}
                <span className={`pp-edt-stock${inStock ? ' pp-edt-stock--ok' : ' pp-edt-stock--off'}`}>
                  <span className="pp-edt-sd" />
                  {inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
                {price?.isOnSale && (price as any).discountPercent > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neon)', background: 'rgba(0,255,157,.1)', padding: '3px 10px', borderRadius: 100 }}>
                    −{(price as any).discountPercent}%
                  </span>
                )}
              </div>

              {/* Price block */}
              <div className="pp-edt-priceblock">
                {price ? (
                  <>
                    <span className="pp-edt-price-big">{formatPrice(price.calculated, price.currency)}</span>
                    {price.isOnSale && (
                      <span className="pp-edt-price-orig">{formatPrice(price.original, price.currency)}</span>
                    )}
                  </>
                ) : (
                  <span className="pp-edt-price-big">Цена по запросу</span>
                )}
                <span className="pp-edt-price-ship">
                  <span className="pp-edt-ship-dot" />
                  Бесплатная доставка
                </span>
              </div>

              {/* Options */}
              {product.options?.map((option) => {
                const uniqueValues = [...new Set(option.values?.map((v) => v.value) ?? [])]
                if (uniqueValues.length === 0) return null
                return (
                  <div key={option.id} className="pp-edt-opt">
                    <div className="pp-edt-opt-label">
                      {option.title}
                      <b>{selectedOptionValues[option.id] ?? ''}</b>
                    </div>
                    <div className="pp-edt-opt-values">
                      {uniqueValues.map((val) => {
                        const matchingVariant =
                          product.variants?.find((v) =>
                            v.options?.some((o) => (o as any).option_id === option.id && o.value === val)
                          ) ?? product.variants?.find((v) => v.title === val)
                        const isSelected = selectedOptionValues[option.id] === val
                        const available = matchingVariant ? isVariantInStock(matchingVariant) : true
                        return (
                          <button
                            key={val}
                            className={[
                              'pp-edt-opt-btn',
                              isSelected ? 'pp-edt-opt-btn--on' : '',
                            ].filter(Boolean).join(' ')}
                            disabled={!available}
                            onClick={() => {
                              setSelectedOptionValues((prev) => ({ ...prev, [option.id]: val }))
                              if (matchingVariant) setSelectedVariant(matchingVariant)
                            }}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Quantity + Add to cart */}
              <div className="pp-edt-opt">
                <div className="pp-edt-opt-label">Количество</div>
                <div className="pp-edt-buyrow">
                  <div className="pp-edt-qty">
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Уменьшить">−</button>
                    <input
                      type="number"
                      value={qty}
                      min={1}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      aria-label="Количество"
                    />
                    <button type="button" onClick={() => setQty(q => q + 1)} aria-label="Увеличить">+</button>
                  </div>
                  <button
                    type="button"
                    className={`pp-edt-btn-cart${!inStock ? ' pp-edt-btn-cart--sold' : added ? ' pp-edt-btn-cart--added' : ''}`}
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                  >
                    {!inStock
                      ? 'Нет в наличии'
                      : added
                        ? 'Добавлено ✓'
                        : <>{price ? <>В корзину<span className="pp-edt-cart-tot"> · {formatPrice(price.calculated * qty, price.currency)}</span></> : 'В корзину'}</>
                    }
                  </button>
                  <button
                    type="button"
                    className={`pp-edt-btn-fav${productIsFavorite ? ' pp-edt-btn-fav--on' : ''}`}
                    aria-label={productIsFavorite ? 'Убрать из избранного' : 'В избранное'}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart size={20} strokeWidth={1.8} fill={productIsFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Reassurance */}
              <div className="pp-edt-reassure">
                <span><span className="pp-edt-rdot" />Доставка 2–3 дня</span>
                <span><span className="pp-edt-rdot" />Возврат 30 дней</span>
                <span><span className="pp-edt-rdot" />Гарантия 2 года</span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="pp-edt-description">
                  <h3 className="pp-edt-desc-h">Описание</h3>
                  {descriptionIsHtml ? (
                    <div className="pp-edt-desc-body" dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="pp-edt-desc-body">{product.description}</p>
                  )}
                </div>
              )}

              {/* Specs */}
              {(product.material || product.weight || product.origin_country || product.collection) && (
                <div className="pp-edt-description">
                  <h3 className="pp-edt-desc-h">Характеристики</h3>
                  <dl className="pp-edt-specs">
                    {product.material && (<><dt>Материал</dt><dd>{product.material}</dd></>)}
                    {product.weight && (<><dt>Вес</dt><dd>{product.weight} г</dd></>)}
                    {product.origin_country && (<><dt>Страна</dt><dd>{product.origin_country.toUpperCase()}</dd></>)}
                    {product.collection && (<><dt>Коллекция</dt><dd>{product.collection.title}</dd></>)}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="pp-edt-related">
              <div className="pp-edt-related-head">
                <h3>Ещё в {categoryName || 'каталоге'}</h3>
                <button onClick={() => navigate(catHandle ? `/catalog/${catHandle}` : '/catalog')}>
                  Смотреть все →
                </button>
              </div>
              <div className="pp-edt-rel-grid">
                {relatedProducts.map((rp) => {
                  const rpPrice = getCheapestPrice(rp)
                  return (
                    <button
                      key={rp.id}
                      className="pp-edt-rel-card"
                      onClick={() => navigate(`/product/${rp.handle}`)}
                    >
                      <div className="pp-edt-rel-img">
                        {rp.thumbnail
                          ? <img src={rp.thumbnail} alt={rp.title} loading="lazy" decoding="async" />
                          : <div className="pp-edt-rel-img-placeholder" />
                        }
                      </div>
                      <div className="pp-edt-rel-meta">
                        <span className="pp-edt-rel-name">{rp.title}</span>
                        <span className="pp-edt-rel-price">
                          {rpPrice ? formatPrice(rpPrice.calculated, rpPrice.currency) : '—'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <AppFooter />

      {/* Lightbox */}
      {lightboxOpen && uniqueImages.length > 0 && (
        <div className="pp-edt-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="pp-edt-lb-close" aria-label="Закрыть">✕</button>
          <img
            src={uniqueImages[activeImage]}
            alt={product.title}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
          {uniqueImages.length > 1 && (
            <>
              <button
                className="pp-edt-lb-nav pp-edt-lb-prev"
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => Math.max(i - 1, 0)) }}
                aria-label="Предыдущее"
              >‹</button>
              <button
                className="pp-edt-lb-nav pp-edt-lb-next"
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => Math.min(i + 1, uniqueImages.length - 1)) }}
                aria-label="Следующее"
              >›</button>
              <div className="pp-edt-lb-counter">{activeImage + 1} / {uniqueImages.length}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
