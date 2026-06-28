import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PhoneInput, { type Value as PhoneValue, isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { formatPrice, submitOrderRequest, getVariantStockMap } from '../lib/medusa'
import { useCartContext } from '../context/CartContext'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'

const FREE_SHIP = 1_500_000
const SHIP_FLAT  = 75_000

function pluralItems(n: number) {
  const r10 = n % 10, r100 = n % 100
  if (r10 === 1 && r100 !== 11) return 'товар'
  if (r10 >= 2 && r10 <= 4 && (r100 < 10 || r100 >= 20)) return 'товара'
  return 'товаров'
}
function pluralPos(n: number) {
  const r10 = n % 10, r100 = n % 100
  if (r10 === 1 && r100 !== 11) return 'позиция'
  if (r10 >= 2 && r10 <= 4 && (r100 < 10 || r100 >= 20)) return 'позиции'
  return 'позиций'
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

const CartGlyph = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2.2l2.3 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H5.3" />
  </svg>
)

interface FormState { name: string; phone: PhoneValue | undefined; address: string; comment: string }

export function CartPage() {
  const navigate = useNavigate()
  const { cart, loading, updateItem, removeItem, clearCart, resetCart } = useCartContext()
  const [scrolled,   setScrolled]   = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [stockMsgId, setStockMsgId] = useState<string | null>(null)
  const [stockMap, setStockMap] = useState<Record<string, number | null>>({})
  const [clearing, setClearing] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', phone: undefined, address: '', comment: '' })
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // inventory_quantity не приходит в ответе корзины — подгружаем запас
  // вариантов из эндпоинта товаров и кешируем по id варианта.
  const productIdsKey = (cart?.items ?? [])
    .map((i) => i.variant?.product?.id)
    .filter(Boolean)
    .sort()
    .join(',')
  useEffect(() => {
    const ids = productIdsKey ? productIdsKey.split(',') : []
    if (!ids.length) { setStockMap({}); return }
    let cancelled = false
    getVariantStockMap(ids)
      .then((m) => { if (!cancelled) setStockMap(m) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [productIdsKey])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const setField = (k: Exclude<keyof FormState, 'phone'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }))
      setDone(false)
      setSubmitError('')
    }

  const setPhone = (value: PhoneValue | undefined) => {
    setForm(f => ({ ...f, phone: value }))
    setDone(false)
    setSubmitError('')
  }

  const phoneValid = Boolean(form.phone && isValidPhoneNumber(form.phone))
  const phoneError = phoneTouched && form.phone && !phoneValid
  const canReserve = Boolean(form.name.trim() && phoneValid && form.address.trim())

  useEffect(() => {
    if (done) resetCart()
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canReserve || submitting || done) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitOrderRequest({
        cart_id: cart!.id,
        name: form.name.trim(),
        phone: form.phone ?? '',
        address: form.address.trim(),
        comment: form.comment.trim() || undefined,
        items: items.map(i => ({
          title: i.variant?.product?.title ?? i.title,
          variant_title: i.variant?.title,
          quantity: i.quantity,
          unit_price: i.unit_price ?? 0,
        })),
        total,
        currency_code: currency,
      })
      setDone(true)
    } catch {
      setSubmitError('Не удалось отправить заказ. Проверьте соединение и попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  const stockMsgTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(stockMsgTimer.current), [])

  const handleUpdateQty = async (itemId: string, qty: number, maxStock: number | null) => {
    if (qty < 1) return
    if (maxStock != null && qty > maxStock) {
      setStockMsgId(itemId)
      window.clearTimeout(stockMsgTimer.current)
      stockMsgTimer.current = window.setTimeout(() => setStockMsgId(null), 2600)
      return
    }
    setStockMsgId(null)
    setUpdatingId(itemId)
    try { await updateItem(itemId, qty) } finally { setUpdatingId(null) }
  }

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    try { await removeItem(itemId) } finally { setRemovingId(null) }
  }

  const items     = cart?.items ?? []
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const currency  = cart?.currency_code ?? 'UZS'
  const subtotal  = cart?.subtotal ?? 0
  const freeShip  = subtotal >= FREE_SHIP || subtotal === 0
  const shipping  = freeShip ? 0 : SHIP_FLAT
  const total     = subtotal + shipping
  const remaining = Math.max(0, FREE_SHIP - subtotal)
  const progress  = Math.min(100, (subtotal / FREE_SHIP) * 100)

  const headerProps = {
    scrolled,
    searchValue: '',
    onSearchChange: () => {},
    onSearchSubmit: (q: string) => { if (q.trim()) navigate(`/catalog?q=${encodeURIComponent(q.trim())}`) },
  }

  // ── Order placed (success) ─────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="layout">
        <AppHeader {...headerProps} />
        <main className="cart-page">
          <div className="cart-wrap">
            <div className="cart-empty-state">
              <div className="ce-icon ce-icon--ok">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="ce-t">Заказ оформлен</h1>
              <p className="ce-s">
                Спасибо, {form.name.trim().split(' ')[0]} — мы свяжемся с вами по телефону для подтверждения и доставки.
              </p>
              <button className="ce-btn" onClick={() => navigate('/catalog')}>В каталог <span>→</span></button>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────

  if (loading && !cart) {
    return (
      <div className="layout">
        <AppHeader {...headerProps} />
        <main className="cart-page">
          <div className="cart-wrap">
            <div className="cart-skel-head">
              <div className="cart-skel-line" style={{ width: 140, height: 11, marginBottom: 14 }} />
              <div className="cart-skel-line" style={{ width: 260, height: 56 }} />
            </div>
            <div className="cart-grid">
              <div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="cart-item-skel">
                    <div className="cart-item-skel-img" />
                    <div className="cart-item-skel-body">
                      <div className="cart-skel-line" style={{ width: '60%', height: 18, marginBottom: 10 }} />
                      <div className="cart-skel-line" style={{ width: '35%', height: 13, marginBottom: 18 }} />
                      <div className="cart-skel-line" style={{ width: 110, height: 38 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-skel-line" style={{ width: '100%', height: 420, borderRadius: 20 }} />
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────────

  if (!loading && items.length === 0) {
    return (
      <div className="layout">
        <AppHeader {...headerProps} />
        <main className="cart-page">
          <div className="cart-wrap">
            <div className="cart-empty-state">
              <div className="ce-icon"><CartGlyph /></div>
              <h1 className="ce-t">Корзина пуста</h1>
              <p className="ce-s">Здесь пока ничего нет. Загляните в каталог — клавиатуры, кейкапы, свитчи и аксессуары ждут вас.</p>
              <button className="ce-btn" onClick={() => navigate('/catalog')}>В каталог <span>→</span></button>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  // ── Cart ──────────────────────────────────────────────────────────────────────

  return (
    <div className="layout">
      <AppHeader {...headerProps} />

      <main className="cart-page">
        <div className="cart-wrap">

          {/* ── Header ── */}
          <header className="cart-head">
            <div>
              <div className="ch-kicker">Заказ из мастерской</div>
              <h1 className="ch-title">Корзина</h1>
            </div>
            <div className="ch-sub">
              {itemCount} {pluralItems(itemCount)} ·{' '}
              <button onClick={() => navigate('/catalog')}>Продолжить покупки</button>
            </div>
          </header>

          <div className="cart-grid">

            {/* ── Items column ── */}
            <section>
              <div className="items-bar">
                <span className="ib-lab">{items.length} {pluralPos(items.length)}</span>
                <button
                  className="ib-clear"
                  onClick={async () => {
                    setClearing(true)
                    try { await clearCart() } finally { setClearing(false) }
                  }}
                  disabled={clearing}
                >
                  <TrashIcon /> {clearing ? 'Очищаем…' : 'Очистить корзину'}
                </button>
              </div>

              {items.map((item, idx) => {
                const isRemoving    = removingId === item.id
                const isUpdating    = updatingId === item.id
                const productHandle = item.variant?.product?.handle ?? ''
                const productTitle  = item.variant?.product?.title ?? item.title
                const unitPrice     = item.unit_price ?? 0
                const lineTotal     = item.total ?? unitPrice * item.quantity
                const maxStock      = item.variant ? stockMap[item.variant.id] ?? null : null
                const showStockMsg  = stockMsgId === item.id

                return (
                  <div key={item.id} className={`cart-line${isRemoving ? ' cart-line--removing' : ''}`}>

                    {/* Image — 3:4 with gradient overlay + index */}
                    {productHandle ? (
                      <Link to={`/product/${productHandle}`} className="cart-line-img" aria-label={productTitle}>
                        {item.thumbnail && <img src={item.thumbnail} alt={productTitle} loading="lazy" decoding="async" />}
                        <span className="cart-line-shot">/ {String(idx + 1).padStart(2, '0')}</span>
                      </Link>
                    ) : (
                      <div className="cart-line-img">
                        {item.thumbnail && <img src={item.thumbnail} alt={productTitle} loading="lazy" decoding="async" />}
                        <span className="cart-line-shot">/ {String(idx + 1).padStart(2, '0')}</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="cart-line-mid">
                      {productHandle
                        ? <Link to={`/product/${productHandle}`} className="cart-line-name">{productTitle}</Link>
                        : <span className="cart-line-name">{productTitle}</span>
                      }

                      {item.variant?.title && item.variant.title !== 'Default Title' && (
                        <div className="cart-line-meta">
                          <span className="cart-chip">{item.variant.title}</span>
                        </div>
                      )}

                      {unitPrice > 0 && (
                        <div className="cart-line-unit">
                          <b>{formatPrice(unitPrice, currency)}</b> / шт.
                        </div>
                      )}

                      <div className="cart-line-ctl">
                        <div className={`cart-qty${isUpdating ? ' cart-qty--busy' : ''}`}>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1, maxStock)}
                            disabled={item.quantity <= 1 || isUpdating}
                            aria-label="Уменьшить"
                          >−</button>
                          <input
                            type="number"
                            value={item.quantity}
                            min={1}
                            max={maxStock ?? undefined}
                            onChange={(e) => handleUpdateQty(item.id, parseInt(e.target.value, 10) || 1, maxStock)}
                            aria-label="Количество"
                          />
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1, maxStock)}
                            disabled={isUpdating}
                            aria-label="Увеличить"
                          >+</button>
                        </div>
                        <button className="cart-line-remove" onClick={() => handleRemove(item.id)} disabled={isRemoving}>
                          <TrashIcon /> Удалить
                        </button>
                      </div>
                      {showStockMsg && (
                        <div className="cart-line-stockmsg">Доступно только {maxStock} шт.</div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="cart-line-right">
                      <span className="cart-line-total">{formatPrice(lineTotal, currency)}</span>
                      {item.quantity > 1 && (
                        <span className="cart-line-each">{item.quantity} × {formatPrice(unitPrice, currency)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </section>

            {/* ── Summary / Order form ── */}
            <aside className="cart-summary">
              <h2 className="sum-h">Сводка заказа</h2>

              {/* Shipping progress bar */}
              <div className="ship-prog">
                {freeShip && subtotal > 0
                  ? <div className="sp-txt sp-txt--done">✓ Бесплатная доставка разблокирована</div>
                  : <div className="sp-txt">Добавьте ещё <b>{formatPrice(remaining, currency)}</b> для бесплатной доставки</div>
                }
                <div className="sp-track"><div className="sp-fill" style={{ width: progress + '%' }} /></div>
              </div>

              <div className="sum-row">
                <span>Подытог</span>
                <span className="sr-v">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="sum-row">
                <span>Доставка</span>
                <span className={`sr-v${freeShip && subtotal > 0 ? ' sr-v--free' : ''}`}>
                  {freeShip && subtotal > 0 ? 'Бесплатно' : formatPrice(SHIP_FLAT, currency)}
                </span>
              </div>

              <div className="sum-div" />

              <div className="sum-total">
                <span className="st-l">Итого</span>
                <span className="st-r">
                  <span className="st-cur">UZS</span>
                  <span className="st-v">{formatPrice(total, currency)}</span>
                </span>
              </div>

              {/* Payment method */}
              <div className="pay-cash">
                <span className="pc-dot" />
                <div>
                  <div className="pc-t">Оплата наличными при получении</div>
                  <div className="pc-s">Зарезервируйте сейчас, оплатите при получении в мастерской.</div>
                </div>
              </div>

              {/* Order form */}
              <form className="pickup-form" onSubmit={handleSubmit}>
                <div className="pk-field">
                  <label htmlFor="pk-name">Имя</label>
                  <input id="pk-name" type="text" value={form.name} onChange={setField('name')}
                    placeholder="Имя и фамилия" autoComplete="name" />
                </div>
                <div className="pk-field">
                  <label htmlFor="pk-phone">Телефон</label>
                  <div className={`pk-phone-wrap${phoneError ? ' pk-phone-wrap--error' : ''}`}>
                    <PhoneInput
                      id="pk-phone"
                      defaultCountry="UZ"
                      value={form.phone}
                      onChange={setPhone}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder="+998 90 123 45 67"
                      autoComplete="tel"
                      international
                      countryCallingCodeEditable={false}
                    />
                  </div>
                  {phoneError && (
                    <span className="pk-field-error">Введите корректный номер телефона</span>
                  )}
                </div>
                <div className="pk-field">
                  <label htmlFor="pk-addr">Адрес</label>
                  <input id="pk-addr" type="text" value={form.address} onChange={setField('address')}
                    placeholder="Адрес доставки или самовывоза" autoComplete="street-address" />
                </div>
                <div className="pk-field">
                  <label htmlFor="pk-comment">
                    Комментарий <span className="pk-opt">необязательно</span>
                  </label>
                  <textarea id="pk-comment" rows={2} value={form.comment} onChange={setField('comment')}
                    placeholder="Пожелания по заказу" />
                </div>

                <button type="submit" className="checkout-btn" disabled={!canReserve || submitting}>
                  {submitting
                    ? <><span>Отправляем…</span></>
                    : <><span>Оформить заказ</span><span className="checkout-arr">→</span></>
                  }
                </button>

                {submitError && (
                  <div className="pk-error">{submitError}</div>
                )}
              </form>

              {/* Reassurance */}
              <div className="sum-reassure">
                <span><span className="sr-dot" />Проверено и упаковано вручную в нашей мастерской</span>
                <span><span className="sr-dot" />Возврат 30 дней · Гарантия 2 года</span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
