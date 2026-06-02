import type { ReactNode } from "react";

export function AppIcon({
  bg,
  children,
}: {
  bg: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-[10px] shrink-0"
      style={{ background: bg, width: 36, height: 36 }}
    >
      {children}
    </div>
  );
}
