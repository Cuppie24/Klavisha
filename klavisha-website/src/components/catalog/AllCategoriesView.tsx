import { useMemo } from 'react'
import {
  type MedusaCategory,
  type MedusaProduct,
  OTHER_CATEGORY,
} from '../../lib/medusa'
import { filterEmptyCategories } from '../CategoryTree'
import { CategorySection } from './CategorySection'
import type { CatalogSort } from './CatalogFilter'

interface Props {
  categories: MedusaCategory[]
  regionId: string | null | undefined
  favorites: string[]
  onToggleFavorite: (product: MedusaProduct) => void
  activeCategoryIds: Set<string>
  hasUncategorized: boolean
  sort?: CatalogSort
  priceRange?: [number, number] | null
  // When a price filter is active: only render these root sections (null = all).
  visibleRootIds?: Set<string> | null
  q?: string
}

export function AllCategoriesView({
  categories,
  regionId,
  favorites,
  onToggleFavorite,
  activeCategoryIds,
  hasUncategorized,
  sort = 'default',
  priceRange = null,
  visibleRootIds = null,
  q,
}: Props) {
  const rootCategories = useMemo(
    () =>
      filterEmptyCategories(
        categories.filter((c) => c.parent_category_id === null),
        activeCategoryIds
      ),
    [categories, activeCategoryIds]
  )

  const allSections = useMemo(() => {
    const base = [...rootCategories, ...(hasUncategorized ? [OTHER_CATEGORY] : [])]
    if (!visibleRootIds) return base
    return base.filter((cat) => visibleRootIds.has(cat.id))
  }, [rootCategories, hasUncategorized, visibleRootIds])

  return (
    <>
      {allSections.map((cat, i) => (
        <CategorySection
          key={`${cat.id}::${q ?? ''}`}
          category={cat}
          regionId={regionId}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          index={i}
          sort={sort}
          priceRange={priceRange}
          q={q}
        />
      ))}
    </>
  )
}
