import { createContext, useContext, type ReactNode } from 'react'
import { useFavorites, type FavoriteItem } from '../hooks/useFavorites'

interface FavoritesContextValue {
  favorites: FavoriteItem[]
  favoriteIds: string[]
  toggleFavorite: (item: FavoriteItem) => void
  isFavorite: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { favorites, favoriteIds, toggleFavorite, isFavorite } = useFavorites()

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavoritesContext must be used within FavoritesProvider')
  return ctx
}
