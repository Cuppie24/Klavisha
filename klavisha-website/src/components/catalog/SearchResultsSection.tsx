import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  type MedusaProduct,
  listProducts,
  getCheapestPrice,
} from '../../lib/medusa'
import { ProductCard } from '../ProductCard'
import { PRICE_INFINITY, type CatalogSort } from './CatalogFilter'

interface Props {
  searchQuery: string
  regionId: string | null | undefined
  favorites: string[]
  onToggleFavorite: (product: MedusaProduct) => void
  sort?: CatalogSort
  priceRange?: [number, number] | null
}

export function SearchResultsSection({
  searchQuery,
  regionId,
  favorites,
  onToggleFavorite,
  sort = 'default',
  priceRange = null,
}: Props) {
  const navigate = useNavigate()
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (regionId === undefined) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setProducts([])

    listProducts({ regionId: regionId ?? undefined, q: searchQuery, limit: 100 })
      .then(({ products: p }) => { if (!cancelled) setProducts(p) })
      .catch((err: Error) => { if (!cancelled) setError(err.message ?? 'Ошибка загрузки') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [regionId, searchQuery])

  const favSet = useMemo(() => new Set(favorites), [favorites])

  const visible = useMemo(() => {
    let arr = products
    if (priceRange) {
      const [lo, hi] = priceRange
      arr = arr.filter((p) => {
        const price = getCheapestPrice(p)?.calculated
        return price != null && price >= lo && (hi >= PRICE_INFINITY || price <= hi)
      })
    }
    if (sort === 'asc') {
      arr = [...arr].sort((a, b) => (getCheapestPrice(a)?.calculated ?? Infinity) - (getCheapestPrice(b)?.calculated ?? Infinity))
    } else if (sort === 'desc') {
      arr = [...arr].sort((a, b) => (getCheapestPrice(b)?.calculated ?? 0) - (getCheapestPrice(a)?.calculated ?? 0))
    } else if (sort === 'az') {
      arr = [...arr].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ru'))
    }
    return arr
  }, [products, sort, priceRange])

  if (loading) {
    return (
      <section className="edt-section">
        <div className="edt-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-skeleton" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="edt-section">
        <div className="edt-empty">
          <div className="edt-empty__t">Ошибка загрузки</div>
          <div className="edt-empty__s">{error}</div>
        </div>
      </section>
    )
  }

  if (visible.length === 0) {
    return (
      <section className="edt-section">
        <div className="edt-empty">
          <div className="edt-empty__t">Ничего не найдено</div>
          <div className="edt-empty__s">Попробуйте изменить запрос или фильтры</div>
        </div>
      </section>
    )
  }

  return (
    <section className="edt-section">
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
    </section>
  )
}
