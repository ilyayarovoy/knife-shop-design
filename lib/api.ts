import type { Category, DbUser, Product, ServerCart } from "./types"

export const API_BASE = "https://shopy-knife-1.onrender.com/api"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// Универсальный fetcher для SWR
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw new ApiError(`Ошибка запроса: ${res.status}`, res.status)
  }
  return (await res.json()) as T
}

// Ключи для SWR
export const apiKeys = {
  categories: (skip = 0, limit = 100) =>
    `${API_BASE}/categories/all?skip=${skip}&limit=${limit}`,
  products: (skip = 0, limit = 100) =>
    `${API_BASE}/products/all?skip=${skip}&limit=${limit}`,
  product: (id: number) => `${API_BASE}/products/${id}`,
  cart: (userId: number) => `${API_BASE}/cart/user/${userId}`,
  favorites: (userId: number) => `${API_BASE}/favorites/user/${userId}`,
  favorite: (userId: number, productId: number) =>
    `${API_BASE}/favorites/user/${userId}/check/${productId}`,
  orders: (userId: number) => `${API_BASE}/orders/user/${userId}`,
  order: (orderId: number) => `${API_BASE}/orders/${orderId}`,
}

// Прямые вызовы (если нужны вне SWR)
export function getCategories(skip = 0, limit = 100) {
  return fetcher<Category[]>(apiKeys.categories(skip, limit))
}

export function getProducts(skip = 0, limit = 100) {
  return fetcher<Product[]>(apiKeys.products(skip, limit))
}

export function getProduct(id: number) {
  return fetcher<Product>(apiKeys.product(id))
}

export function getCart(userId: number) {
  return fetcher<ServerCart>(apiKeys.cart(userId))
}

// --- Пользователи ---

// GET /api/users/{tg_id} — поиск по Telegram ID
export function getUserByTgId(tgId: number) {
  return fetcher<DbUser>(`${API_BASE}/users/${tgId}`)
}

interface CreateUserPayload {
  tg_id: number
  username?: string | null
  first_name?: string | null
  last_name?: string | null
}

// Get-or-create: ищем пользователя по tg_id, при 404 — создаём и перечитываем.
// Возвращает запись из БД с внутренним id (нужен для корзины).
export async function getOrCreateUser(
  payload: CreateUserPayload,
): Promise<DbUser> {
  const res = await fetch(`${API_BASE}/users/${payload.tg_id}`, {
    headers: { Accept: "application/json" },
  })

  if (res.ok) {
    return (await res.json()) as DbUser
  }

  if (res.status !== 404) {
    throw new ApiError(`Ошибка запроса пользователя: ${res.status}`, res.status)
  }

  // Пользователя нет — регистрируем
  await mutateRequest(`${API_BASE}/users`, "POST", payload)
  // Перечитываем, чтобы гарантированно получить внутренний id
  return getUserByTgId(payload.tg_id)
}

// Универсальный помощник для POST/PUT/DELETE.
// ВАЖНО: DELETE (и некоторые PUT/POST) могут отвечать без тела (204 No Content).
// Раньше здесь всегда стоял res.json(), который на пустом теле кидал
// "Unexpected end of JSON input" — SWR ловил это как ошибку мутации и откатывал
// оптимистичное обновление, из-за чего удалённый товар "на секунду" исчезал
// и тут же возвращался обратно в UI, хотя на бэкенде уже был удалён.
async function mutateRequest<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    throw new ApiError(`Ошибка запроса: ${res.status}`, res.status)
  }

  // Нет содержимого — не пытаемся парсить JSON
  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

// POST /api/cart/user/{userId}/add
export function addToCart(userId: number, productId: number, quantity = 1) {
  return mutateRequest(`${API_BASE}/cart/user/${userId}/add`, "POST", {
    product_id: productId,
    quantity,
  })
}

// PUT /api/cart/user/{userId}/item/{itemId}
export function updateCartItem(
  userId: number,
  itemId: number,
  quantity: number,
) {
  return mutateRequest(
    `${API_BASE}/cart/user/${userId}/item/${itemId}`,
    "PUT",
    { quantity },
  )
}

// DELETE /api/cart/user/{userId}/item/{itemId}
export function removeCartItem(userId: number, itemId: number) {
  return mutateRequest(
    `${API_BASE}/cart/user/${userId}/item/${itemId}`,
    "DELETE",
  )
}

// DELETE /api/cart/user/{userId}/clear
export function clearCart(userId: number) {
  return mutateRequest(`${API_BASE}/cart/user/${userId}/clear`, "DELETE")
}

// --- Избранное ---

interface FavoritesResponse {
  items?: Product[]
  total_count?: number
}

// GET /api/favorites/user/{userId}
export function getFavorites(userId: number) {
  return fetcher<FavoritesResponse | Product[]>(`${API_BASE}/favorites/user/${userId}`)
}

// POST /api/favorites/user/{userId}/add
export function addToFavorites(userId: number, productId: number) {
  return mutateRequest(`${API_BASE}/favorites/user/${userId}/add`, "POST", {
    product_id: productId,
  })
}

// DELETE /api/favorites/user/{userId}/item/{itemId}
export function removeFromFavorites(userId: number, itemId: number) {
  return mutateRequest(
    `${API_BASE}/favorites/user/${userId}/item/${itemId}`,
    "DELETE",
  )
}

// GET /api/favorites/user/{userId}/check/{productId}
export function checkFavorite(userId: number, productId: number) {
  return fetcher<boolean>(`${API_BASE}/favorites/user/${userId}/check/${productId}`)
}

// --- Заказы ---

// POST /api/orders/user/{userId}/checkout
export function createOrder(userId: number) {
  return mutateRequest<{ order_id: number; message: string }>(
    `${API_BASE}/orders/user/${userId}/checkout`,
    "POST",
  )
}

// GET /api/orders/user/{userId}
export function getUserOrders(userId: number) {
  return fetcher<import("./types").Order[]>(apiKeys.orders(userId))
}

// GET /api/orders/{orderId}
export function getOrder(orderId: number) {
  return fetcher<import("./types").OrderWithItems>(apiKeys.order(orderId))
}

// PUT /api/orders/{orderId}/user/{userId}/status
export function updateOrderStatus(
  orderId: number,
  userId: number,
  status: "new" | "done",
) {
  return mutateRequest(
    `${API_BASE}/orders/${orderId}/user/${userId}/status`,
    "PUT",
    { status },
  )
}