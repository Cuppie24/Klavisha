import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useFavoritesContext } from '../context/FavoritesContext'

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

interface AppHeaderProps {
  scrolled: boolean
  searchValue: string
  onSearchChange: (q: string) => void
  onSearchSubmit: (q: string) => void
}

export function AppHeader({ scrolled, searchValue, onSearchChange, onSearchSubmit }: AppHeaderProps) {
  const navigate = useNavigate()
  const { favorites } = useFavoritesContext()
  const favCount = favorites.length

  const [searchOpen, setSearchOpen] = useState(Boolean(searchValue))
  const [localQuery, setLocalQuery] = useState(searchValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalQuery(searchValue)
    if (searchValue && !searchOpen) setSearchOpen(true)
  }, [searchValue])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const handleToggleSearch = () => {
    setSearchOpen((v) => !v)
  }

  const handleChange = (value: string) => {
    setLocalQuery(value)
    onSearchChange(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = localQuery.trim()
    if (!q) { setSearchOpen(false); return }
    onSearchSubmit(q)
    setSearchOpen(false)
  }

  return (
    <header className={`sc-head${scrolled ? ' sc-head--scrolled' : ''}`}>
      <div className="sc-head-in">
        <Link to="/" className="sc-brand">Klavisha<b>.</b></Link>

        {searchOpen ? (
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
        ) : (
          <nav className="sc-nav">
            <NavLink to="/catalog" className={({ isActive }) => `sc-link${isActive ? ' on' : ''}`}>
              Каталог
            </NavLink>
          </nav>
        )}

        <div className="sc-utils">
          <button className={`sc-icon${searchOpen ? ' sc-icon--on' : ''}`} onClick={handleToggleSearch} aria-label="Поиск">
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
        </div>
      </div>
    </header>
  )
}
