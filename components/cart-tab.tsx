"use client"

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import type { CartItem } from "@/lib/types"

interface CartTabProps {
  items: CartItem[]
  total: number
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onRemove: (id: number) => void
  onCheckout: () => void
  onGoCatalog: () => void
}

export function CartTab({
  items,
  total,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  onGoCatalog,
}: CartTabProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Корзина пуста</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Добавьте ножи из каталога, чтобы оформить заказ
          </p>
        </div>
        <button
          type="button"
          onClick={onGoCatalog}
          className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          Перейти в каталог
        </button>
      </div>
    )
  }

  const delivery = 0

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <h1 className="text-lg font-semibold">Корзина</h1>

      <ul className="flex flex-col gap-3">
        {items.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">
                  {product.title}
                </h3>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  className="shrink-0 text-muted-foreground transition active:scale-90"
                  aria-label="Удалить товар"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatPrice(product.price)}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                  <button
                    type="button"
                    onClick={() => onDecrement(product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-background active:scale-90"
                    aria-label="Уменьшить"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground active:scale-90"
                    aria-label="Увеличить"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-sm font-bold tabular-nums">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Товары</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Доставка</span>
          <span className="text-accent">Бесплатно</span>
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="flex justify-between text-base font-bold">
          <span>Итого</span>
          <span className="tabular-nums">{formatPrice(total + delivery)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground transition active:scale-[0.98]"
      >
        Оформить заказ · {formatPrice(total + delivery)}
      </button>
    </div>
  )
}
