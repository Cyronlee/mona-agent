import { useState } from "react"
import { ActionBar } from "./ActionBar"
import { AppIntegrations } from "./AppIntegrations"
import { DEFAULT_TOGGLES } from "./appsData"
import { MonkeyIntro } from "./MonkeyIntro"
import { DescriptionField, ProjectMetaFields } from "./ProjectFields"

export type SetupDraft = {
  projectName: string
  domain: string
  description: string
  toggles: Record<string, boolean> | null
}

export function SetupStep({
  initialDraft,
  errorMessage,
  onBack,
  onStart,
}: {
  initialDraft: SetupDraft
  errorMessage?: string | null
  onBack: (draft: SetupDraft) => void
  onStart: (draft: SetupDraft) => void
}) {
  const [projectName, setProjectName] = useState(
    initialDraft.projectName || "Global Shopping App",
  )
  const [domain, setDomain] = useState(initialDraft.domain || "Retail")
  const [description, setDescription] = useState(
    initialDraft.description || "",
  )
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    initialDraft.toggles ?? DEFAULT_TOGGLES,
  )

  const buildDraft = (): SetupDraft => ({
    projectName,
    domain,
    description,
    toggles,
  })

  const toggle = (id: string) =>
    setToggles((current) => ({ ...current, [id]: !current[id] }))

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full flex-col gap-8" style={{ maxWidth: 880 }}>
          <MonkeyIntro
            title="One last step"
            description="Mona will keep an eye on things, listen to your needs, suggest ideas, and create agents to take care of the busywork for you."
          />

          <ProjectMetaFields
            projectName={projectName}
            onProjectNameChange={setProjectName}
            domain={domain}
            onDomainChange={setDomain}
          />

          <AppIntegrations toggles={toggles} onToggle={toggle} />

          <DescriptionField value={description} onChange={setDescription} />

          {errorMessage && (
            <div
              role="alert"
              className="flex w-full items-start gap-2 rounded-[8px]"
              style={{
                background: "rgba(254, 226, 226, 0.7)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                padding: "10px 12px",
                maxWidth: 880,
              }}
            >
              <span
                className="text-[13px]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#991b1b",
                }}
              >
                {errorMessage}
              </span>
            </div>
          )}

          <ActionBar
            onBack={() => onBack(buildDraft())}
            onStart={() => onStart(buildDraft())}
          />
        </div>
      </div>
    </div>
  )
}