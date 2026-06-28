import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useFavoritesContext } from '../context/FavoritesContext'
import { useCartContext } from '../context/CartContext'

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
)

interface AppHeaderProps {
  scrolled: boolean
  searchValue: string
  onSearchChange: (q: string) => void
  onSearchSubmit: (q: string) => void
}

export function AppHeader({ scrolled, searchValue, onSearchChange, onSearchSubmit }: AppHeaderProps) {
  const navigate = useNavigate()
  const { favorites } = useFavoritesContext()
  const { itemCount: cartCount } = useCartContext()
  const favCount = favorites.length

  const [searchOpen, setSearchOpen] = useState(Boolean(searchValue))
  const [localQuery, setLocalQuery] = useState(searchValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalQuery(searchValue)
  }, [searchValue])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const handleChange = (value: string) => {
    setLocalQuery(value)
    onSearchChange(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = localQuery.trim()
    inputRef.current?.blur()
    setSearchOpen(false)
    if (!q) return
    onSearchSubmit(q)
  }

  return (
    <>
      <header className={`sc-head${scrolled ? ' sc-head--scrolled' : ''}`}>
        <div className="sc-head-in">
          <Link to="/" className="sc-brand">Klavisha<b>.</b></Link>

          <nav className="sc-nav">
            <NavLink to="/catalog" className={({ isActive }) => `sc-link${isActive ? ' on' : ''}`}>
              Каталог
            </NavLink>
          </nav>

          <div className="sc-utils">
            <button className={`sc-icon${searchOpen ? ' sc-icon--on' : ''}`} onClick={() => setSearchOpen(v => !v)} aria-label="Поиск">
              <SearchIcon />
            </button>
            <button
              className={`sc-pill${favCount === 0 ? ' empty' : ''}`}
              onClick={() => navigate('/favorites')}
              aria-label="Избранное"
            >
              <HeartIcon filled={favCount > 0} />
              <span className="c">{favCount}</span>
            </button>
            <button
              className={`sc-pill${cartCount === 0 ? ' empty' : ''}`}
              onClick={() => navigate('/cart')}
              aria-label="Корзина"
            >
              <CartIcon />
              <span className="c">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="sc-search-overlay">
          <div className="sc-search-overlay-in">
            <button className="sc-search-close sc-icon" onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск">
              <CloseIcon />
            </button>
            <form className="sc-search-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="sc-search-input"
                type="search"
                placeholder="Поиск по каталогу..."
                value={localQuery}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }}
              />
              <button type="submit" className="sc-search-btn">Найти</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
