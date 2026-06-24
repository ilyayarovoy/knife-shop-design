"use client"

import { Sword } from "lucide-react"
import type { TelegramUser } from "@/lib/types"

interface AppHeaderProps {
  user: TelegramUser
}

export function AppHeader({ user }: AppHeaderProps) {
  const initials = user.firstName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Sword className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Кузница</span>
          <span className="text-[11px] text-muted-foreground">
            крафтовые ножи
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[11px] text-muted-foreground">
            Добро пожаловать
          </span>
          <span className="text-sm font-medium">{user.firstName}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold">
          {user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoUrl || "/placeholder.svg"}
              alt={user.firstName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  )
}
