// Категория с бэкенда: GET /api/categories/all
export interface Category {
  id: number
  name: string
  description: string
  slug: string
  created_at?: string
}

// Товар с бэкенда: GET /api/products/all, GET /api/products/{id}
export interface Product {
  id: number
  category_id: number
  title: string
  description: string
  price: number
  stock: number
  images: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

// Элемент корзины с бэкенда: GET /api/cart/user/{id}
export interface ServerCartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  product: Product
  created_at?: string
}

export interface ServerCart {
  items: ServerCartItem[]
  total_items: number
  total_price: number
}

// Данные пользователя из Telegram WebApp (initDataUnsafe.user)
export interface TelegramUser {
  id: number // это Telegram ID (tg_id), НЕ внутренний id в БД
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
}

// Пользователь из нашей БД: GET /api/users/{tg_id}, POST /api/users
export interface DbUser {
  id: number // внутренний id, используется для корзины /api/cart/user/{id}
  tg_id: number
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  created_at?: string
}
