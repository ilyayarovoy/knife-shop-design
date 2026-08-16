"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"
import { AppHeader } from "@/components/app-header"
import { CartTab } from "@/components/cart-tab"
import { CatalogTab } from "@/components/catalog-tab"
import { FavoritesTab } from "@/components/favorites-tab"
import { ProductDetail } from "@/components/product-detail"
import { ProfileTab } from "@/components/profile-tab"
import { TabBar, type TabKey } from "@/components/tab-bar"
import { apiKeys, fetcher } from "@/lib/api"
import type { Category, Product } from "@/lib/types"
import { useAppUser } from "@/lib/use-app-user"
import { useCart } from "@/lib/use-cart"
import { useFavorites } from "@/lib/use-favorites"

export default function Page() {
  // tgUser — профиль из Telegram; dbUserId — внутренний id из БД для корзины
  const { tgUser, dbUser, dbUserId, isReady, error: userError } = useAppUser()
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

  if (userError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Не удалось загрузить профиль пользователя
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          Перезагрузить
        </button>
      </div>
    )
  }

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
  } = useCart(dbUserId)

  // Избранное с бэкенда (GET/POST/DELETE /api/favorites/...)
  const {
    favorites,
    isLoading: favoritesLoading,
    isFavorite,
    toggle: toggleFavorite,
  } = useFavorites(dbUserId)

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

  const handleToggleFavorite = useCallback(
    (product: Product) => {
      void toggleFavorite(product)
    },
    [toggleFavorite],
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
      <AppHeader user={tgUser} />

      <main className="flex-1">
        {tab === "catalog" && (
          <CatalogTab
            products={products}
            categories={categories}
            loading={productsLoading}
            error={Boolean(productsError)}
            onRetry={() => refetchProducts()}
            getQuantity={getQuantity}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onAdd={handleAdd}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onOpen={handleOpen}
          />
        )}

        {tab === "favorites" && (
          <FavoritesTab
            favorites={favorites}
            loading={favoritesLoading}
            getQuantity={getQuantity}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
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

        {tab === "profile" && <ProfileTab user={tgUser} dbUser={dbUser} />}
      </main>

      <TabBar active={tab} onChange={setTab} cartCount={totalItems} favoritesCount={favorites.length} />

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
