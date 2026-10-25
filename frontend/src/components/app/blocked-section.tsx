"use client"

import { useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

type BlockedSectionProps = {
  children: React.ReactNode
  /** Shown next to the cursor while hovering. */
  label?: string
  className?: string
}

/**
 * Shows its content but makes it unusable: nothing can be clicked, typed or focused (inert),
 * with a red "not allowed" cursor and a label that follows the mouse, e.g. for features not built yet.
 */
export function BlockedSection({ children, label = "Under development", className }: BlockedSectionProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  return (
    <div
      className={cn("cursor-blocked select-none", className)}
      onPointerMove={(e) => e.pointerType === "mouse" && setPos({ x: e.clientX, y: e.clientY })}
      onPointerLeave={() => setPos(null)}
    >
      <div inert className="contents">
        {children}
      </div>
      {/* Portal to <body>: inside a dialog, `fixed` would be offset by the dialog's transform. */}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-100 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md"
            style={{ left: pos.x + 16, top: pos.y + 18 }}
          >
            {label}
          </span>,
          document.body
        )}
    </div>
  )
}
