"use client"

import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { CartTab } from "@/components/cart-tab"
import { CatalogTab } from "@/components/catalog-tab"
import { ProductDetail } from "@/components/product-detail"
import { ProfileTab } from "@/components/profile-tab"
import { TabBar, type TabKey } from "@/components/tab-bar"
import { apiKeys, fetcher } from "@/lib/api"
import type { CartItem, Category, Product } from "@/lib/types"
import { useTelegram } from "@/lib/use-telegram"

export default function Page() {
  const { user } = useTelegram()
  const [tab, setTab] = useState<TabKey>("catalog")

  // Каталог: товары и категории с бэкенда
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    mutate: refetchProducts,
  } = useSWR<Product[]>(apiKeys.products(), fetcher)

  const { data: categories = [] } = useSWR<Category[]>(
    apiKeys.categories(),
    fetcher,
  )

  // Корзина: id -> количество (локальное состояние)
  const [cart, setCart] = useState<Record<number, number>>({})

  // Открытый товар для детального просмотра
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null)

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

  // Открытие детального просмотра: ProductDetail догрузит /api/products/{id}
  const handleOpen = useCallback((product: Product) => {
    setOpenedProduct(product)
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
    const tg = window.Telegram?.WebApp as
      | { sendData?: (data: string) => void }
      | undefined
    tg?.sendData?.(JSON.stringify({ items: cart, total: cartTotal }))
    setCart({})
    setTab("catalog")
  }, [cart, cartTotal])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background pb-24">
      <AppHeader user={user} />

      <main className="flex-1">
        {tab === "catalog" && (
          <CatalogTab
            products={products}
            categories={categories}
            loading={productsLoading}
            error={Boolean(productsError)}
            onRetry={() => refetchProducts()}
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

      <ProductDetail
        product={openedProduct}
        quantity={openedProduct ? getQuantity(openedProduct.id) : 0}
        onClose={() => setOpenedProduct(null)}
        onAdd={handleAdd}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  )
}
