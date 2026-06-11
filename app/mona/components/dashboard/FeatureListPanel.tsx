import { useState } from "react";
import { Icon } from "@iconify/react";
import { ToolBoxIcon } from "./dashboardIcons";
import type { DesignStatus } from "./prdData";
import type { FeatureSummary, StorySummary } from "../../api/projects";
import { DocumentDialog } from "../markdown/DocumentDialog";
import { syncFeatureToJira } from "../../api/projects";

export function StatusIcon({ type }: { type: DesignStatus }) {
  if (type === "Done") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 24, height: 24, background: "#002557" }}
      >
        <Icon icon="lucide:check" width={12} height={12} color="white" />
      </div>
    );
  }
  if (type === "WIP") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 24, height: 24, background: "#FF7F26" }}
      >
        <Icon icon="lucide:minus" width={12} height={12} color="white" />
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: 24, height: 24, background: "#ececf0" }}
    >
      <Icon icon="lucide:pause" width={12} height={12} color="#717182" />
    </div>
  );
}

function toDesignStatus(status?: string): DesignStatus {
  if (status === "done") return "Done";
  if (status === "paused") return "Paused";
  return "WIP";
}

function StoryStatusIcon({ status }: { status?: string }) {
  if (status === "in-progress") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <circle cx="8" cy="8" r="6" stroke="#e8e8ef" strokeWidth="2" />
        <path
          d="M8 2 A6 6 0 0 1 14 8"
          stroke="#FF7F26"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" fill="#002557" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.18s ease",
        flexShrink: 0,
      }}
    >
      <Icon icon="lucide:chevron-down" width={14} height={14} color="#717182" />
    </span>
  );
}

type OpenDialog =
  | { kind: "feature"; featureSlug: string; title: string }
  | { kind: "story"; featureSlug: string; storySlug: string; title: string }
  | null;

function TitleButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={
        "inline-flex items-center gap-1 rounded-[6px] px-1.5 -mx-1.5 py-0.5 text-left transition-colors cursor-pointer hover:bg-[rgba(255,127,38,0.10)] active:bg-[rgba(255,127,38,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F26]/40" +
        (className ? ` ${className}` : "")
      }
    >
      {children}
    </button>
  );
}

function StoryRow({
  story,
  index,
  onOpen,
}: {
  story: StorySummary;
  index: number;
  onOpen: () => void;
}) {
  const num = String(index + 1).padStart(3, "0");
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-[8px] border border-[rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors"
      style={{ background: "#fafafa" }}
    >
      <StoryStatusIcon status={story.status} />
      <span
        className="text-[12px] text-[#717182] tabular-nums shrink-0"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {num}
      </span>
      {story.priority != null && (
        <span
          className="text-[10px] text-[#717182] rounded-[4px] px-1.5 shrink-0"
          style={{
            fontFamily: "Poppins, sans-serif",
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(0,0,0,0.06)",
            lineHeight: "16px",
          }}
        >
          P{story.priority}
        </span>
      )}
      <TitleButton onClick={onOpen} className="flex-1 min-w-0">
        <span
          className="flex-1 text-[13px] text-[#0a0a0a] truncate"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
        >
          {story.title}
        </span>
      </TitleButton>
    </div>
  );
}

