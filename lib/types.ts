export type ProductCategory = "hunting" | "folding" | "kitchen"

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: ProductCategory
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  date: string
  status: "delivered" | "in_transit"
  total: number
  itemsCount: number
}

export interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hunting: "Охотничьи",
  folding: "Складные",
  kitchen: "Кухонные",
}
