"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/lib/types"
import { ProductCard, ProductCardSkeleton } from "./product-card"

interface CatalogTabProps {
  products: Product[]
  categories: Category[]
  loading: boolean
  error?: boolean
  onRetry?: () => void
  getQuantity: (id: number) => number
  onAdd: (product: Product) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onOpen: (product: Product) => void
}

export function CatalogTab({
  products,
  categories,
  loading,
  error,
  onRetry,
  getQuantity,
  onAdd,
  onIncrement,
  onDecrement,
  onOpen,
}: CatalogTabProps) {
  const [query, setQuery] = useState("")
  // null = "Все", иначе id категории
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === null || p.category_id === activeCategory
      const q = query.toLowerCase()
      const matchesQuery =
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [products, activeCategory, query])

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по каталогу"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-accent"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
            activeCategory === null
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              activeCategory === cat.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground text-pretty">
            Не удалось загрузить каталог. Проверьте соединение.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
            >
              Повторить
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Ничего не найдено
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantity(product.id)}
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
