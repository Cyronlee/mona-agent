import { AppCategory } from "./AppCategory"
import { DESIGN_APPS, DOC_APPS, MAIL_APPS, MEETING_APPS } from "./appsData"

const POPPINS = { fontFamily: "'Poppins', sans-serif" } as const

export function AppIntegrations({
  toggles,
  onToggle,
}: {
  toggles: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p
        className="text-[16px] text-[#0a0a0a]"
        style={{ ...POPPINS, fontWeight: 500 }}
      >
        Allow Mona to connect your apps or read your files
      </p>
      <p
        className="text-[12px] text-[#6b727e]"
        style={{ ...POPPINS, fontWeight: 400 }}
      >
        Mona will read context from these apps to surface suggestions. You can
        always change the setting later.
      </p>
      <div
        className="rounded-[14px] p-6"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow:
            "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex w-full gap-4">
          <AppCategory
            label="Meeting"
            apps={MEETING_APPS}
            toggles={toggles}
            onToggle={onToggle}
          />
          <AppCategory
            label="Mails & Chats"
            apps={MAIL_APPS}
            toggles={toggles}
            onToggle={onToggle}
          />
          <AppCategory
            label="Documentation"
            apps={DOC_APPS}
            toggles={toggles}
            onToggle={onToggle}
            showUpload
          />
          <AppCategory
            label="Design tools"
            apps={DESIGN_APPS}
            toggles={toggles}
            onToggle={onToggle}
          />
        </div>
      </div>
    </div>
  )
}