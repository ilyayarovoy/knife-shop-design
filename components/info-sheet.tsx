"use client"

import { X } from "lucide-react"
import { useEffect } from "react"
import type { ReactNode } from "react"

interface InfoSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

// Универсальная шторка снизу для статичного контента (например «О нас»).
// Визуально повторяет паттерн ProductDetail, чтобы UI оставался консистентным.
export function InfoSheet({ open, title, onClose, children }: InfoSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-background">
        <div className="relative flex shrink-0 items-center justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-border" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1">
          <h2 className="mb-4 text-xl font-bold leading-tight text-balance">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  )
}
