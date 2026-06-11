"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ApiError, createProject } from "@/mona/api/projects"
import { IdeaStep, LoadingStep, SetupStep, type SetupDraft } from "./NewSteps"

type NewStep = "idea" | "setup" | "loading"

const STORAGE_KEY = "mona.currentProjectSlug"
const AUTO_KICKOFF_KEY_PREFIX = "mona.autoKickoff."

const DEFAULT_SETUP_DRAFT: SetupDraft = {
  projectName: "",
  domain: "Retail",
  description: "",
  toggles: null,
}

export function NewFlow() {
  const router = useRouter()
  const [step, setStep] = useState<NewStep>("idea")
  const [projectIdea, setProjectIdea] = useState("")
  const [setupDraft, setSetupDraft] = useState<SetupDraft>(DEFAULT_SETUP_DRAFT)
  const [draftError, setDraftError] = useState<string | null>(null)

  useEffect(() => {
    if (step !== "loading") return

    let cancelled = false

      ; (async () => {
        try {
          const project = await createProject({
            title: setupDraft.projectName,
            desc: setupDraft.description || undefined,
            domain: setupDraft.domain,
            buildIdea: projectIdea || setupDraft.projectName,
            details: setupDraft.description || undefined,
          })

          if (cancelled) return

          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, project.slug)
            window.localStorage.setItem(`${AUTO_KICKOFF_KEY_PREFIX}${project.slug}`, "1")
            window.location.replace("/dashboard")
            return
          }

          router.replace("/dashboard")
        } catch (error) {
          if (cancelled) return

          const message =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Failed to create project"

          setDraftError(message)
          setStep("setup")
        }
      })()

    return () => {
      cancelled = true
    }
  }, [router, setupDraft.description, setupDraft.projectName, step])

  if (step === "loading") {
    return <LoadingStep />
  }

  if (step === "setup") {
    return (
      <SetupStep
        initialDraft={{
          ...setupDraft,
          projectName: setupDraft.projectName || projectIdea,
        }}
        errorMessage={draftError}
        onBack={(draft) => {
          setProjectIdea(draft.projectName)
          setSetupDraft(draft)
          setStep("idea")
        }}
        onStart={(draft) => {
          setProjectIdea(draft.projectName)
          setSetupDraft(draft)
          setDraftError(null)
          setStep("loading")
        }}
      />
    )
  }

  return (
    <IdeaStep
      key={projectIdea || "empty-idea"}
      initialValue={projectIdea}
      onNext={(idea) => {
        const nextIdea = idea.trim()
        setProjectIdea(nextIdea)
        setDraftError(null)
        setSetupDraft((current) => ({
          ...current,
          projectName: current.projectName || nextIdea,
        }))
        setStep("setup")
      }}
    />
  )
}