import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type MedusaProduct,
  type MedusaCategory,
  listProducts,
  getCheapestPrice,
} from '../../lib/medusa'
import { collectDescendantIds } from '../CategoryTree'
import { ProductCard } from '../ProductCard'
import type { CatalogSort } from './CatalogFilter'

interface Props {
  category: MedusaCategory
  regionId: string | null | undefined
  favorites: string[]
  onToggleFavorite: (product: MedusaProduct) => void
  index?: number
  sort?: CatalogSort
  priceRange?: [number, number] | null
  q?: string
}

// Cache loaded product lists for the SPA session, keyed by category + region + query.
// Returning to the catalog (back button or in-app) then re-renders sections
// instantly at their full height — the prerequisite for restoring scroll
// position. Without this the page is empty on return and there's nothing to
// scroll to. Lives at module scope so it survives CatalogPage unmount.
const _sectionCache = new Map<string, MedusaProduct[]>()
const sectionKey = (categoryId: string, regionId: string | null | undefined, q?: string) =>
  `${categoryId}::${regionId ?? ''}::${q ?? ''}`

export function CategorySection({
  category,
  regionId,
  favorites,
  onToggleFavorite,
  index,
  sort = 'default',
  priceRange = null,
  q,
}: Props) {
  const navigate = useNavigate()
  const categoryRef = useRef(category)
  categoryRef.current = category
  const triggerRef = useRef<HTMLDivElement>(null)
  // Hydrate synchronously from the session cache so a returning catalog renders
  // at full height on the first paint (no lazy-load flash).
  const cached = _sectionCache.get(sectionKey(category.id, regionId, q))
  const [products, setProducts] = useState<MedusaProduct[]>(cached ?? [])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(cached !== undefined)
  const [error, setError] = useState<string | null>(null)

  const isLeaf = category.category_children.length === 0
  const isOther = category.id === '__other__'
  const isTopLevel = index !== undefined

  useEffect(() => {
    if (!isLeaf || fetched || regionId === undefined) return

    const ck = sectionKey(category.id, regionId, q)

    // Serve from cache without a network round-trip.
    const hit = _sectionCache.get(ck)
    if (hit !== undefined) {
      setProducts(hit)
      setFetched(true)
      return
    }

    const doFetch = () => {
      setLoading(true)
      setError(null)
      const cat = categoryRef.current
      const categoryId = isOther ? undefined : collectDescendantIds(cat)
      listProducts({ regionId: regionId ?? undefined, categoryId, q, limit: 100 })
        .then(({ products: p }) => {
          const filtered = isOther
            ? p.filter((prod) => !prod.categories || prod.categories.length === 0)
            : p
          _sectionCache.set(ck, filtered)
          setProducts(filtered)
          setFetched(true)
        })
        .catch((err: Error) => setError(err.message ?? 'Ошибка загрузки товаров'))
        .finally(() => setLoading(false))
    }

    // When a search query is active, fetch all sections immediately (no lazy load).
    if (q) {
      doFetch()
      return
    }

    const el = triggerRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          doFetch()
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [isLeaf, fetched, regionId, isOther, category.id, q])

  const favSet = useMemo(() => new Set(favorites), [favorites])

  // Apply the catalog filter (price range) + sort to loaded products.
  const visible = useMemo(() => {
    let arr = products
    if (priceRange) {
      const [lo, hi] = priceRange
      arr = arr.filter((p) => {
        const price = getCheapestPrice(p)?.calculated
        return price != null && price >= lo && price <= hi
      })
    }
    if (sort === 'asc') {
      arr = [...arr].sort(
        (a, b) => (getCheapestPrice(a)?.calculated ?? Infinity) - (getCheapestPrice(b)?.calculated ?? Infinity)
      )
    } else if (sort === 'desc') {
      arr = [...arr].sort(
        (a, b) => (getCheapestPrice(b)?.calculated ?? 0) - (getCheapestPrice(a)?.calculated ?? 0)
      )
    } else if (sort === 'az') {
      arr = [...arr].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ru'))
    }
    return arr
  }, [products, sort, priceRange])

  // Collapse leaf when price filter or search query yields nothing.
  if (isLeaf && fetched && !loading && !error && (priceRange || q) && visible.length === 0) {
    return null
  }

  const sectionHeader = isTopLevel ? (
    <div className="edt-sec-head">
      <div className="edt-sec-left">
        <span className="edt-sec-num">{String(index + 1).padStart(2, '0')}</span>
        <h2 className="edt-sec-title">{category.name}</h2>
        {fetched && visible.length > 0 && (
          <span className="edt-sec-count">{visible.length} товаров</span>
        )}
      </div>
    </div>
  ) : (
    <div className="edt-sub-title">
      {category.name}
      {fetched && visible.length > 0 && (
        <span className="edt-sec-count">{visible.length}</span>
      )}
    </div>
  )

  return (
    <section
      id={`category-${category.handle}`}
      className="edt-section"
    >
      {sectionHeader}

      {/* Parent: render children as sub-sections */}
      {!isLeaf && category.category_children.map((child) => (
        <CategorySection
          key={child.id}
          category={child}
          regionId={regionId}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          sort={sort}
          priceRange={priceRange}
          q={q}
        />
      ))}

      {/* Leaf: lazy-load products */}
      {isLeaf && (
        <>
          <div ref={triggerRef} className="cat-section__load-trigger" />

          {loading && (
            <div className="edt-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="cat-section__error">Ошибка загрузки: {error}</p>
          )}

          {!loading && !error && fetched && visible.length === 0 && (
            <p className="cat-section__empty">Нет товаров</p>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="edt-grid">
              {visible.map((product) => (
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
        </>
      )}
    </section>
  )
}
