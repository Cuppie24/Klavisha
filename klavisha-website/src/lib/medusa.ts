/**
 * Medusa API Client
 * Документация: https://docs.medusajs.com/api/store
 */

const BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? ''
const DEFAULT_REGION = import.meta.env.VITE_DEFAULT_REGION ?? 'uz'

const CART_ID_KEY = 'klavisha_cart_id'

// ─── Базовый fetch ────────────────────────────────────────────────────────────

async function medusaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cartId = getCartId()

  const res = await fetch(`${BACKEND_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': PUBLISHABLE_KEY,
      ...(cartId ? { 'x-cart-id': cartId } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? `Medusa error ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ─── Регионы ─────────────────────────────────────────────────────────────────

export interface MedusaRegion {
  id: string
  name: string
  currency_code: string
  countries: { iso_2: string; name: string }[]
}

export async function listRegions(): Promise<MedusaRegion[]> {
  const { regions } = await medusaFetch<{ regions: MedusaRegion[] }>('/store/regions')
  return regions
}

export async function getRegionByCountry(countryCode: string): Promise<MedusaRegion | null> {
  const regions = await listRegions()
  return (
    regions.find((r) =>
      r.countries.some((c) => c.iso_2.toLowerCase() === countryCode.toLowerCase())
    ) ?? null
  )
}

// ─── Продукты ─────────────────────────────────────────────────────────────────

export interface MedusaProductVariant {
  id: string
  title: string
  sku?: string
  inventory_quantity?: number
  manage_inventory?: boolean
  allow_backorder?: boolean
  calculated_price?: {
    calculated_amount: number
    original_amount: number
    currency_code: string
    calculated_price: { price_list_type: string | null }
  }
  options: { option_id: string; value: string }[]
  images?: { id: string; url: string }[]
  metadata?: Record<string, unknown>
}

export interface MedusaProduct {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  images?: { id: string; url: string }[]
  tags?: { id: string; value: string }[]
  collection?: { id: string; handle: string; title: string }
  collection_id?: string
  categories?: { id: string; handle: string }[]
  variants?: MedusaProductVariant[]
  options?: { id: string; title: string; values: { value: string }[] }[]
  material?: string
  origin_country?: string
  weight?: number
  created_at?: string
  metadata?: Record<string, unknown>
}

// ─── Категории ────────────────────────────────────────────────────────────────

export interface MedusaCategory {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
  category_children: MedusaCategory[]
  is_active: boolean
  is_internal: boolean
}

export const OTHER_CATEGORY: MedusaCategory = {
  id: '__other__',
  name: 'Другое',
  handle: 'other',
  parent_category_id: null,
  category_children: [],
  is_active: true,
  is_internal: false,
}

// Memoised for the SPA session so returning to the catalog (back button / in-app)
// rebuilds its shell instantly instead of refetching — a prerequisite for scroll
// restoration, which needs the page at full height immediately on return. We keep
// both the promise (for the first await) and the resolved value (for a synchronous
// read on the first render of a returning catalog, before any effect runs).
let _categoriesPromise: Promise<MedusaCategory[]> | null = null
let _categoriesValue: MedusaCategory[] | null = null

export async function listCategories(): Promise<MedusaCategory[]> {
  if (_categoriesPromise) return _categoriesPromise
  _categoriesPromise = (async () => {
    const { product_categories } = await medusaFetch<{
      product_categories: MedusaCategory[]
      count: number
    }>(
      '/store/product-categories?include_descendants_tree=true'
    )
    _categoriesValue = product_categories
    return product_categories
  })()
  // Don't cache a rejected request — let the next call retry.
  _categoriesPromise.catch(() => { _categoriesPromise = null })
  return _categoriesPromise
}

// Synchronously read the cached categories (null until the first fetch resolves).
export function getCachedCategories(): MedusaCategory[] | null {
  return _categoriesValue
}

// ─── Продукты (параметры) ─────────────────────────────────────────────────────

interface ProductListParams {
  limit?: number
  offset?: number
  regionId?: string
  collectionId?: string
  categoryId?: string | string[]
  q?: string
  handle?: string
  id?: string[]
  order?: string
}

export async function listProducts(params: ProductListParams = {}): Promise<{
  products: MedusaProduct[]
  count: number
}> {
  const query = new URLSearchParams()
  if (params.limit)       query.set('limit', String(params.limit))
  if (params.offset)      query.set('offset', String(params.offset))
  if (params.regionId)    query.set('region_id', params.regionId)
  if (params.collectionId) query.set('collection_id[]', params.collectionId)
  if (params.categoryId) {
    const ids = Array.isArray(params.categoryId) ? params.categoryId : [params.categoryId]
    ids.forEach((id) => query.append('category_id[]', id))
  }
  if (params.q)           query.set('q', params.q)
  if (params.handle)      query.set('handle', params.handle)
  if (params.id)          params.id.forEach((id) => query.append('id[]', id))
  if (params.order)       query.set('order', params.order)

  query.set('fields', '*variants.calculated_price,+variants.inventory_quantity,*variants.options,*variants.images,+metadata,*categories,+tags')

  const data = await medusaFetch<{ products: MedusaProduct[]; count: number }>(
    `/store/products?${query.toString()}`
  )
  const products = data.products.filter(
    (p) => !p.tags?.some((t) => t.value === 'system')
  )
  return { products, count: data.count - (data.products.length - products.length) }
}

// ─── Активные категории (есть хоть один товар) ───────────────────────────────

type ActiveCategoryIds = { categoryIds: Set<string>; hasUncategorized: boolean }
let _activeCategoryIdsPromise: Promise<ActiveCategoryIds> | null = null
let _activeCategoryIdsValue: ActiveCategoryIds | null = null

export async function getActiveCategoryIds(): Promise<ActiveCategoryIds> {
  if (_activeCategoryIdsPromise) return _activeCategoryIdsPromise
  _activeCategoryIdsPromise = (async () => {
    const data = await medusaFetch<{ products: MedusaProduct[] }>(
      '/store/products?limit=500&fields=*categories,*tags'
    )
    const products = data.products.filter(p => !p.tags?.some(t => t.value === 'system'))
    const categoryIds = new Set<string>()
    let hasUncategorized = false
    for (const product of products) {
      if (!product.categories || product.categories.length === 0) {
        hasUncategorized = true
      } else {
        product.categories.forEach(c => categoryIds.add(c.id))
      }
    }
    const value = { categoryIds, hasUncategorized }
    _activeCategoryIdsValue = value
    return value
  })()
  _activeCategoryIdsPromise.catch(() => { _activeCategoryIdsPromise = null })
  return _activeCategoryIdsPromise
}

// Synchronously read the cached active-category ids (null until first resolve).
export function getCachedActiveCategoryIds(): ActiveCategoryIds | null {
  return _activeCategoryIdsValue
}

// ─── Цены всех товаров (для фильтра каталога) ────────────────────────────────

export interface CatalogPriceItem {
  price: number
  categoryIds: string[]
}

// Один лёгкий запрос: цена + категории каждого товара. Питает границы
// ползунка цены, счётчики чипов и живой предпросмотр в панели фильтра.
export async function getCatalogPriceItems(regionId?: string): Promise<CatalogPriceItem[]> {
  const query = new URLSearchParams()
  query.set('limit', '500')
  if (regionId) query.set('region_id', regionId)
  query.set('fields', '*variants.calculated_price,*categories,+tags')

  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    `/store/products?${query.toString()}`
  )

  const items: CatalogPriceItem[] = []
  for (const product of data.products) {
    if (product.tags?.some((t) => t.value === 'system')) continue
    const price = getCheapestPrice(product)?.calculated
    if (price == null) continue
    items.push({
      price,
      categoryIds: product.categories?.map((c) => c.id) ?? [],
    })
  }
  return items
}

