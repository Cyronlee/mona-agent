"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/mona/components/Dashboard"
import { listProjects, type ProjectSummary } from "@/mona/api/projects"

const STORAGE_KEY = "mona.currentProjectSlug"

export function DashboardRouteContent() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
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
      projects={projects}
      onSelectProject={handleSelectProject}
      onCreateNew={handleCreateNew}
    />
  )
}