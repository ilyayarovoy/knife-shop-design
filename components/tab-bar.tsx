"use client"

import { Heart, LayoutGrid, Package, ShoppingBag, User } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabKey = "catalog" | "favorites" | "cart" | "profile"

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
  cartCount: number
  favoritesCount: number
}

const TABS: { key: TabKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "catalog", label: "Каталог", icon: LayoutGrid },
  { key: "favorites", label: "Избранное", icon: Heart },
  { key: "cart", label: "Корзина", icon: ShoppingBag },
  { key: "profile", label: "Профиль", icon: User },
]

export function TabBar({ active, onChange, cartCount, favoritesCount }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          const count = key === "cart" ? cartCount : key === "favorites" ? favoritesCount : 0
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors",
                isActive ? "text-accent" : "text-muted-foreground",
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {count}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
