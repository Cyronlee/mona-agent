import type { ReactNode } from "react"

export function AppIcon({
  bg,
  children,
}: {
  bg: string
  children: ReactNode
}) {
  return (
    <div
      className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px]"
      style={{ background: bg }}
    >
      {children}
    </div>
  )
}