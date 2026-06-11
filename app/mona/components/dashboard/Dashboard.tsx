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
  autoPrompt?: string | null;
  projects: ProjectSummary[];
  onSelectProject: (slug: string) => void;
  onCreateNew: () => void;
};

export function Dashboard({
  projectSlug,
  autoPrompt,
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refreshSuggestions = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleRefreshAll = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
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
        setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectSlug, refreshKey]);

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
        onRefresh={handleRefreshAll}
        refreshing={refreshing}
      />
      <div
        className="flex flex-1 overflow-hidden"
        style={{ marginTop: 48, marginBottom: 28 }}
      >
        <LeftPanel
          projectSlug={projectSlug}
          autoPrompt={autoPrompt}
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
            prdRefreshKey={refreshKey}
          />
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
