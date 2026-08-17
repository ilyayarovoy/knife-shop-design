"use client"

import { Package } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/lib/types"

interface OrdersTabProps {
  orders: Order[]
  loading?: boolean
  onNavigate: (tab: string) => void
}

export function OrdersTab({ orders, loading = false, onNavigate }: OrdersTabProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="h-6 w-32 animate-pulse rounded-md bg-card" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Нет заказов</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Оформите первый заказ, чтобы увидеть его здесь
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("catalog")}
          className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          Перейти в каталог
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <h1 className="text-lg font-semibold">Мои заказы</h1>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Заказ №{order.id}
                </span>
                <span className="text-sm font-semibold">
                  {formatPrice(order.total_price)}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  order.status === "done"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {order.status === "done" ? "Выполнен" : "Новый"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
