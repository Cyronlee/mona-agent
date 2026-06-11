"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/mona/components/Dashboard"
import { listProjects, type ProjectSummary } from "@/mona/api/projects"

const STORAGE_KEY = "mona.currentProjectSlug"
const AUTO_KICKOFF_KEY_PREFIX = "mona.autoKickoff."

function buildKickoffPrompt(): string {
  return [
    "Please read the current project's PRD.md and turn it into a complete, production-ready PRD in English.",
    "Then autonomously break the PRD down into clear features and create actionable suggestions under each feature.",
    "Use the project's content APIs/tools to write back the PRD improvements, features, and suggestions.",
  ].join(" ")
}

function consumeAutoKickoffPrompt(projectSlug: string): string | null {
  if (typeof window === "undefined") return null
  const key = `${AUTO_KICKOFF_KEY_PREFIX}${projectSlug}`
  const pending = window.localStorage.getItem(key)
  if (!pending) return null
  window.localStorage.removeItem(key)
  return buildKickoffPrompt()
}

export function DashboardRouteContent() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)
  const [autoPrompt, setAutoPrompt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

      ; (async () => {
        try {
          const list = await listProjects()
          if (cancelled) return

          setProjects(list)
          if (list.length === 0) {
            router.replace("/new")
            return
          }

          const stored = typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null
          const existing = stored ? list.find((project) => project.slug === stored) : null
          const nextSlug = existing?.slug ?? list[0].slug

          setCurrentSlug(nextSlug)
          setAutoPrompt(consumeAutoKickoffPrompt(nextSlug))
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, nextSlug)
          }
        } catch (error) {
          console.error("Failed to load projects", error)
          if (!cancelled) {
            router.replace("/new")
          }
        }
      })()

    return () => {
      cancelled = true
    }
  }, [router])

  const handleSelectProject = useCallback((slug: string) => {
    setCurrentSlug(slug)
    setAutoPrompt(consumeAutoKickoffPrompt(slug))
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, slug)
    }
  }, [])

  const handleCreateNew = useCallback(() => {
    router.push("/new")
  }, [router])

  if (!currentSlug) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: "#f5f6f8" }}
      >
        <span
          className="text-[14px] text-[#6b727e]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Loading…
        </span>
      </div>
    )
  }

  return (
    <Dashboard
      projectSlug={currentSlug}
      autoPrompt={autoPrompt}
      projects={projects}
      onSelectProject={handleSelectProject}
      onCreateNew={handleCreateNew}
    />
  )
}