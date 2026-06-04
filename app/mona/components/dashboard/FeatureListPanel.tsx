import { useState } from "react";
import { Icon } from "@iconify/react";
import { ToolBoxIcon } from "./dashboardIcons";
import type { FeatureSummary, StorySummary } from "../../api/projects";
import { DocumentDialog } from "../markdown/DocumentDialog";
import {
  jiraColor,
  jiraFont,
  jiraRadius,
} from "../jira/tokens";
import { TypeIcon } from "../jira/TypeIcon";
import { StatusPill } from "../jira/StatusPill";
import { PriorityIcon } from "../jira/PriorityIcon";
import { IssueKey } from "../jira/IssueKey";

type DialogTarget =
  | { kind: "feature"; featureSlug: string; title: string; status?: string }
  | {
      kind: "story";
      featureSlug: string;
      storySlug: string;
      title: string;
      status?: string;
    };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 0.18s ease",
        flexShrink: 0,
      }}
    >
      <Icon icon="lucide:chevron-down" width={14} height={14} color={jiraColor.textTertiary} />
    </span>
  );
}

function StoryRow({
  story,
  index,
  onOpenDialog,
}: {
  story: StorySummary;
  index: number;
  onOpenDialog: (target: DialogTarget) => void;
}) {
  return (
    <div
      className="group flex items-center gap-3 pl-6 pr-3 cursor-pointer transition-colors"
      style={{
        height: 32,
        borderTop: `1px solid ${jiraColor.borderSubtle}`,
        background: jiraColor.surfaceAlt,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = jiraColor.surfaceHover)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = jiraColor.surfaceAlt)
      }
      onClick={() =>
        onOpenDialog({
          kind: "story",
          featureSlug: story.slug,
          storySlug: story.slug,
          title: story.title,
          status: story.status,
        })
      }
    >
      <TypeIcon type="story" size={14} />
      <IssueKey prefix="S" index={index} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDialog({
            kind: "story",
            featureSlug: story.slug,
            storySlug: story.slug,
            title: story.title,
            status: story.status,
          });
        }}
        className="flex-1 text-left text-[13px] text-[#172B4D] truncate bg-transparent border-0 p-0 cursor-pointer"
        style={{ fontFamily: jiraFont.sans, fontWeight: 500 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = jiraColor.textLink)}
        onMouseLeave={(e) => (e.currentTarget.style.color = jiraColor.textPrimary)}
      >
        {story.title}
      </button>
      {story.priority != null && <PriorityIcon priority={story.priority} />}
      <StatusPill status={story.status} size="sm" />
    </div>
  );
}

