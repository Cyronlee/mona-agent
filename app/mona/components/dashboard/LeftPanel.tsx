"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useResizableWidth } from "./useResizableWidth";
import { ChatPanel } from "../chat/ChatPanel";
import { InboxPanel } from "./InboxPanel";
import type { AggregatedSuggestion } from "../../api/projects";

const LEFT_PANEL_MIN_WIDTH = 200;
const LEFT_PANEL_MAX_WIDTH = 1000;
const LEFT_PANEL_DEFAULT_WIDTH = 240;
const LEFT_PANEL_STORAGE_KEY = "mona-dashboard-left-panel-width";

const PANEL_OPTIONS = {
  min: LEFT_PANEL_MIN_WIDTH,
  max: LEFT_PANEL_MAX_WIDTH,
  default: LEFT_PANEL_DEFAULT_WIDTH,
  storageKey: LEFT_PANEL_STORAGE_KEY,
  side: "right" as const,
};

function ResizeHandle({
  onMouseDown,
}: {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className="absolute inset-y-0 right-0 z-10 cursor-col-resize"
      style={{ width: 8 }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute inset-y-0 right-[3px] w-px"
        style={{ background: "rgba(0,0,0,0.08)" }}
      />
    </div>
  );
}

type LeftPanelProps = {
  projectSlug: string;
  autoPrompt?: string | null;
  suggestions: AggregatedSuggestion[];
  suggestionsLoading?: boolean;
  onInboxExpand?: () => void;
};

export function LeftPanel({
  projectSlug,
  autoPrompt,
  suggestions,
  suggestionsLoading,
  onInboxExpand,
}: LeftPanelProps) {
  const { width, onMouseDown } = useResizableWidth(PANEL_OPTIONS);
  const [expanded, setExpanded] = useState<"inbox" | "chat">("inbox");

  const toggle = useCallback(
    () => setExpanded((prev) => (prev === "inbox" ? "chat" : "inbox")),
    [],
  );

  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (expanded === "inbox") {
      onInboxExpand?.();
    }
  }, [expanded, onInboxExpand]);

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
      style={{
        width,
        borderRight: "1px solid rgba(0,0,0,0.08)",
        background: "#ffffff",
      }}
    >
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={{
          flex: expanded === "inbox" ? "1 1 0%" : "0 0 auto",
          minHeight: expanded === "inbox" ? 0 : 40,
        }}
      >
        <InboxPanel
          collapsed={expanded !== "inbox"}
          onToggle={toggle}
          projectSlug={projectSlug}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
        />
      </div>

      <div
        className="flex flex-col overflow-hidden"
        style={{
          flex: expanded === "chat" ? "1 1 0%" : "0 0 auto",
          minHeight: expanded === "chat" ? 0 : 40,
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <ChatPanel
          collapsed={expanded !== "chat"}
          onToggleExpand={toggle}
          projectSlug={projectSlug}
          autoPrompt={autoPrompt}
        />
      </div>

      <ResizeHandle onMouseDown={onMouseDown} />
    </aside>
  );
}
