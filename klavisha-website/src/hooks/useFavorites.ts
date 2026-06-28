import { useState, useCallback } from 'react'

export interface FavoriteItem {
  productId: string
  productHandle: string
  variantId?: string
}

const STORAGE_KEY = 'klavisha_favorites_v2'

function read(): FavoriteItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter((i): i is FavoriteItem => typeof i?.productId === 'string')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(read)

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.productId === item.productId)
      const next = exists
        ? prev.filter((f) => f.productId !== item.productId)
        : [...prev, item]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (productId: string) => favorites.some((f) => f.productId === productId),
    [favorites]
  )

  const favoriteIds = favorites.map((f) => f.productId)

  return { favorites, favoriteIds, toggleFavorite, isFavorite }
}
