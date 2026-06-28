import type { Category, Product, ServerCart } from "./types"

export const API_BASE = "https://ilyaaaaaaaaaaaaaa-shopy-knife-api.hf.space/api"

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
