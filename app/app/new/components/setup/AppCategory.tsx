import type { ReactNode } from "react"
import { CheckCircle, UploadIcon } from "./icons"

function ToggleBtn({
  checked,
  onToggle,
  icon,
  label,
}: {
  checked: boolean
  onToggle: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onToggle}
      className="flex h-[62px] w-full cursor-pointer items-center justify-between rounded-[10px] px-[13px] transition-all"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span
          className="whitespace-nowrap text-[14px] text-[#111827]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          {label}
        </span>
      </div>
      <div
        className="flex shrink-0 items-center justify-center rounded-full transition-all"
        style={{
          width: 20,
          height: 20,
          background: checked ? "#FF7F26" : "#f5f6f8",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {checked && <CheckCircle />}
      </div>
    </button>
  )
}

export function AppCategory({
  label,
  apps,
  toggles,
  onToggle,
  showUpload,
}: {
  label: string
  apps: { id: string; name: string; icon: ReactNode }[]
  toggles: Record<string, boolean>
  onToggle: (id: string) => void
  showUpload?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span
        className="whitespace-nowrap text-[14px] text-[#6b727e]"
        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
      >
        {label}
      </span>
      {apps.map((app) => (
        <ToggleBtn
          key={app.id}
          checked={!!toggles[app.id]}
          onToggle={() => onToggle(app.id)}
          icon={app.icon}
          label={app.name}
        />
      ))}
      {showUpload ? (
        <button
          className="flex cursor-pointer items-center gap-2 text-[14px] text-[#111827] transition-opacity hover:opacity-70"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          <UploadIcon />
          Upload file
        </button>
      ) : (
        <span
          className="cursor-pointer text-[14px] text-[#111827] transition-opacity hover:opacity-70"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
        >
          + More
        </span>
      )}
    </div>
  )
}