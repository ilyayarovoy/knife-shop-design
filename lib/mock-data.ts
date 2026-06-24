import type { Order, Product } from "./types"

// Заглушка для товаров. В продакшене заменить на запрос:
// GET /api/products/all?skip=0&limit=100
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Баварский клин",
    description: "Охотничий нож, кованая сталь, орех",
    price: 8900,
    image: "/knives/hunting-bavarian.png",
    category: "hunting",
  },
  {
    id: 2,
    name: "Тактик Дамаск",
    description: "Складной нож, дамасская сталь, титан",
    price: 12400,
    image: "/knives/folding-tactical.png",
    category: "folding",
  },
  {
    id: 3,
    name: "Шеф Кокусан",
    description: "Поварской нож, дамаск, эбеновое дерево",
    price: 15600,
    image: "/knives/kitchen-chef.png",
    category: "kitchen",
  },
  {
    id: 4,
    name: "Следопыт",
    description: "Бушкрафт нож, углеродная сталь, кожа",
    price: 7300,
    image: "/knives/hunting-tracker.png",
    category: "hunting",
  },
  {
    id: 5,
    name: "Эверидей Карбон",
    description: "EDC складной, карбон, сатин-финиш",
    price: 9800,
    image: "/knives/folding-edc.png",
    category: "folding",
  },
  {
    id: 6,
    name: "Сантоку Олива",
    description: "Кухонный нож, кованая сталь, олива",
    price: 11200,
    image: "/knives/kitchen-santoku.png",
    category: "kitchen",
  },
]

// Заглушка истории заказов
export const MOCK_ORDERS: Order[] = [
  {
    id: "KNF-10428",
    date: "12 июня 2026",
    status: "in_transit",
    total: 21300,
    itemsCount: 2,
  },
  {
    id: "KNF-10391",
    date: "28 мая 2026",
    status: "delivered",
    total: 8900,
    itemsCount: 1,
  },
  {
    id: "KNF-10355",
    date: "14 мая 2026",
    status: "delivered",
    total: 15600,
    itemsCount: 1,
  },
]

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽"
}
