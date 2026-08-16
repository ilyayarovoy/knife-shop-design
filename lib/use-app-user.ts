"use client"

import useSWR from "swr"
import { getOrCreateUser } from "./api"
import type { DbUser, TelegramUser } from "./types"
import { useTelegram } from "./use-telegram"

interface UseAppUser {
  tgUser: TelegramUser // профиль из Telegram (имя, фото, username)
  dbUser: DbUser | undefined // запись из нашей БД
  dbUserId: number | undefined // внутренний id для корзины
  isReady: boolean
  isRegistering: boolean
  error: boolean
}

/**
 * Резолвит пользователя приложения:
 * 1. Берёт данные из Telegram WebApp (tg_id, имя, username).
 * 2. Делает get-or-create в БД (GET /api/users/{tg_id}, при 404 — POST /api/users).
 * 3. Возвращает внутренний id, который нужен эндпоинтам корзины.
 */
export function useAppUser(): UseAppUser {
  const { user, isReady } = useTelegram()

  const {
    data: dbUser,
    isLoading,
    error,
  } = useSWR(
    // Ждём готовности Telegram SDK, ключ завязан на tg_id
    isReady ? ["app-user", user.id] : null,
    () =>
      getOrCreateUser({
        tg_id: user.id,
        username: user.username ?? null,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
      }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      onError: (err) => {
        console.error("[useAppUser] Failed to load user:", err)
      }
    },
  )

  return {
    tgUser: user,
    dbUser,
    dbUserId: dbUser?.id,
    isReady: isReady && !isLoading,
    isRegistering: isReady && isLoading,
    error: Boolean(error),
  }
}