// ─── Продукты для карточек категорий (тег category-info) ─────────────────────

export async function getCategoryInfoProducts(): Promise<MedusaProduct[]> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    '/store/products?limit=200&fields=title,thumbnail,*tags'
  )
  return data.products.filter((p) => p.tags?.some((t) => t.value === 'category-info'))
}

// ─── Кеш продуктов ────────────────────────────────────────────────────────────

const _productCache = new Map<string, { product: MedusaProduct | null; expiresAt: number }>()
const PRODUCT_CACHE_TTL = 3 * 60 * 1000 // 3 минуты

export function clearProductCache() {
  _productCache.clear()
}

export async function getProduct(handle: string, regionId?: string): Promise<MedusaProduct | null> {
  const key = `${handle}::${regionId ?? ''}`
  const cached = _productCache.get(key)
  if (cached && Date.now() < cached.expiresAt) return cached.product

  const { products } = await listProducts({ handle, regionId })
  const product = products[0] ?? null
  _productCache.set(key, { product, expiresAt: Date.now() + PRODUCT_CACHE_TTL })
  return product
}

// ─── Метаданные магазина ──────────────────────────────────────────────────────

let _storeMeta: Record<string, unknown> | null | undefined = undefined

export async function getStoreMetadata(): Promise<Record<string, unknown> | null> {
  if (_storeMeta !== undefined) return _storeMeta
  try {
    const { metadata } = await medusaFetch<{ metadata: Record<string, unknown> }>('/store/config')
    _storeMeta = metadata ?? null
  } catch {
    _storeMeta = null
  }
  return _storeMeta
}

