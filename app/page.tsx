"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { CartTab } from "@/components/cart-tab"
import { CatalogTab } from "@/components/catalog-tab"
import { ProductDetail } from "@/components/product-detail"
import { ProfileTab } from "@/components/profile-tab"
import { TabBar, type TabKey } from "@/components/tab-bar"
import { apiKeys, fetcher } from "@/lib/api"
import type { Category, Product } from "@/lib/types"
import { useCart } from "@/lib/use-cart"
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

  // Корзина с бэкенда (GET/POST/PUT/DELETE /api/cart/...)
  const {
    cartItems,
    totalItems,
    totalPrice,
    isLoading: cartLoading,
    getQuantity,
    addByProduct,
    incrementByProduct,
    decrementByProduct,
    removeByProduct,
    clear,
  } = useCart(user?.id)

  // Открытый товар для детального просмотра
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null)

  const handleAdd = useCallback(
    (product: Product) => {
      void addByProduct(product)
    },
    [addByProduct],
  )

  const handleIncrement = useCallback(
    (id: number) => {
      void incrementByProduct(id)
    },
    [incrementByProduct],
  )

  const handleDecrement = useCallback(
    (id: number) => {
      void decrementByProduct(id)
    },
    [decrementByProduct],
  )

  const handleRemove = useCallback(
    (id: number) => {
      void removeByProduct(id)
    },
    [removeByProduct],
  )

  // Открытие детального просмотра: ProductDetail догрузит /api/products/{id}
  const handleOpen = useCallback((product: Product) => {
    setOpenedProduct(product)
  }, [])

  const handleCheckout = useCallback(() => {
    const tg = window.Telegram?.WebApp as
      | { sendData?: (data: string) => void }
      | undefined
    tg?.sendData?.(
      JSON.stringify({
        items: cartItems.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        total: totalPrice,
      }),
    )
    void clear()
    setTab("catalog")
  }, [cartItems, totalPrice, clear])

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
            total={totalPrice}
            loading={cartLoading}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            onCheckout={handleCheckout}
            onGoCatalog={() => setTab("catalog")}
          />
        )}

        {tab === "profile" && <ProfileTab user={user} />}
      </main>

      <TabBar active={tab} onChange={setTab} cartCount={totalItems} />

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
