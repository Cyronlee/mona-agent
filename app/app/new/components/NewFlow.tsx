"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/mona/api/projects"
import { IdeaStep, LoadingStep, SetupStep, type SetupDraft } from "./NewSteps"

type NewStep = "idea" | "setup" | "loading"

const STORAGE_KEY = "mona.currentProjectSlug"

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

  if (step === "loading") {
    return (
      <LoadingStep
        draft={setupDraft}
        createProjectFn={createProject}
        onDone={(slug) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, slug)
          }
          setProjectIdea("")
          setSetupDraft(DEFAULT_SETUP_DRAFT)
          setDraftError(null)
          router.replace("/dashboard")
        }}
        onFailure={(message) => {
          setDraftError(message)
          setStep("setup")
        }}
      />
    )
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