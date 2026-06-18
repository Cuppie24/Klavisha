import { Heart, Flame } from 'lucide-react'
import {
  type MedusaProduct,
  getCheapestPrice,
  formatPrice,
  isVariantInStock,
} from '../lib/medusa'

interface ProductCardProps {
  product: MedusaProduct
  isFavorite: boolean
  onToggleFavorite: () => void
  onCardClick: () => void
}

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onCardClick,
}: ProductCardProps) {
  const price = getCheapestPrice(product)
  const inStock = product.variants?.some(isVariantInStock) ?? false
  const isHot = product.tags?.some((t) => t.value === 'hot') ?? false
  const variantCount = product.variants?.length ?? 0

  return (
    <article
      className={`edt-card${!inStock ? ' edt-card--soldout' : ''}`}
      onClick={onCardClick}
    >
      <div className="edt-imgwrap">
        {!inStock && <span className="edt-soldtag">Нет в наличии</span>}

        <button
          className={`edt-heart${isFavorite ? ' edt-heart--on' : ''}`}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
        >
          <Heart size={17} strokeWidth={1.8} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {product.thumbnail ? (
          <img className="edt-img" src={product.thumbnail} alt={product.title} />
        ) : (
          <div className="edt-img-placeholder" />
        )}
      </div>

      <div className="edt-meta">
        <div className="edt-m-row">
          <div className="edt-m-name">{product.title}</div>
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
          {isHot && (
            <span className="edt-m-hot">
              <Flame size={11} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
              Хит
            </span>
          )}
          {variantCount > 1 && (
            <span className="edt-m-vars">{variantCount} вариант{variantCount === 1 ? '' : variantCount < 5 ? 'а' : 'ов'}</span>
          )}
        </div>
      </div>
    </article>
  )
}
