"use client"

import { Minus, Plus } from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  quantity: number
  onAdd: (product: Product) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onOpen: (product: Product) => void
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onOpen,
}: ProductCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="relative aspect-square w-full overflow-hidden bg-secondary"
        aria-label={`Открыть ${product.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
        {product.stock <= 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur">
            Нет в наличии
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold leading-tight text-balance">
            {product.title}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-bold tabular-nums">
            {formatPrice(product.price)}
          </span>
        </div>

        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="flex h-9 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground transition active:scale-[0.97]"
          >
            В корзину
          </button>
        ) : (
          <div className="flex h-9 items-center justify-between rounded-xl bg-secondary px-1">
            <button
              type="button"
              onClick={() => onDecrement(product.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-foreground transition active:scale-90"
              aria-label="Уменьшить количество"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => onIncrement(product.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground transition active:scale-90"
              aria-label="Увеличить количество"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square w-full animate-pulse bg-secondary" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-2.5 w-full animate-pulse rounded bg-secondary" />
        <div className="h-2.5 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="mt-1 h-4 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="mt-1 h-9 w-full animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  )
}
