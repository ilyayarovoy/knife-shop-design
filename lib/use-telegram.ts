"use client"

import { useEffect, useState } from "react"
import type { TelegramUser } from "./types"

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  initDataUnsafe?: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      photo_url?: string
    }
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

// Заглушка пользователя на случай запуска вне Telegram.
// id=3 — существующий в БД тестовый пользователь, чтобы корзина работала в превью.
const FALLBACK_USER: TelegramUser = {
  id: 3,
  firstName: "Илья",
  username: "ilya_craft",
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser>(FALLBACK_USER)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.setHeaderColor?.("#0a0a0b")
      tg.setBackgroundColor?.("#0a0a0b")
      const tgUser = tg.initDataUnsafe?.user
      if (tgUser) {
        setUser({
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          photoUrl: tgUser.photo_url,
        })
      }
    }
    setIsReady(true)
  }, [])

  return { user, isReady }
}
