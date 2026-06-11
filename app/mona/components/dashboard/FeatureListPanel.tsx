import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { ToolBoxIcon } from "./dashboardIcons";
import type { DesignStatus } from "./prdData";
import type { FeatureSummary, StorySummary } from "../../api/projects";
import { DocumentPanel } from "../markdown/DocumentDialog";
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

type PanelView =
  | { kind: "list" }
  | { kind: "feature"; featureSlug: string }
  | { kind: "story"; featureSlug: string; storySlug: string };

type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

function TitleButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
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

function FeatureJiraAction({
  feature,
  syncing,
  onSync,
  stopPropagation = false,
  detailed = false,
}: {
  feature: FeatureSummary;
  syncing: boolean;
  onSync: (slug: string) => void;
  stopPropagation?: boolean;
  detailed?: boolean;
}) {
  const className = detailed
    ? "flex items-center gap-2 rounded-[10px] border border-[rgba(0,37,87,0.16)] px-3 py-2 text-[12px] text-[#002557] shrink-0 no-underline transition-colors hover:bg-[rgba(0,37,87,0.04)]"
    : "flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10px] shrink-0 transition-colors";

  if (feature.jiraKey) {
    return (
      <a
        href={`https://thoughtworks.atlassian.net/browse/${feature.jiraKey}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        className={className + (detailed ? "" : " text-[#0052CC] hover:bg-[rgba(0,82,204,0.08)]")}
        style={{
          background: detailed ? "white" : "rgba(0,82,204,0.06)",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        }}
        title={`Open ${feature.jiraKey} in Jira`}
      >
        <Icon icon="lucide:external-link" width={detailed ? 14 : 10} height={detailed ? 14 : 10} />
        {feature.jiraKey}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        onSync(feature.slug);
      }}
      disabled={syncing}
      className={
        className +
        (detailed
          ? " bg-white hover:border-[rgba(255,127,38,0.35)] hover:text-[#FF7F26]"
          : " text-[#717182] hover:bg-[rgba(255,127,38,0.08)] hover:text-[#FF7F26]") +
        " cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      }
      style={{
        fontFamily: "Poppins, sans-serif",
        fontWeight: 500,
        borderColor: detailed ? "rgba(0,0,0,0.08)" : undefined,
      }}
      title="Sync to Jira"
    >
      <Icon
        icon={syncing ? "lucide:loader-2" : "lucide:refresh-cw"}
        width={detailed ? 14 : 10}
        height={detailed ? 14 : 10}
        className={syncing ? "animate-spin" : ""}
      />
      {syncing ? "Syncing..." : detailed ? "Sync to Jira" : "Jira"}
    </button>
  );
}

function PanelBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3 border-b border-[rgba(0,0,0,0.08)] shrink-0"
      style={{ background: "rgba(250,250,252,0.9)" }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1 min-w-0">
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-[13px] text-[#717182] hover:text-[#0a0a0a] transition-colors truncate cursor-pointer"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={
                  "text-[13px] truncate " +
                  (isLast ? "text-[#0a0a0a]" : "text-[#717182]")
                }
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <Icon icon="lucide:chevron-right" width={14} height={14} color="#a1a1aa" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeatureContextCard({
  feature,
  syncing,
  onSync,
}: {
  feature: FeatureSummary;
  syncing: boolean;
  onSync: (slug: string) => void;
}) {
  return (
    <div
      className="rounded-[14px] border border-[rgba(0,0,0,0.08)] px-4 py-4 bg-white"
      style={{ boxShadow: "0px 4px 16px rgba(15,23,42,0.04)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <StatusIcon type={toDesignStatus(feature.status)} />
          <div className="min-w-0">
            <div
              className="text-[18px] text-[#0a0a0a] truncate"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              {feature.title}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span
                className="rounded-full px-2 py-0.5 text-[11px] text-[#717182]"
                style={{
                  background: "#f3f4f6",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                }}
              >
                {feature.storyCount} story{feature.storyCount === 1 ? "" : "ies"}
              </span>
              {feature.desc ? (
                <span
                  className="text-[12px] text-[#717182] truncate"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {feature.desc}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <FeatureJiraAction
          feature={feature}
          syncing={syncing}
          onSync={onSync}
          detailed
        />
      </div>
    </div>
  );
}

function StoryFeaturePill({
  feature,
  onClick,
}: {
  feature: FeatureSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3 text-left hover:bg-[#fafafa] transition-colors cursor-pointer"
      style={{ boxShadow: "0px 4px 16px rgba(15,23,42,0.04)" }}
    >
      <StatusIcon type={toDesignStatus(feature.status)} />
      <span
        className="text-[14px] text-[#0a0a0a] truncate"
        style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
      >
        {feature.title}
      </span>
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
        <FeatureJiraAction
          feature={feature}
          syncing={syncing}
          onSync={onSync}
          stopPropagation
        />
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

function FeatureDetailView({
  feature,
  projectSlug,
  syncing,
  onSync,
  onBackToList,
  onOpenStory,
}: {
  feature: FeatureSummary;
  projectSlug: string;
  syncing: boolean;
  onSync: (slug: string) => void;
  onBackToList: () => void;
  onOpenStory: (story: StorySummary) => void;
}) {
  const stories = feature.stories ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelBreadcrumbs
        items={[
          { label: "Feature list", onClick: onBackToList },
          { label: feature.title },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <FeatureContextCard feature={feature} syncing={syncing} onSync={onSync} />

        <div
          className="rounded-[14px] border border-[rgba(0,0,0,0.08)] overflow-hidden bg-white min-h-[340px]"
          style={{ boxShadow: "0px 4px 16px rgba(15,23,42,0.04)" }}
        >
          <DocumentPanel
            kind="feature"
            projectSlug={projectSlug}
            featureSlug={feature.slug}
            title={feature.title}
            showSidePanel={false}
            className="min-h-[340px]"
          />
        </div>

        <div
          className="rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white p-3"
          style={{ boxShadow: "0px 4px 16px rgba(15,23,42,0.04)" }}
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <span
              className="text-[14px] text-[#0a0a0a]"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Story card list
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
              {stories.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {stories.length > 0 ? (
              stories.map((story, index) => (
                <StoryRow
                  key={story.slug}
                  story={story}
                  index={index}
                  onOpen={() => onOpenStory(story)}
                />
              ))
            ) : (
              <div
                className="px-2 py-6 text-[13px] text-[#717182] text-center"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                No story cards yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryDetailView({
  feature,
  story,
  projectSlug,
  syncing,
  onSync,
  onBackToList,
  onOpenFeature,
}: {
  feature: FeatureSummary;
  story: StorySummary;
  projectSlug: string;
  syncing: boolean;
  onSync: (slug: string) => void;
  onBackToList: () => void;
  onOpenFeature: () => void;
}) {
  const storyNumber = String(story.order ?? 0).padStart(3, "0");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelBreadcrumbs
        items={[
          { label: "Feature list", onClick: onBackToList },
          { label: feature.title, onClick: onOpenFeature },
          { label: story.title },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <StoryFeaturePill feature={feature} onClick={onOpenFeature} />

        <div
          className="rounded-[14px] border border-[rgba(0,0,0,0.08)] overflow-hidden bg-white"
          style={{ boxShadow: "0px 4px 16px rgba(15,23,42,0.04)" }}
        >
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[rgba(0,0,0,0.08)]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="rounded-[6px] px-2 py-0.5 text-[11px] text-[#717182]"
                  style={{
                    background: "#f3f4f6",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {storyNumber}
                </span>
                {story.priority != null ? (
                  <span
                    className="rounded-[6px] px-2 py-0.5 text-[11px] text-[#717182]"
                    style={{
                      background: "#f3f4f6",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    Priority {story.priority}
                  </span>
                ) : null}
              </div>
              <div
                className="text-[18px] text-[#0a0a0a]"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                {story.title}
              </div>
              {story.desc ? (
                <p
                  className="mt-2 text-[13px] text-[#717182]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {story.desc}
                </p>
              ) : null}
            </div>
            <FeatureJiraAction
              feature={feature}
              syncing={syncing}
              onSync={onSync}
              detailed
            />
          </div>

          <DocumentPanel
            kind="story"
            projectSlug={projectSlug}
            featureSlug={feature.slug}
            storySlug={story.slug}
            title={story.title}
            showSidePanel={false}
            className="min-h-[420px]"
          />
        </div>
      </div>
    </div>
  );
}

function DetailNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PanelBreadcrumbs items={[{ label: "Feature list", onClick: onBack }, { label: "Unavailable" }]} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="text-[15px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
          >
            The selected document is no longer available.
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 rounded-[10px] border border-[rgba(0,0,0,0.08)] px-3 py-2 text-[13px] text-[#717182] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors cursor-pointer"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Back to feature list
          </button>
        </div>
      </div>
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
  const [panelView, setPanelView] = useState<PanelView>({ kind: "list" });
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

  const activeFeature =
    panelView.kind === "list"
      ? null
      : features.find((feature) => feature.slug === panelView.featureSlug) ?? null;

  const activeStory =
    panelView.kind === "story"
      ? activeFeature?.stories.find((story) => story.slug === panelView.storySlug) ?? null
      : null;

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
      {panelView.kind === "list" ? (
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
                setPanelView({
                  kind: "feature",
                  featureSlug: f.slug,
                })
              }
              onOpenStory={(story) =>
                setPanelView({
                  kind: "story",
                  featureSlug: f.slug,
                  storySlug: story.slug,
                })
              }
            />
          ))}
        </div>
      ) : activeFeature == null ? (
        <DetailNotFound onBack={() => setPanelView({ kind: "list" })} />
      ) : panelView.kind === "feature" ? (
        <FeatureDetailView
          feature={activeFeature}
          projectSlug={projectSlug}
          syncing={syncingSlug === activeFeature.slug}
          onSync={handleSync}
          onBackToList={() => setPanelView({ kind: "list" })}
          onOpenStory={(story) =>
            setPanelView({
              kind: "story",
              featureSlug: activeFeature.slug,
              storySlug: story.slug,
            })
          }
        />
      ) : activeStory == null ? (
        <DetailNotFound onBack={() => setPanelView({ kind: "list" })} />
      ) : (
        <StoryDetailView
          feature={activeFeature}
          story={activeStory}
          projectSlug={projectSlug}
          syncing={syncingSlug === activeFeature.slug}
          onSync={handleSync}
          onBackToList={() => setPanelView({ kind: "list" })}
          onOpenFeature={() =>
            setPanelView({
              kind: "feature",
              featureSlug: activeFeature.slug,
            })
          }
        />
      )}
    </div>
  );
}
