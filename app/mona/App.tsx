"use client";

import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Screen1 } from "./components/Screen1";
import { Screen2 } from "./components/Screen2";
import { Screen3 } from "./components/Screen3";
import { createProject, listProjects } from "./api/projects";
import type { ProjectSummary } from "./api/projects";

const STORAGE_KEY = "mona.currentProjectSlug";

type OnboardDraft = { title: string; description: string };

export default function App() {
  const [view, setView] = useState<"loading" | "onboard" | "dashboard">("loading");
  const [onboardStep, setOnboardStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<OnboardDraft>({ title: "", description: "" });
  const [draftError, setDraftError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  const refreshProjects = useCallback(async (): Promise<ProjectSummary[]> => {
    const list = await listProjects();
    setProjects(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listProjects();
        if (cancelled) return;
        setProjects(list);
        if (list.length === 0) {
          setView("onboard");
          setOnboardStep(1);
          return;
        }
        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const exists = stored ? list.find((p) => p.slug === stored) : null;
        const slug = exists ? exists.slug : list[0].slug;
        if (!exists && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, slug);
        }
        setCurrentSlug(slug);
        setView("dashboard");
      } catch (err) {
        console.error("Failed to load projects", err);
        if (!cancelled) {
          setView("onboard");
          setOnboardStep(1);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectProject = useCallback((slug: string) => {
    setCurrentSlug(slug);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, slug);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    setDraft({ title: "", description: "" });
    setDraftError(null);
    setOnboardStep(1);
    setView("onboard");
  }, []);

  const handleScreen1Next = useCallback((title: string) => {
    setDraft((d) => ({ ...d, title }));
    setDraftError(null);
    setOnboardStep(2);
  }, []);

  const handleScreen2Back = useCallback(() => {
    setOnboardStep(1);
  }, []);

  const handleScreen2Start = useCallback((payload: OnboardDraft) => {
    setDraft(payload);
    setDraftError(null);
    setOnboardStep(3);
  }, []);

  const handleScreen3Done = useCallback(
    async (createdSlug: string) => {
      await refreshProjects();
      setCurrentSlug(createdSlug);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, createdSlug);
      }
      setDraft({ title: "", description: "" });
      setDraftError(null);
      setView("dashboard");
    },
    [refreshProjects],
  );

  const handleScreen3Failure = useCallback((message: string) => {
    setDraftError(message);
    setOnboardStep(2);
  }, []);

  if (view === "loading") {
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
    );
  }

  if (view === "dashboard" && currentSlug) {
    return (
      <Dashboard
        projectSlug={currentSlug}
        projects={projects}
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        maxWidth: "100%",
        background: "#f5f6f8",
        boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.08)",
        minHeight: 812,
      }}
    >
      <Header />
      {onboardStep === 1 && <Screen1 onNext={handleScreen1Next} />}
      {onboardStep === 2 && (
        <Screen2
          initialName={draft.title}
          initialDescription={draft.description}
          errorMessage={draftError}
          onBack={handleScreen2Back}
          onStart={handleScreen2Start}
        />
      )}
      {onboardStep === 3 && (
        <Screen3
          draft={draft}
          onDone={handleScreen3Done}
          onFailure={handleScreen3Failure}
          createProjectFn={createProject}
        />
      )}
    </div>
  );
}
