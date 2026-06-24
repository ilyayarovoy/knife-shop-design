"use client"

import {
  ChevronRight,
  Heart,
  Info,
  LifeBuoy,
  Package,
} from "lucide-react"
import { formatPrice, MOCK_ORDERS } from "@/lib/mock-data"
import type { Order, TelegramUser } from "@/lib/types"

interface ProfileTabProps {
  user: TelegramUser
}

const MENU = [
  { key: "orders", label: "Мои заказы", icon: Package },
  { key: "favorites", label: "Избранное", icon: Heart },
  { key: "support", label: "Поддержка", icon: LifeBuoy },
  { key: "about", label: "О нас", icon: Info },
]

function StatusBadge({ status }: { status: Order["status"] }) {
  const isDelivered = status === "delivered"
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
        (isDelivered
          ? "bg-secondary text-muted-foreground"
          : "bg-accent/15 text-accent")
      }
    >
      {isDelivered ? "Доставлен" : "В пути"}
    </span>
  )
}

export function ProfileTab({ user }: ProfileTabProps) {
  const initials = user.firstName.charAt(0).toUpperCase()
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")

  return (
    <div className="flex flex-col gap-5 px-4 pt-4">
      {/* Блок пользователя */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary text-xl font-bold">
          {user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoUrl || "/placeholder.svg"}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold leading-tight">{fullName}</h2>
          {user.username && (
            <span className="text-sm text-muted-foreground">
              @{user.username}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            Telegram ID: {user.id}
          </span>
        </div>
      </div>

      {/* Меню */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {MENU.map(({ key, label, icon: Icon }, i) => (
          <button
            key={key}
            type="button"
            className={
              "flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-secondary " +
              (i !== MENU.length - 1 ? "border-b border-border" : "")
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5 text-foreground" />
            </span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* История заказов */}
      <div className="flex flex-col gap-3">
        <h3 className="px-1 text-sm font-semibold">История заказов</h3>
        <ul className="flex flex-col gap-3">
          {MOCK_ORDERS.map((order) => (
            <li
              key={order.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">№ {order.id}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{order.date}</span>
                <span>{order.itemsCount} тов.</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">Сумма</span>
                <span className="text-sm font-bold tabular-nums">
                  {formatPrice(order.total)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
