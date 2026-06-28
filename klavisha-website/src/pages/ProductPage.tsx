import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  type MedusaProduct,
  type MedusaProductVariant,
  getProduct,
  getDefaultRegion,
  listCategories,
  listProducts,
  formatPrice,
  getCheapestPrice,
  isVariantInStock,
  getVariantStock,
} from '../lib/medusa'
import { loadLatestCatalogView } from '../lib/catalogState'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'
import { useFavoritesContext } from '../context/FavoritesContext'
import { useCartContext } from '../context/CartContext'


export function ProductPage() {
  const { productHandle } = useParams<{ productHandle: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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

  const [thumbsEdge, setThumbsEdge] = useState({ start: true, end: true })
  const [imgScrolledOut, setImgScrolledOut] = useState(false)

  const uniqueImagesRef = useRef<string[]>([])
  const thumbsRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const [stockMsg, setStockMsg] = useState<string | null>(null)
  const stockMsgTimer = useRef<number | undefined>(undefined)

  const { toggleFavorite, isFavorite } = useFavoritesContext()
  const { cart, addToCart, updateItem, removeItem, loading: cartLoading } = useCartContext()

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
    const variantParam = searchParams.get('variant')
    getProduct(productHandle, regionId)
      .then((p) => {
        setProduct(p)
        if (p?.variants?.length) {
          const initialVariant =
            (variantParam ? p.variants.find((v) => v.id === variantParam) : null) ??
            p.variants.find(isVariantInStock) ??
            p.variants[0]
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

  // Sync activeImage from embla swipe
  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return
    setActiveImage(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onEmblaSelect)
    return () => { emblaApi.off('select', onEmblaSelect) }
  }, [emblaApi, onEmblaSelect])

  // Reinit + jump to first slide when product/variant images change
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit()
    emblaApi.scrollTo(0, true)
  }, [emblaApi, product?.id, selectedVariant?.id])

  // Thumb strip edge detection (for gradient + arrows)
  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return
    const update = () => setThumbsEdge({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [product?.id, selectedVariant?.id])

  const scrollThumbsBy = (dir: 1 | -1) => {
    thumbsRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }

  // Drag-to-scroll with momentum on thumb strip
  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return
    let startX = 0
    let scrollLeft = 0
    let dragging = false
    let velX = 0
    let lastX = 0
    let rafId = 0

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      cancelAnimationFrame(rafId)
      dragging = true
      isDraggingRef.current = false
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
      lastX = e.pageX
      velX = 0
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      velX = e.pageX - lastX
      lastX = e.pageX
      const dx = e.pageX - el.offsetLeft - startX
      if (Math.abs(dx) > 4) isDraggingRef.current = true
      el.scrollLeft = scrollLeft - dx
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      el.style.cursor = ''
      // keep isDraggingRef true until after click fires, then clear
      setTimeout(() => { isDraggingRef.current = false }, 0)
      const glide = () => {
        if (Math.abs(velX) < 0.5) return
        el.scrollLeft -= velX
        velX *= 0.9
        rafId = requestAnimationFrame(glide)
      }
      glide()
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [product?.id])

  // Show mobile sticky bar once the price block has scrolled behind the header
  useEffect(() => {
    if (!product?.id) return
    const HEADER_H = 64
    const check = () => {
      const el = galleryRef.current
      setImgScrolledOut(el ? el.getBoundingClientRect().bottom <= HEADER_H : false)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [product?.id])

  // Reset qty + stock message when variant changes
  useEffect(() => { setQty(1); setStockMsg(null) }, [selectedVariant?.id])

  useEffect(() => () => window.clearTimeout(stockMsgTimer.current), [])

  // Доступный запас выбранного варианта (null = не ограничено)
  const maxStock = selectedVariant ? getVariantStock(selectedVariant) : null

  // Этот вариант уже в корзине?
  const cartItem = selectedVariant
    ? cart?.items?.find((i) => i.variant?.id === selectedVariant.id) ?? null
    : null

  const flashStock = useCallback((msg: string) => {
    setStockMsg(msg)
    window.clearTimeout(stockMsgTimer.current)
    stockMsgTimer.current = window.setTimeout(() => setStockMsg(null), 2600)
  }, [])

  // Ограничить вводимое количество доступным запасом
  const clampQty = (raw: number): number => {
    let n = Math.max(1, Number.isFinite(raw) ? raw : 1)
    if (maxStock != null && n > maxStock) {
      n = maxStock
      flashStock(`Доступно только ${maxStock} шт.`)
    }
    return n
  }

  const incQty = () => {
    if (maxStock != null && qty >= maxStock) {
      flashStock(`Доступно только ${maxStock} шт.`)
      return
    }
    setQty((q) => q + 1)
  }

  const handleAddToCart = async () => {
    if (!inStock || !selectedVariant?.id) return
    if (addingToCart) return
    setAddingToCart(true)
    try {
      await addToCart(selectedVariant.id, clampQty(qty))
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {
      // silent fail
    } finally {
      setAddingToCart(false)
    }
  }

  // Изменить количество уже добавленного в корзину варианта
  const handleCartQty = async (next: number) => {
    if (!cartItem || cartLoading) return
    if (next < 1) { await removeItem(cartItem.id); return }
    if (maxStock != null && next > maxStock) {
      flashStock(`Доступно только ${maxStock} шт.`)
      return
    }
    await updateItem(cartItem.id, next)
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

  useEffect(() => { setActiveImage(0); emblaApi?.scrollTo(0, true) }, [emblaApi, selectedVariant?.id])

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

  // Return to the catalog at the exact place the user left it (path + filters
  // + scroll). Falls back to the catalog top if there's no saved snapshot.
  const handleBackToCatalog = useCallback(() => {
    const saved = loadLatestCatalogView()
    navigate(saved?.path ?? '/catalog', saved ? { state: { restore: saved } } : undefined)
  }, [navigate])

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
              <button className="pp-back-link" onClick={handleBackToCatalog}>
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
        {/* Mobile sticky top bar – appears when gallery scrolls out of view */}
        <div className={`pp-edt-mob-stickybar${imgScrolledOut ? ' pp-edt-mob-stickybar--vis' : ''}`}>
          <button className="pp-edt-mob-sb-btn" onClick={handleBackToCatalog} aria-label="Назад">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="pp-edt-mob-sb-price">
            {price ? formatPrice(price.calculated, price.currency) : ''}
            {price?.isOnSale && (price as any).discountPercent > 0 && (
              <span className="pp-edt-mob-sb-discount">−{(price as any).discountPercent}%</span>
            )}
          </span>
          <button
            className={`pp-edt-mob-sb-btn${productIsFavorite ? ' pp-edt-mob-sb-btn--fav' : ''}`}
            onClick={() => toggleFavorite({ productId: product.id, productHandle: product.handle!, variantId: selectedVariant?.id })}
            aria-label={productIsFavorite ? 'Убрать из избранного' : 'В избранное'}
          >
            <Heart size={18} strokeWidth={1.8} fill={productIsFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="pp-edt-wrap">
          <button className="pp-edt-back" onClick={handleBackToCatalog}>
            <ChevronLeft size={16} strokeWidth={2.2} />
            Назад к каталогу
          </button>

          <div className="pp-edt-pdp">

            {/* ── Gallery ── */}
            <div className="pp-edt-gallery">
              <div
                className="pp-edt-g-main"
                onClick={() => uniqueImages.length > 0 && setLightboxOpen(true)}
                style={{ cursor: uniqueImages.length > 0 ? 'zoom-in' : 'default' }}
              >
                {!inStock && <span className="pp-edt-g-soldtag">Нет в наличии</span>}
                {uniqueImages.length > 0 ? (
                  <div className="pp-edt-g-embla" ref={emblaRef}>
                    <div className="pp-edt-g-embla-container">
                      {uniqueImages.map((url, i) => (
                        <div key={url + i} className="pp-edt-g-embla-slide">
                          <img className="pp-edt-g-img" src={url} alt={product.title} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pp-edt-g-placeholder" />
                )}
                {uniqueImages.length > 0 && (
                  <span className="pp-edt-g-cap">/ {String(activeImage + 1).padStart(2, '0')}</span>
                )}
              </div>

              {/* Mobile overlay buttons – fixed positioning so no ancestor overflow clips them */}
              <button
                className={`pp-edt-g-mobbtn pp-edt-g-mobbtn--back${imgScrolledOut ? ' pp-edt-g-mobbtn--gone' : ''}`}
                onClick={handleBackToCatalog}
                aria-label="Назад"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                className={`pp-edt-g-mobbtn pp-edt-g-mobbtn--fav${productIsFavorite ? ' pp-edt-g-mobbtn--fav-on' : ''}${imgScrolledOut ? ' pp-edt-g-mobbtn--gone' : ''}`}
                onClick={() => toggleFavorite({ productId: product.id, productHandle: product.handle!, variantId: selectedVariant?.id })}
                aria-label={productIsFavorite ? 'Убрать из избранного' : 'В избранное'}
              >
                <Heart size={18} strokeWidth={1.8} fill={productIsFavorite ? 'currentColor' : 'none'} />
              </button>

              {uniqueImages.length >= 2 && (
                <div className="pp-edt-g-thumbs-track">
                  <div
                    className={[
                      'pp-edt-g-thumbs',
                      thumbsEdge.start && 'pp-edt-g-thumbs--start',
                      thumbsEdge.end && 'pp-edt-g-thumbs--end',
                    ].filter(Boolean).join(' ')}
                    ref={thumbsRef}
                  >
                    {uniqueImages.map((url, i) => (
                      <button
                        key={i}
                        className={`pp-edt-g-thumb${activeImage === i ? ' pp-edt-g-thumb--on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); if (isDraggingRef.current) return; emblaApi ? emblaApi.scrollTo(i) : setActiveImage(i) }}
                        aria-label={`Фото ${i + 1}`}
                      >
                        <img src={url} alt="" draggable={false} loading="lazy" decoding="async" />
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </button>
                    ))}
                  </div>
                  {!thumbsEdge.start && (
                    <button className="pp-edt-g-tharrow pp-edt-g-tharrow--l" onClick={() => scrollThumbsBy(-1)} aria-label="Назад">
                      <ChevronLeft size={14} strokeWidth={2.5} />
                    </button>
                  )}
                  {!thumbsEdge.end && (
                    <button className="pp-edt-g-tharrow pp-edt-g-tharrow--r" onClick={() => scrollThumbsBy(1)} aria-label="Вперёд">
                      <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="pp-edt-info">

              {/* Breadcrumb */}
              <div className="pp-edt-crumb">
                <button onClick={handleBackToCatalog}>Каталог</button>
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
                  {inStock
                    ? (maxStock != null && maxStock < 5
                        ? (maxStock === 1
                            ? 'Остался 1 в наличии'
                            : `Осталось ${maxStock} в наличии`)
                        : 'В наличии')
                    : 'Нет в наличии'}
                </span>
              </div>

              {/* Price block */}
              <div className="pp-edt-priceblock" ref={galleryRef}>
                {price ? (
                  <>
                    <div className="pp-edt-price-main">
                      <span className="pp-edt-price-big">{formatPrice(price.calculated, price.currency)}</span>
                      {price.isOnSale && (price as any).discountPercent > 0 && (
                        <span className="pp-edt-price-discount">−{(price as any).discountPercent}%</span>
                      )}
                    </div>
                    {price.isOnSale && (
                      <span className="pp-edt-price-orig">{formatPrice(price.original, price.currency)}</span>
                    )}
                  </>
                ) : (
                  <span className="pp-edt-price-big">Цена по запросу</span>
                )}
              </div>

              {/* Options */}
              {product.options?.map((option) => {
                const uniqueValues = [...new Set(option.values?.map((v) => v.value) ?? [])]
                if (uniqueValues.length <= 1) return null
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
                              !available ? 'pp-edt-opt-btn--na' : '',
                            ].filter(Boolean).join(' ')}
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
              <div className="pp-edt-opt pp-edt-opt--buy">
                <div className="pp-edt-opt-label">
                  {cartItem ? 'В корзине' : 'Количество'}
                </div>
                <div className="pp-edt-buyrow">
                  {cartItem && inStock ? (
                    <>
                      <div className={`pp-edt-qty${cartLoading ? ' pp-edt-qty--busy' : ''}`}>
                        <button type="button" onClick={() => handleCartQty(cartItem.quantity - 1)} disabled={cartLoading} aria-label="Уменьшить">−</button>
                        <input
                          type="number"
                          value={cartItem.quantity}
                          min={1}
                          onChange={(e) => handleCartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          aria-label="Количество в корзине"
                        />
                        <button type="button" onClick={() => handleCartQty(cartItem.quantity + 1)} disabled={cartLoading} aria-label="Увеличить">+</button>
                      </div>
                      <button
                        type="button"
                        className="pp-edt-btn-cart pp-edt-btn-cart--incart"
                        onClick={() => navigate('/cart')}
                      >
                        <ShoppingCart size={17} strokeWidth={1.8} />
                        Перейти
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="pp-edt-qty">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Уменьшить">−</button>
                        <input
                          type="number"
                          value={qty}
                          min={1}
                          max={maxStock ?? undefined}
                          onChange={(e) => setQty(clampQty(parseInt(e.target.value, 10)))}
                          aria-label="Количество"
                        />
                        <button type="button" onClick={incQty} aria-label="Увеличить">+</button>
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
                    </>
                  )}
                  <button
                    type="button"
                    className={`pp-edt-btn-fav${productIsFavorite ? ' pp-edt-btn-fav--on' : ''}`}
                    aria-label={productIsFavorite ? 'Убрать из избранного' : 'В избранное'}
                    onClick={() => toggleFavorite({
                      productId: product.id,
                      productHandle: product.handle!,
                      variantId: selectedVariant?.id,
                    })}
                  >
                    <Heart size={20} strokeWidth={1.8} fill={productIsFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                {stockMsg && <div className="pp-edt-stock-msg">{stockMsg}</div>}
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

        {/* Mobile sticky cart bar */}
        <div className="pp-edt-mob-cartbar">
          {cartItem && inStock ? (
            <>
              <div className={`pp-edt-qty${cartLoading ? ' pp-edt-qty--busy' : ''}`}>
                <button type="button" onClick={() => handleCartQty(cartItem.quantity - 1)} disabled={cartLoading} aria-label="Уменьшить">−</button>
                <input
                  type="number"
                  value={cartItem.quantity}
                  min={1}
                  onChange={(e) => handleCartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  aria-label="Количество в корзине"
                />
                <button type="button" onClick={() => handleCartQty(cartItem.quantity + 1)} disabled={cartLoading} aria-label="Увеличить">+</button>
              </div>
              <button
                type="button"
                className="pp-edt-btn-cart pp-edt-btn-cart--incart"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart size={18} strokeWidth={2} />
                Перейти
              </button>
            </>
          ) : (
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
                  : <>{price ? <>В корзину<span className="pp-edt-cart-tot"> · {formatPrice(price.calculated, price.currency)}</span></> : 'В корзину'}</>
              }
            </button>
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
