"use client"

import { useCallback, useMemo } from "react"
import useSWR from "swr"
import {
  addToFavorites,
  apiKeys,
  fetcher,
  getFavorites,
  removeFromFavorites,
} from "./api"
import type { Product } from "./types"

export function useFavorites(userId: number | undefined) {
  const key = userId ? apiKeys.favorites(userId) : null

  const { data, isLoading, error, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("[useFavorites] Failed to load favorites for user", userId, ":", err)
    }
  })

  const favorites = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
      // API возвращает {items: ServerFavoriteItem[]}, нужно извлечь product из каждого item
      return data.items.map((item: any) => item.product || item).filter(Boolean)
    }
    return []
  }, [data])

  const favoritesMap = useMemo(() => {
    return new Set(favorites.map((p) => p.id))
  }, [favorites])

  const isFavorite = useCallback(
    (productId: number) => favoritesMap.has(productId),
    [favoritesMap],
  )

  const toggle = useCallback(
    async (product: Product) => {
      if (!userId) return
      const wasFavorite = isFavorite(product.id)

      const optimisticItems = wasFavorite
        ? favorites.filter((p) => p.id !== product.id)
        : [...favorites, product]

      // Оптимистичные данные должны быть в том же формате, что API возвращает
      const optimisticData = {
        items: optimisticItems,
        total_count: optimisticItems.length,
      }

      await mutate(
        async () => {
          if (wasFavorite) {
            // Найти item.id для удаления (это ID favorite item, а не product_id)
            const favoriteItem = data?.items?.find((item: any) => item.product_id === product.id)
            if (favoriteItem) {
              await removeFromFavorites(userId, favoriteItem.id)
            }
          } else {
            await addToFavorites(userId, product.id)
          }
          return getFavorites(userId)
        },
        {
          optimisticData,
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [userId, favorites, isFavorite, mutate, data],
  )

  const add = useCallback(
    (product: Product) => {
      if (!isFavorite(product.id)) {
        return toggle(product)
      }
      return Promise.resolve()
    },
    [isFavorite, toggle],
  )

  const remove = useCallback(
    (product: Product) => {
      if (isFavorite(product.id)) {
        return toggle(product)
      }
      return Promise.resolve()
    },
    [isFavorite, toggle],
  )

  return {
    favorites,
    isLoading,
    error: Boolean(error),
    isFavorite,
    toggle,
    add,
    remove,
  }
}