function FeatureItem({
  feature,
  index,
  expanded,
  onToggle,
  onOpenDialog,
}: {
  feature: FeatureSummary;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onOpenDialog: (target: DialogTarget) => void;
}) {
  const stories = feature.stories ?? [];
  return (
    <div
      style={{
        background: jiraColor.surface,
        border: `1px solid ${expanded ? jiraColor.borderFocus : jiraColor.border}`,
        borderRadius: jiraRadius.md,
        boxShadow: expanded
          ? "0 0 0 1px #0052CC14, 0 1px 2px rgba(9,30,66,0.08)"
          : "0 1px 1px rgba(9,30,66,0.04)",
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <div
        onClick={onToggle}
        className="flex items-center gap-3 pl-3 pr-3 cursor-pointer transition-colors"
        style={{ height: 40 }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = jiraColor.surfaceHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = jiraColor.surface)
        }
      >
        <ChevronIcon open={expanded} />
        <TypeIcon type="feature" size={16} />
        <IssueKey prefix="F" index={index} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDialog({
              kind: "feature",
              featureSlug: feature.slug,
              title: feature.title,
              status: feature.status,
            });
          }}
          className="flex-1 text-left text-[14px] text-[#172B4D] truncate bg-transparent border-0 p-0 cursor-pointer"
          style={{ fontFamily: jiraFont.sans, fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = jiraColor.textLink)}
          onMouseLeave={(e) => (e.currentTarget.style.color = jiraColor.textPrimary)}
        >
          {feature.title}
        </button>
        <span
          className="text-[12px] text-[#5E6C84] tabular-nums shrink-0"
          style={{ fontFamily: jiraFont.sans, fontWeight: 500 }}
        >
          {feature.storyCount}
        </span>
        <StatusPill status={feature.status} size="sm" />
      </div>
      {expanded && stories.length > 0 && (
        <div className="flex flex-col">
          {stories.map((story, i) => (
            <StoryRow
              key={story.slug}
              story={story}
              index={i}
              onOpenDialog={onOpenDialog}
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
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null);

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const dialogOpen = dialogTarget !== null;
  const closeDialog = () => setDialogTarget(null);

  return (
    <div
      className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white"
      style={{
        border: `1px solid ${jiraColor.border}`,
        borderRadius: jiraRadius.lg,
        boxShadow: "0 1px 2px rgba(9,30,66,0.08)",
      }}
    >
      {/* Header — Jira page header style */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 48,
          borderBottom: `1px solid ${jiraColor.border}`,
          background: jiraColor.surface,
        }}
      >
        <div className="flex items-center gap-2">
          <ToolBoxIcon />
          <h2
            className="text-[15px] text-[#172B4D] m-0"
            style={{ fontFamily: jiraFont.sans, fontWeight: 600 }}
          >
            Features
          </h2>
          <span
            className="flex items-center justify-center rounded-[3px] text-[11px] text-[#5E6C84] shrink-0"
            style={{
              background: jiraColor.bg,
              height: 20,
              padding: "0 8px",
              fontFamily: jiraFont.sans,
              fontWeight: 600,
              minWidth: 24,
            }}
          >
            {features.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 px-2 rounded-[3px] text-[13px] text-[#172B4D] cursor-pointer transition-colors"
            style={{
              height: 28,
              fontFamily: jiraFont.sans,
              fontWeight: 500,
              border: `1px solid ${jiraColor.border}`,
              background: jiraColor.surface,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = jiraColor.surfaceHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = jiraColor.surface)
            }
          >
            <Icon icon="lucide:plus" width={12} height={12} color="#5E6C84" />
            Create
          </button>
          <button
            className="flex items-center justify-center rounded-[3px] cursor-pointer transition-colors"
            style={{ width: 28, height: 28 }}
            aria-label="More options"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = jiraColor.surfaceHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Icon
              icon="lucide:more-horizontal"
              width={14}
              height={14}
              color="#5E6C84"
            />
          </button>
        </div>
      </div>

      {/* Column header (faint, Jira backlog style) */}
      <div
        className="flex items-center gap-3 px-3 shrink-0"
        style={{
          height: 28,
          background: jiraColor.surfaceAlt,
          borderBottom: `1px solid ${jiraColor.borderSubtle}`,
        }}
      >
        <span style={{ width: 14 }} />
        <span
          className="text-[11px] text-[#7A869A] uppercase shrink-0"
          style={{
            fontFamily: jiraFont.sans,
            fontWeight: 700,
            letterSpacing: 0.4,
          }}
        >
          Type
        </span>
        <span
          className="text-[11px] text-[#7A869A] uppercase shrink-0"
          style={{
            fontFamily: jiraFont.sans,
            fontWeight: 700,
            letterSpacing: 0.4,
            width: 56,
          }}
        >
          Key
        </span>
        <span
          className="flex-1 text-[11px] text-[#7A869A] uppercase"
          style={{
            fontFamily: jiraFont.sans,
            fontWeight: 700,
            letterSpacing: 0.4,
          }}
        >
          Summary
        </span>
        <span
          className="text-[11px] text-[#7A869A] uppercase shrink-0"
          style={{
            fontFamily: jiraFont.sans,
            fontWeight: 700,
            letterSpacing: 0.4,
            width: 24,
            textAlign: "right",
          }}
        >
          #
        </span>
        <span
          className="text-[11px] text-[#7A869A] uppercase shrink-0"
          style={{
            fontFamily: jiraFont.sans,
            fontWeight: 700,
            letterSpacing: 0.4,
            minWidth: 90,
            textAlign: "right",
          }}
        >
          Status
        </span>
      </div>

      {/* Feature list */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-1.5 p-2"
        style={{ background: jiraColor.bg }}
      >
        {features.map((f, i) => (
          <FeatureItem
            key={f.slug}
            feature={f}
            index={i}
            expanded={expanded.has(f.slug)}
            onToggle={() => toggle(f.slug)}
            onOpenDialog={setDialogTarget}
          />
        ))}
      </div>

      {dialogTarget?.kind === "feature" && (
        <DocumentDialog
          kind="feature"
          projectSlug={projectSlug}
          featureSlug={dialogTarget.featureSlug}
          title={dialogTarget.title}
          status={dialogTarget.status}
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) closeDialog();
          }}
        />
      )}
      {dialogTarget?.kind === "story" && (
        <DocumentDialog
          kind="story"
          projectSlug={projectSlug}
          featureSlug={dialogTarget.featureSlug}
          storySlug={dialogTarget.storySlug}
          title={dialogTarget.title}
          status={dialogTarget.status}
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) closeDialog();
          }}
        />
      )}
    </div>
  );
}
