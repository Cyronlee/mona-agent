"use client";

import { useEffect, useState } from "react";
import { getAllSuggestions, getProjectDetail } from "../../api/projects";
import type { AggregatedSuggestion, FeatureSummary } from "../../api/projects";
import { BottomBar } from "./BottomBar";
import { InboxPanel } from "./InboxPanel";
import { PRDContent } from "./PRDContent";
import { RightPanel } from "./RightPanel";
import { TopBar } from "./TopBar";

type DashboardProps = {
  projectSlug: string;
};

export function Dashboard({ projectSlug }: DashboardProps) {
  const [inboxCollapsed, setInboxCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [projectTitle, setProjectTitle] = useState("Acme feedback tool");
  const [features, setFeatures] = useState<FeatureSummary[]>([]);
  const [suggestions, setSuggestions] = useState<AggregatedSuggestion[]>([]);

  useEffect(() => {
    getProjectDetail(projectSlug)
      .then((detail) => {
        setProjectTitle(detail.meta.title);
        setFeatures(detail.features);
      })
      .catch(console.error);
    getAllSuggestions(projectSlug).then(setSuggestions).catch(console.error);
  }, [projectSlug]);

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{ background: "#ffffff", minHeight: 0 }}
    >
      <TopBar
        inboxCollapsed={inboxCollapsed}
        rightPanelOpen={rightPanelOpen}
        onToggleInbox={() => setInboxCollapsed((v) => !v)}
        onToggleRightPanel={() => setRightPanelOpen((v) => !v)}
        projectTitle={projectTitle}
      />
      <div
        className="flex flex-1 overflow-hidden"
        style={{ marginTop: 48, marginBottom: 28 }}
      >
        <InboxPanel
          collapsed={inboxCollapsed}
          onToggle={() => setInboxCollapsed((v) => !v)}
          suggestions={suggestions.length > 0 ? suggestions : undefined}
        />
        <main
          className="flex flex-1 overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          <PRDContent features={features.length > 0 ? features : undefined} />
        </main>
        {rightPanelOpen && (
          <RightPanel
            onClose={() => setRightPanelOpen(false)}
            projectSlug={projectSlug}
          />
        )}
      </div>
      <BottomBar />
    </div>
  );
}
