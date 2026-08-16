"use client"

import { ChevronRight, Flame, Hammer, Heart, Info, LifeBuoy, Package, Send, ShieldCheck } from "lucide-react"
import { useState } from "react"
import type { DbUser, TelegramUser } from "@/lib/types"
import { InfoSheet } from "./info-sheet"

interface ProfileTabProps {
  user: TelegramUser
  dbUser?: DbUser
  onNavigate?: (tab: string) => void
}

const SUPPORT_TELEGRAM = "Avarde808"
const SUPPORT_URL = `https://t.me/${SUPPORT_TELEGRAM}`

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

// Открывает чат с поддержкой: внутри Telegram Mini App — через нативный
// openTelegramLink (не выкидывает из приложения), в браузере — обычной вкладкой.
function openSupportChat() {
  const tg = window.Telegram?.WebApp as
    | { openTelegramLink?: (url: string) => void }
    | undefined

  if (tg?.openTelegramLink) {
    tg.openTelegramLink(SUPPORT_URL)
  } else {
    window.open(SUPPORT_URL, "_blank", "noopener,noreferrer")
  }
}

export function ProfileTab({ user, dbUser, onNavigate }: ProfileTabProps) {
  const [aboutOpen, setAboutOpen] = useState(false)

  const initials = user.firstName.charAt(0).toUpperCase()
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ")
  const joinDate = formatJoinDate(dbUser?.created_at)

  const handleMenuClick = (key: string) => {
    if (key === "favorites" && onNavigate) {
      onNavigate("favorites")
    }
    if (key === "support") {
      openSupportChat()
    }
    if (key === "about") {
      setAboutOpen(true)
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

      {/* Шторка "О нас" */}
      <InfoSheet
        open={aboutOpen}
        title="О нас"
        onClose={() => setAboutOpen(false)}
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            «Кузница» — небольшая мастерская крафтовых ножей ручной работы.
            Мы не перепродаём чужие изделия: каждый нож проходит через наши
            руки от куска стали до готового клинка.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Flame className="h-5 w-5 text-accent" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Куём сами</span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Ковка, закалка и заточка — весь цикл производства у нас в
                  мастерской, без посредников.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Hammer className="h-5 w-5 text-accent" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Ручная работа</span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Каждый нож уникален: без конвейера и массового
                  производства.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Гарантия качества</span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Проверяем каждый клинок перед отправкой — на баланс,
                  заточку и качество сборки.
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setAboutOpen(false)
              openSupportChat()
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-accent-foreground transition active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            Написать нам в Telegram
          </button>
        </div>
      </InfoSheet>
    </div>
  )
}
