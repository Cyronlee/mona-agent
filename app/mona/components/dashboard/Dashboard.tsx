"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSuggestions, getProjectDetail } from "../../api/projects";
import type {
  AggregatedSuggestion,
  FeatureSummary,
  ProjectSummary,
} from "../../api/projects";
import { BottomBar } from "./BottomBar";
import { LeftPanel } from "./LeftPanel";
import { ProjectWorkspaceContent } from "./ProjectWorkspaceContent";
import { TopBar } from "./TopBar";

type DashboardProps = {
  projectSlug: string;
  projects: ProjectSummary[];
  onSelectProject: (slug: string) => void;
  onCreateNew: () => void;
};

export function Dashboard({
  projectSlug,
  projects,
  onSelectProject,
  onCreateNew,
}: DashboardProps) {
  const [projectTitle, setProjectTitle] = useState(
    projects.find((p) => p.slug === projectSlug)?.title ?? projectSlug,
  );
  const [features, setFeatures] = useState<FeatureSummary[]>([]);
  const [suggestions, setSuggestions] = useState<AggregatedSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [suggestionsRefreshKey, setSuggestionsRefreshKey] = useState(0);

  const refreshSuggestions = useCallback(() => {
    setSuggestionsRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProjectDetail(projectSlug)
      .then((detail) => {
        if (cancelled) return;
        setProjectTitle(detail.meta.title);
        setFeatures(detail.features);
      })
      .catch(console.error);
    setSuggestionsLoading(true);
    getAllSuggestions(projectSlug)
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data);
      })
      .catch(console.error)
      .finally(() => {
        if (cancelled) return;
        setSuggestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectSlug, suggestionsRefreshKey]);

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{ background: "#ffffff", minHeight: 0 }}
    >
      <TopBar
        projectTitle={projectTitle}
        projects={projects}
        currentProjectSlug={projectSlug}
        onSelectProject={onSelectProject}
        onCreateNew={onCreateNew}
      />
      <div
        className="flex flex-1 overflow-hidden"
        style={{ marginTop: 48, marginBottom: 28 }}
      >
        <LeftPanel
          projectSlug={projectSlug}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          onInboxExpand={refreshSuggestions}
        />
        <main
          className="flex flex-1 overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          <ProjectWorkspaceContent
            features={features.length > 0 ? features : undefined}
            projectSlug={projectSlug}
          />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
