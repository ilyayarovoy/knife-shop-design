import type { Order } from "./types"

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
