import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import type { MedusaCategory } from '../lib/medusa'

export function collectDescendantIds(cat: MedusaCategory): string[] {
  return [cat.id, ...cat.category_children.flatMap(collectDescendantIds)]
}

export function filterEmptyCategories(cats: MedusaCategory[], activeIds: Set<string>): MedusaCategory[] {
  return cats
    .map(cat => ({ ...cat, category_children: filterEmptyCategories(cat.category_children, activeIds) }))
    .filter(cat => activeIds.has(cat.id) || cat.category_children.length > 0)
}

function containsId(cat: MedusaCategory, id: string | null): boolean {
  if (!id) return false
  return cat.category_children.some((c) => c.id === id || containsId(c, id))
}

interface CategoryTreeProps {
  categories: MedusaCategory[]
  selectedId: string | null
  onSelect: (cat: MedusaCategory) => void
}

export function CategoryTree({ categories, selectedId, onSelect }: CategoryTreeProps) {
  return (
    <nav className="cat-tree" aria-label="Категории товаров">
      {categories.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </nav>
  )
}

interface CategoryNodeProps {
  category: MedusaCategory
  selectedId: string | null
  onSelect: (cat: MedusaCategory) => void
  depth: number
}

function CategoryNode({ category, selectedId, onSelect, depth }: CategoryNodeProps) {
  const hasChildren = category.category_children.length > 0
  const isSelected = category.id === selectedId
  const containsSelected = hasChildren && containsId(category, selectedId)
  const shouldBeOpen = containsSelected || (isSelected && hasChildren)
  const [open, setOpen] = useState(shouldBeOpen)

  useEffect(() => {
    if (shouldBeOpen) setOpen(true)
  }, [selectedId])

  return (
    <div className={`cat-node cat-node--depth-${depth}`}>
      <div className={`cat-node__row${isSelected ? ' cat-node__row--active' : ''}`}>
        {hasChildren ? (
          <button
            className={`cat-node__toggle${open ? ' cat-node__toggle--open' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
            aria-label={open ? 'Свернуть' : 'Развернуть'}
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        ) : (
          <span className="cat-node__toggle-placeholder" />
        )}
        <button className="cat-node__label" onClick={() => onSelect(category)}>
          {category.name}
        </button>
      </div>
      {hasChildren && open && (
        <div className="cat-node__children">
          {category.category_children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
