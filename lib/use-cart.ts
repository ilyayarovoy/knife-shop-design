"use client"

import { useCallback, useMemo } from "react"
import useSWR from "swr"
import {
  addToCart,
  apiKeys,
  clearCart,
  fetcher,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./api"
import type { CartItem, Product, ServerCart, ServerCartItem } from "./types"

const EMPTY_CART: ServerCart = { items: [], total_items: 0, total_price: 0 }

function recompute(items: ServerCartItem[]): ServerCart {
  return {
    items,
    total_items: items.reduce((sum, i) => sum + i.quantity, 0),
    total_price: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  }
}

export function useCart(userId: number | undefined) {
  const key = userId ? apiKeys.cart(userId) : null

  const { data, isLoading, error, mutate } = useSWR<ServerCart>(key, fetcher, {
    revalidateOnFocus: false,
  })

  const cart = data ?? EMPTY_CART
  const items = cart.items

  const cartItems: CartItem[] = useMemo(
    () => items.map((i) => ({ product: i.product, quantity: i.quantity })),
    [items],
  )

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  )

  const getQuantity = useCallback(
    (productId: number) =>
      items.find((i) => i.product_id === productId)?.quantity ?? 0,
    [items],
  )

  // Добавить товар (или увеличить, если уже в корзине)
  const addByProduct = useCallback(
    async (product: Product, quantity = 1) => {
      if (!userId) return
      const existing = items.find((i) => i.product_id === product.id)
      const optimisticItems = existing
        ? items.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        : [
            ...items,
            {
              id: -product.id, // временный id, заменится после ответа сервера
              user_id: userId,
              product_id: product.id,
              quantity,
              product,
            } satisfies ServerCartItem,
          ]

      await mutate(
        async () => {
          await addToCart(userId, product.id, quantity)
          return getCart(userId)
        },
        {
          optimisticData: recompute(optimisticItems),
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [userId, items, mutate],
  )

  const setItemQuantity = useCallback(
    async (item: ServerCartItem, quantity: number) => {
      if (!userId) return
      const optimisticItems = items.map((i) =>
        i.id === item.id ? { ...i, quantity } : i,
      )
      await mutate(
        async () => {
          await updateCartItem(userId, item.id, quantity)
          return getCart(userId)
        },
        {
          optimisticData: recompute(optimisticItems),
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [userId, items, mutate],
  )

  const removeItem = useCallback(
    async (item: ServerCartItem) => {
      if (!userId) return
      const optimisticItems = items.filter((i) => i.id !== item.id)
      await mutate(
        async () => {
          await removeCartItem(userId, item.id)
          return getCart(userId)
        },
        {
          optimisticData: recompute(optimisticItems),
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [userId, items, mutate],
  )

  // Операции по productId — удобно для каталога и карточки товара
  const incrementByProduct = useCallback(
    (productId: number) => {
      const item = items.find((i) => i.product_id === productId)
      if (item) return setItemQuantity(item, item.quantity + 1)
      return Promise.resolve()
    },
    [items, setItemQuantity],
  )

  const decrementByProduct = useCallback(
    (productId: number) => {
      const item = items.find((i) => i.product_id === productId)
      if (!item) return Promise.resolve()
      if (item.quantity <= 1) return removeItem(item)
      return setItemQuantity(item, item.quantity - 1)
    },
    [items, setItemQuantity, removeItem],
  )

  const removeByProduct = useCallback(
    (productId: number) => {
      const item = items.find((i) => i.product_id === productId)
      if (item) return removeItem(item)
      return Promise.resolve()
    },
    [items, removeItem],
  )

  const clear = useCallback(async () => {
    if (!userId) return
    await mutate(
      async () => {
        await clearCart(userId)
        return EMPTY_CART
      },
      {
        optimisticData: EMPTY_CART,
        rollbackOnError: true,
        revalidate: false,
      },
    )
  }, [userId, mutate])

  return {
    cartItems,
    totalItems,
    totalPrice,
    isLoading,
    error: Boolean(error),
    getQuantity,
    addByProduct,
    incrementByProduct,
    decrementByProduct,
    removeByProduct,
    clear,
  }
}
