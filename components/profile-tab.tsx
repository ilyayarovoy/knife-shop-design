"use client"

import { ChevronRight, Heart, Info, LifeBuoy, Package } from "lucide-react"
import type { DbUser, TelegramUser } from "@/lib/types"

interface ProfileTabProps {
  user: TelegramUser
  dbUser?: DbUser
  onNavigate?: (tab: string) => void
}

const MENU = [
  { key: "orders", label: "Мои заказы", icon: Package },
  { key: "favorites", label: "Избранное", icon: Heart },
  { key: "support", label: "Поддержка", icon: LifeBuoy },
  { key: "about", label: "О нас", icon: Info },
]

function formatJoinDate(iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function ProfileTab({ user, dbUser, onNavigate }: ProfileTabProps) {
  const initials = user.firstName.charAt(0).toUpperCase()
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
  const joinDate = formatJoinDate(dbUser?.created_at)

  const handleMenuClick = (key: string) => {
    if (key === "favorites" && onNavigate) {
      onNavigate("favorites")
    }
  }

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

      {/* Статус аккаунта в БД */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Аккаунт</span>
          <span className="text-[11px] text-muted-foreground">
            {dbUser
              ? joinDate
                ? `С нами с ${joinDate}`
                : "Профиль синхронизирован"
              : "Синхронизация профиля…"}
          </span>
        </div>
        <span
          className={
            "h-2.5 w-2.5 rounded-full " +
            (dbUser ? "bg-accent" : "bg-muted-foreground/40")
          }
          aria-hidden="true"
        />
      </div>

      {/* Меню */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {MENU.map(({ key, label, icon: Icon }, i) => (
          <button
            key={key}
            type="button"
            onClick={() => handleMenuClick(key)}
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
    </div>
  )
}
