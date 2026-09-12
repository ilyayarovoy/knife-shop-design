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

// Заглушка пользователя на случай запуска вне Telegram (превью в браузере).
// id — это tg_id существующего в БД тестового пользователя,
// чтобы get-or-create нашёл его и корзина работала в превью.
const FALLBACK_USER: TelegramUser = {
  id: 8,
  firstName: "Test",
  username: "test_user",
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser>(FALLBACK_USER)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    // SDK-скрипт может ещё не успеть загрузиться к моменту первого рендера,
    // поэтому ждём появления window.Telegram.WebApp с несколькими попытками.
    function init() {
      const tg = window.Telegram?.WebApp
      const tgUser = tg?.initDataUnsafe?.user

      console.log('[useTelegram] Attempt', attempts, 'window.Telegram:', !!window.Telegram)
      console.log('[useTelegram] WebApp:', !!tg)
      console.log('[useTelegram] initDataUnsafe:', tg?.initDataUnsafe)
      console.log('[useTelegram] user:', tgUser)

      // Проверяем что WebApp загрузился
      if (tg) {
        // Если есть пользователь — используем его
        if (tgUser && tgUser.id) {
          console.log("[useTelegram] Telegram user detected:", tgUser.id, tgUser.username || 'no username')
          tg.ready()
          tg.expand()
          tg.setHeaderColor?.("#0a0a0b")
          tg.setBackgroundColor?.("#0a0a0b")
          setUser({
            id: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            username: tgUser.username,
            photoUrl: tgUser.photo_url,
          })
          setIsReady(true)
          return
        }

        // WebApp есть, но пользователя нет после 30 попыток — используем fallback
        if (attempts >= 30) {
          console.warn("[useTelegram] Telegram WebApp loaded but user data not available, using fallback")
          tg.ready()
          tg.expand()
          tg.setHeaderColor?.("#0a0a0b")
          tg.setBackgroundColor?.("#0a0a0b")
          setIsReady(true)
          return
        }
      }

      // Ещё не готово — пробуем снова (до ~3 секунд)
      if (attempts < 30 && !cancelled) {
        attempts += 1
        setTimeout(init, 100)
        return
      }

      // Telegram так и не появился — значит запуск вне Telegram (превью в браузере)
      console.log("[useTelegram] Telegram WebApp not found after", attempts, "attempts, using fallback user")
      setIsReady(true)
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  return { user, isReady }
}