// ─── Корзина ──────────────────────────────────────────────────────────────────

export interface MedusaCart {
  id: string
  region_id: string
  currency_code: string
  total: number
  subtotal: number
  discount_total: number
  shipping_total: number
  items: MedusaCartItem[]
}

export interface MedusaCartItem {
  id: string
  title: string
  thumbnail?: string
  quantity: number
  unit_price: number
  total: number
  variant: {
    id: string
    title: string
    product: { id: string; title: string; handle: string }
  }
}

function getCartId(): string | null {
  return localStorage.getItem(CART_ID_KEY)
}

function setCartId(id: string) {
  localStorage.setItem(CART_ID_KEY, id)
}

export function clearCartId() {
  localStorage.removeItem(CART_ID_KEY)
}

const CART_FIELDS = 'fields=*items,*items.variant,*items.variant.product'

export async function getOrCreateCart(regionId: string): Promise<MedusaCart> {
  const existingId = getCartId()

  if (existingId) {
    try {
      const { cart } = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${existingId}?${CART_FIELDS}`)
      return cart
    } catch {
      // Корзина устарела — создаём новую
      clearCartId()
    }
  }

  const { cart } = await medusaFetch<{ cart: MedusaCart }>(`/store/carts?${CART_FIELDS}`, {
    method: 'POST',
    body: JSON.stringify({ region_id: regionId }),
  })
  setCartId(cart.id)
  return cart
}

export async function retrieveCart(): Promise<MedusaCart | null> {
  const cartId = getCartId()
  if (!cartId) return null
  try {
    const { cart } = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}?${CART_FIELDS}`)
    return cart
  } catch {
    return null
  }
}

export async function addToCart(
  regionId: string,
  variantId: string,
  quantity = 1
): Promise<MedusaCart> {
  const cart = await getOrCreateCart(regionId)
  const { cart: updated } = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cart.id}/line-items?${CART_FIELDS}`,
    {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  )
  return updated
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<MedusaCart> {
  const cartId = getCartId()
  if (!cartId) throw new Error('No cart')
  const { cart } = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${itemId}?${CART_FIELDS}`,
    {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }
  )
  return cart
}

