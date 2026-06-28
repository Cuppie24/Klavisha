import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  type MedusaCart,
  retrieveCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCartId,
  getDefaultRegion,
} from '../lib/medusa'

interface CartContextValue {
  cart: MedusaCart | null
  loading: boolean
  itemCount: number
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  resetCart: () => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [loading, setLoading] = useState(false)
  const regionIdRef = useRef<string | undefined>(undefined)

  const refreshCart = useCallback(async () => {
    const c = await retrieveCart()
    setCart(c)
  }, [])

  useEffect(() => {
    getDefaultRegion()
      .then((r) => { regionIdRef.current = r?.id })
      .catch(() => {})
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    const regionId = regionIdRef.current
    if (!regionId) throw new Error('Регион не определён')
    setLoading(true)
    try {
      const updated = await apiAddToCart(regionId, variantId, quantity)
      setCart(updated)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true)
    try {
      const updated = await apiUpdateCartItem(itemId, quantity)
      setCart(updated)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true)
    try {
      const updated = await apiRemoveCartItem(itemId)
      setCart(updated)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCart = useCallback(async () => {
    const items = cart?.items
    if (!items?.length) return
    setLoading(true)
    try {
      let updated = cart!
      for (const item of items) {
        updated = await apiRemoveCartItem(item.id)
      }
      setCart(updated)
    } finally {
      setLoading(false)
    }
  }, [cart])

  // After an order is placed the cart is completed server-side; drop the stored
  // cart id so the next add-to-cart starts a fresh cart.
  const resetCart = useCallback(() => {
    clearCartId()
    setCart(null)
  }, [])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addToCart, updateItem, removeItem, clearCart, resetCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}
