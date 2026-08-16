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

interface FavoriteItem {
  id: number
  user_id: number
  product_id: number
  product: Product
  created_at: string
}

export function useFavorites(userId: number | undefined) {
  const key = userId ? apiKeys.favorites(userId) : null

  const { data, isLoading, error, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("[useFavorites] Failed to load favorites for user", userId, ":", err)
    }
  })

  // Сохраняем полные данные items с id для удаления
  const favoriteItems = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
      return data.items
    }
    return []
  }, [data])

  // Извлекаем только products для отображения
  const favorites = useMemo(() => {
    return favoriteItems.map((item: any) => item.product || item).filter(Boolean)
  }, [favoriteItems])

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

      // Оптимистичные данные - просто фильтруем существующие items
      const optimisticItems = wasFavorite
        ? favoriteItems.filter((item: any) => item.product_id !== product.id)
        : favoriteItems

      const optimisticData = {
        items: optimisticItems,
        total_count: optimisticItems.length,
      }

      await mutate(
        async () => {
          if (wasFavorite) {
            const favoriteItem = favoriteItems.find((item: any) => item.product_id === product.id)
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
    [userId, favoriteItems, isFavorite, mutate],
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
