"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { CartTab } from "@/components/cart-tab"
import { CatalogTab } from "@/components/catalog-tab"
import { ProfileTab } from "@/components/profile-tab"
import { TabBar, type TabKey } from "@/components/tab-bar"
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import type { CartItem, Product } from "@/lib/types"
import { useTelegram } from "@/lib/use-telegram"

export default function Page() {
  const { user } = useTelegram()
  const [tab, setTab] = useState<TabKey>("catalog")

  // Каталог
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Корзина: id -> количество
  const [cart, setCart] = useState<Record<number, number>>({})

  useEffect(() => {
    // Имитация загрузки с API: /api/products/all?skip=0&limit=100
    // const res = await fetch("/api/products/all?skip=0&limit=100")
    let active = true
    const timer = setTimeout(() => {
      if (active) {
        setProducts(MOCK_PRODUCTS)
        setLoading(false)
      }
    }, 1200)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  const getQuantity = useCallback((id: number) => cart[id] ?? 0, [cart])

  const handleAdd = useCallback((product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }))
  }, [])

  const handleIncrement = useCallback((id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }, [])

  const handleDecrement = useCallback((id: number) => {
    setCart((prev) => {
      const next = (prev[id] ?? 0) - 1
      const updated = { ...prev }
      if (next <= 0) {
        delete updated[id]
      } else {
        updated[id] = next
      }
      return updated
    })
  }, [])

  const handleRemove = useCallback((id: number) => {
    setCart((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }, [])

  // Открытие детального просмотра: /api/products/{id}
  const handleOpen = useCallback((product: Product) => {
    console.log("[v0] Открыть детальный просмотр товара id:", product.id)
  }, [])

  const cartItems: CartItem[] = useMemo(() => {
    return products
      .filter((p) => cart[p.id])
      .map((product) => ({ product, quantity: cart[product.id] }))
  }, [products, cart])

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, q) => sum + q, 0),
    [cart],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [cartItems],
  )

  const handleCheckout = useCallback(() => {
    // Отправка заказа на API
    console.log("[v0] Оформление заказа:", { user: user.id, items: cartItems })
    const tg = window.Telegram?.WebApp as
      | { sendData?: (data: string) => void }
      | undefined
    tg?.sendData?.(JSON.stringify({ items: cart, total: cartTotal }))
    setCart({})
    setTab("catalog")
  }, [cart, cartItems, cartTotal, user.id])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background pb-24">
      <AppHeader user={user} />

      <main className="flex-1">
        {tab === "catalog" && (
          <CatalogTab
            products={products}
            loading={loading}
            getQuantity={getQuantity}
            onAdd={handleAdd}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onOpen={handleOpen}
          />
        )}

        {tab === "cart" && (
          <CartTab
            items={cartItems}
            total={cartTotal}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onCheckout={handleCheckout}
            onGoCatalog={() => setTab("catalog")}
          />
        )}

        {tab === "profile" && <ProfileTab user={user} />}
      </main>

      <TabBar active={tab} onChange={setTab} cartCount={cartCount} />
    </div>
  )
}
