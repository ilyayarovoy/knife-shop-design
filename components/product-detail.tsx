"use client"

import { Minus, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { apiKeys, fetcher } from "@/lib/api"
import { formatPrice } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface ProductDetailProps {
  // Базовые данные товара (из каталога) для мгновенного показа
  product: Product | null
  quantity: number
  onClose: () => void
  onAdd: (product: Product) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
}

export function ProductDetail({
  product,
  quantity,
  onClose,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductDetailProps) {
  const open = product !== null

  // Догружаем полную карточку по id: GET /api/products/{id}
  const { data: fullProduct, isLoading } = useSWR<Product>(
    product ? apiKeys.product(product.id) : null,
    fetcher,
  )

  // Активное изображение в галерее
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product?.id])

  // Блокируем прокрутку фона, когда панель открыта
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  if (!product) return null

  // Пока грузится — показываем данные из каталога
  const data = fullProduct ?? product
  const images = data.images?.length ? data.images : ["/placeholder.svg"]
  const inStock = data.stock > 0

  return (
    <div className="fixed inset-0 z-50">
      {/* Затемнение */}
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Панель */}
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-background">
        <div className="relative flex shrink-0 items-center justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-border" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Главное изображение */}
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage] || "/placeholder.svg"}
              alt={data.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>

          {/* Миниатюры */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={
                    "h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition " +
                    (i === activeImage ? "border-accent" : "border-transparent")
                  }
                  aria-label={`Фото ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src || "/placeholder.svg"}
                    alt={`${data.title} — фото ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Заголовок и цена */}
          <div className="mt-4 flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold leading-tight text-balance">
              {data.title}
            </h2>
            <span className="shrink-0 text-xl font-bold tabular-nums">
              {formatPrice(data.price)}
            </span>
          </div>

          {/* Наличие */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={
                "h-2 w-2 rounded-full " +
                (inStock ? "bg-accent" : "bg-muted-foreground")
              }
            />
            <span className="text-xs text-muted-foreground">
              {inStock ? `В наличии: ${data.stock} шт.` : "Нет в наличии"}
            </span>
          </div>

          {/* Описание */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Описание</h3>
            {isLoading && !fullProduct ? (
              <div className="flex flex-col gap-2">
                <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {data.description || "Описание отсутствует."}
              </p>
            )}
          </div>
        </div>

        {/* Нижняя панель действий */}
        <div className="shrink-0 border-t border-border bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {quantity === 0 ? (
            <button
              type="button"
              disabled={!inStock}
              onClick={() => onAdd(data)}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground transition active:scale-[0.98] disabled:opacity-40"
            >
              {inStock ? "Добавить в корзину" : "Нет в наличии"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 flex-1 items-center justify-between rounded-xl bg-secondary px-2">
                <button
                  type="button"
                  onClick={() => onDecrement(data.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground transition active:scale-90"
                  aria-label="Уменьшить количество"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-base font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(data.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition active:scale-90"
                  aria-label="Увеличить количество"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-base font-bold tabular-nums">
                {formatPrice(data.price * quantity)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