export async function removeCartItem(itemId: string): Promise<MedusaCart> {
  const cartId = getCartId()
  if (!cartId) throw new Error('No cart')
  const { cart } = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${itemId}?${CART_FIELDS}`,
    { method: 'DELETE' }
  )
  return cart
}

// ─── Оформление заказа ────────────────────────────────────────────────────────

export interface OrderRequestPayload {
  cart_id: string
  name: string
  phone: string
  address: string
  comment?: string
  items: { title: string; variant_title?: string; quantity: number; unit_price: number }[]
  total: number
  currency_code: string
}

export async function submitOrderRequest(payload: OrderRequestPayload): Promise<{ success: boolean; order_id: string | null }> {
  return medusaFetch<{ success: boolean; order_id: string | null }>('/store/order-request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ─── Утилиты форматирования цен ───────────────────────────────────────────────

export function formatPrice(amount: number, currencyCode: string): string {
  const code = currencyCode.toUpperCase()
  // UZS не имеет подъединиц — цена хранится в целых сумах
  const value = code === 'UZS' ? amount : amount / 100

  if (code === 'UZS') {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' сум'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value)
}

export function getCheapestPrice(product: MedusaProduct): {
  calculated: number
  original: number
  currency: string
  isOnSale: boolean
  discountPercent: number
} | null {
  const variants = product.variants?.filter((v) => v.calculated_price) ?? []
  if (!variants.length) return null

  const cheapest = variants.sort(
    (a, b) =>
      (a.calculated_price!.calculated_amount) -
      (b.calculated_price!.calculated_amount)
  )[0]

  const p = cheapest.calculated_price!
  const isOnSale = p.calculated_price.price_list_type === 'sale' ||
    p.calculated_amount < p.original_amount

  return {
    calculated: p.calculated_amount,
    original: p.original_amount,
    currency: p.currency_code,
    isOnSale,
    discountPercent: isOnSale
      ? Math.round(((p.original_amount - p.calculated_amount) / p.original_amount) * 100)
      : 0,
  }
}

// ─── Хелпер: доступность варианта ─────────────────────────────────────────────

export function isVariantInStock(variant: MedusaProductVariant): boolean {
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  if (variant.inventory_quantity == null) return true
  return variant.inventory_quantity > 0
}

// Доступное количество варианта на складе. Возвращает null, когда запас не
// ограничен (инвентарь не отслеживается или разрешён бэкордер).
export function getVariantStock(
  variant: Pick<MedusaProductVariant, 'manage_inventory' | 'allow_backorder' | 'inventory_quantity'>
): number | null {
  if (!variant.manage_inventory) return null
  if (variant.allow_backorder) return null
  if (variant.inventory_quantity == null) return null
  return variant.inventory_quantity
}

// Карта «id варианта → доступный запас» для набора товаров. Запас (computed
// inventory_quantity) не приходит в ответе корзины, поэтому его берём из
// эндпоинта товаров, где он доступен. null = запас не ограничен.
export async function getVariantStockMap(
  productIds: string[]
): Promise<Record<string, number | null>> {
  const ids = [...new Set(productIds.filter(Boolean))]
  if (!ids.length) return {}
  const query = new URLSearchParams()
  ids.forEach((id) => query.append('id[]', id))
  query.set('limit', String(ids.length))
  query.set('fields', 'id,*variants,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder')
  const { products } = await medusaFetch<{ products: MedusaProduct[] }>(
    `/store/products?${query.toString()}`
  )
  const map: Record<string, number | null> = {}
  for (const p of products) {
    for (const v of p.variants ?? []) map[v.id] = getVariantStock(v)
  }
  return map
}

// ─── Регион по умолчанию (кешируется) ─────────────────────────────────────────

let _defaultRegion: MedusaRegion | null = null

export async function getDefaultRegion(): Promise<MedusaRegion | null> {
  if (_defaultRegion) return _defaultRegion
  _defaultRegion = await getRegionByCountry(DEFAULT_REGION)
  return _defaultRegion
}

// Synchronously read the cached default region (null until first resolve).
export function getCachedDefaultRegion(): MedusaRegion | null {
  return _defaultRegion
}
