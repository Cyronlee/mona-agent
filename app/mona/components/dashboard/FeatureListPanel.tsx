import { useState } from "react";
import { Icon } from "@iconify/react";
import { ToolBoxIcon } from "./dashboardIcons";
import type { DesignStatus } from "./prdData";
import type { FeatureSummary, StorySummary } from "../../api/projects";

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

function StoryRow({ story, index }: { story: StorySummary; index: number }) {
  const num = String(index + 1).padStart(3, "0");
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-[8px] border border-[rgba(0,0,0,0.08)] hover:bg-gray-50 cursor-pointer transition-colors"
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
      <span
        className="flex-1 text-[13px] text-[#0a0a0a] truncate"
        style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
      >
        {story.title}
      </span>
    </div>
  );
}

function FeatureItem({
  feature,
  expanded,
  onToggle,
}: {
  feature: FeatureSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = toDesignStatus(feature.status);
  const stories = feature.stories ?? [];
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
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex items-center w-full gap-2 p-2 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <StatusIcon type={status} />
        <span
          className="flex-1 text-left text-[14px] text-[#0a0a0a] truncate"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
        >
          {feature.title}
        </span>
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
      </button>
      {expanded && stories.length > 0 && (
        <div className="flex flex-col gap-1.5 px-2 pb-2">
          {stories.map((story, i) => (
            <StoryRow key={story.slug} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeatureListPanel({ features }: { features: FeatureSummary[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
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
          />
        ))}
      </div>
    </div>
  );
}
