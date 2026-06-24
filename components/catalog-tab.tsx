"use client"

import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Product, ProductCategory } from "@/lib/types"
import { ProductCard, ProductCardSkeleton } from "./product-card"

type FilterKey = "all" | ProductCategory

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "hunting", label: "Охотничьи" },
  { key: "folding", label: "Складные" },
  { key: "kitchen", label: "Кухонные" },
]

interface CatalogTabProps {
  products: Product[]
  loading: boolean
  getQuantity: (id: number) => number
  onAdd: (product: Product) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onOpen: (product: Product) => void
}

export function CatalogTab({
  products,
  loading,
  getQuantity,
  onAdd,
  onIncrement,
  onDecrement,
  onOpen,
}: CatalogTabProps) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesFilter = filter === "all" || p.category === filter
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [products, filter, query])

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
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
              filter === key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
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