function FeatureItem({
  feature,
  expanded,
  onToggle,
  onOpenFeature,
  onOpenStory,
  onSync,
  syncing,
}: {
  feature: FeatureSummary;
  expanded: boolean;
  onToggle: () => void;
  onOpenFeature: () => void;
  onOpenStory: (story: StorySummary) => void;
  onSync: (slug: string) => void;
  syncing: boolean;
}) {
  const status = toDesignStatus(feature.status);
  const stories = feature.stories ?? [];
  const synced = !!feature.jiraKey;
  return (
    <div
      className="rounded-[10px] overflow-hidden transition-colors"
      style={{
        border: expanded
          ? "1.5px solid #FF7F26"
          : "1px solid rgba(0,0,0,0.1)",
        background: "white",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={expanded}
        className="flex items-center w-full gap-2 p-2 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <StatusIcon type={status} />
        <TitleButton onClick={onOpenFeature} className="flex-1 min-w-0">
          <span
            className="flex-1 text-left text-[14px] text-[#0a0a0a] truncate"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            {feature.title}
          </span>
        </TitleButton>
        {synced ? (
          <a
            href={`https://thoughtworks.atlassian.net/browse/${feature.jiraKey}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#0052CC] shrink-0 no-underline hover:bg-[rgba(0,82,204,0.08)] transition-colors"
            style={{
              background: "rgba(0,82,204,0.06)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
            title={`Open ${feature.jiraKey} in Jira`}
          >
            <Icon icon="lucide:external-link" width={10} height={10} />
            {feature.jiraKey}
          </a>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSync(feature.slug);
            }}
            disabled={syncing}
            className="flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#717182] shrink-0 hover:bg-[rgba(255,127,38,0.08)] hover:text-[#FF7F26] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(0,0,0,0.03)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
              border: "none",
            }}
            title="Sync to Jira"
          >
            <Icon icon={syncing ? "lucide:loader-2" : "lucide:refresh-cw"} width={10} height={10} className={syncing ? "animate-spin" : ""} />
            {syncing ? "..." : "Jira"}
          </button>
        )}
        <span
          className="flex items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#717182] shrink-0"
          style={{
            background: "#eef3f2",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          {feature.storyCount}
        </span>
        <ChevronIcon open={expanded} />
      </div>
      {expanded && stories.length > 0 && (
        <div className="flex flex-col gap-1.5 px-2 pb-2">
          {stories.map((story, i) => (
            <StoryRow
              key={story.slug}
              story={story}
              index={i}
              onOpen={() => onOpenStory(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeatureListPanel({
  features,
  projectSlug,
}: {
  features: FeatureSummary[];
  projectSlug: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSync = (slug: string) => {
    setSyncingSlug(slug);
    syncFeatureToJira(projectSlug, slug)
      .then(() => {
        // force a re-render by toggling the feature list — in practice the parent
        // will refresh data, but for immediate feedback we reload the page
        window.location.reload();
      })
      .catch((e: Error) => {
        alert(`Failed to sync to Jira: ${e.message}`);
        setSyncingSlug(null);
      });
  };

  return (
    <div
      className="flex flex-col flex-1 min-w-0 overflow-hidden rounded-[12px] bg-white"
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 0px 3px rgba(144,151,161,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-[rgba(0,0,0,0.1)] shrink-0"
        style={{ height: 40 }}
      >
        <div className="flex items-center gap-2">
          <ToolBoxIcon />
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Feature
          </span>
          <span
            className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
            style={{
              background: "#eceef2",
              height: 22,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {features.length}
          </span>
        </div>
        <button className="hover:opacity-70">
          <Icon icon="lucide:more-vertical" width={14} height={14} color="#717182" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {features.map((f) => (
          <FeatureItem
            key={f.slug}
            feature={f}
            expanded={expanded.has(f.slug)}
            onToggle={() => toggle(f.slug)}
            onSync={handleSync}
            syncing={syncingSlug === f.slug}
            onOpenFeature={() =>
              setOpenDialog({
                kind: "feature",
                featureSlug: f.slug,
                title: f.title,
              })
            }
            onOpenStory={(story) =>
              setOpenDialog({
                kind: "story",
                featureSlug: f.slug,
                storySlug: story.slug,
                title: story.title,
              })
            }
          />
        ))}
      </div>
      {openDialog?.kind === "feature" && (
        <DocumentDialog
          kind="feature"
          projectSlug={projectSlug}
          featureSlug={openDialog.featureSlug}
          title={openDialog.title}
          open
          onOpenChange={(o) => {
            if (!o) setOpenDialog(null);
          }}
        />
      )}
      {openDialog?.kind === "story" && (
        <DocumentDialog
          kind="story"
          projectSlug={projectSlug}
          featureSlug={openDialog.featureSlug}
          storySlug={openDialog.storySlug}
          title={openDialog.title}
          open
          onOpenChange={(o) => {
            if (!o) setOpenDialog(null);
          }}
        />
      )}
    </div>
  );
}
