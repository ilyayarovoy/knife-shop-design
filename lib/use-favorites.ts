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

  const { data, isLoading, error, mutate } = useSWR<Product[]>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
  })

  const favorites = Array.isArray(data) ? data : []

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

      const optimisticFavorites = wasFavorite
        ? favorites.filter((p) => p.id !== product.id)
        : [...favorites, product]

      await mutate(
        async () => {
          if (wasFavorite) {
            await removeFromFavorites(userId, product.id)
          } else {
            await addToFavorites(userId, product.id)
          }
          return optimisticFavorites
        },
        {
          optimisticData: optimisticFavorites,
          rollbackOnError: true,
          revalidate: false,
        },
      )
    },
    [userId, favorites, isFavorite, mutate],
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
