"use client"

import { Heart } from "lucide-react"
import { useCallback } from "react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { ProductCard, ProductCardSkeleton } from "./product-card"

interface FavoritesTabProps {
  favorites: Product[]
  loading: boolean
  getQuantity: (id: number) => number
  isFavorite: (id: number) => boolean
  onToggleFavorite: (product: Product) => void
  onAdd: (product: Product) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onOpen: (product: Product) => void
}

export function FavoritesTab({
  favorites,
  loading,
  getQuantity,
  isFavorite,
  onToggleFavorite,
  onAdd,
  onIncrement,
  onDecrement,
  onOpen,
}: FavoritesTabProps) {
  const handleToggleFavorite = useCallback(
    (product: Product) => {
      void onToggleFavorite(product)
    },
    [onToggleFavorite],
  )

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            У вас пока нет избранных товаров
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantity(product.id)}
              isFavorite={isFavorite(product.id)}
              onToggleFavorite={onToggleFavorite}
              onAdd={onAdd}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  )
}
