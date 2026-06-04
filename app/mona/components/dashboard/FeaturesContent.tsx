import { useState } from "react"
import { Icon } from "@iconify/react"
import { ToolBoxIcon } from "./dashboardIcons"
import { FALLBACK_FEATURES } from "./prdData"
import type { FeatureSummary, StorySummary } from "../../api/projects"

// ---- Status icon for story cards ----

type StoryStatus = "in-progress" | "todo" | "done" | string

function StoryStatusIcon({ status }: { status?: StoryStatus }) {
    if (status === "in-progress") {
        // Arc / progress ring icon (orange)
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" stroke="#e8e8ef" strokeWidth="2" />
                <path
                    d="M8 2 A6 6 0 0 1 14 8"
                    stroke="#FF7F26"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        )
    }
    // todo / not started — filled dark circle
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6" fill="#002557" />
        </svg>
    )
}

// ---- Chevron icon ----

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
            <Icon icon="lucide:chevron-down" width={16} height={16} color="#717182" />
        </span>
    )
}

// ---- Panel toggle icon (top-right corner) ----

function PanelToggleIcon() {
    return <Icon icon="lucide:panel-right-open" width={18} height={18} color="#717182" />
}

// ---- Single story card ----

function StoryCard({ story, index }: { story: StorySummary; index: number }) {
    const num = String(index + 1).padStart(3, "0")
    const status = story.status
    const priority = story.priority
    return (
        <div
            className="flex flex-col gap-1.5 px-4 py-3 cursor-pointer rounded-[8px] transition-colors bg-white hover:border-[#d4d4dc]"
            style={{
                border: "1px solid rgba(0,0,0,0.08)",
            }}
        >
            <div className="flex items-center gap-2">
                <StoryStatusIcon status={status} />
                <span
                    className="text-[12px] text-[#717182] tabular-nums"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    {num}
                </span>
                {priority != null && (
                    <span
                        className="text-[12px] text-[#717182] rounded-[4px] px-1.5"
                        style={{
                            fontFamily: "Poppins, sans-serif",
                            background: "rgba(0,0,0,0.03)",
                            border: "1px solid rgba(0,0,0,0.06)",
                            lineHeight: "16px",
                        }}
                    >
                        Priority {priority}
                    </span>
                )}
            </div>
            <span
                className="text-[14px] text-[#0a0a0a] pl-6 truncate"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
            >
                {story.title}
            </span>
        </div>
    )
}

// ---- Single feature accordion row ----

function FeatureItem({
    feature,
    expanded,
    onToggle,
}: {
    feature: FeatureSummary
    expanded: boolean
    onToggle: () => void
}) {
    const stories: StorySummary[] = feature.stories ?? []
    return (
        <div
            className="rounded-[12px] overflow-hidden transition-all"
            style={{
                border: expanded ? "1.5px solid #FF7F26" : "1px solid rgba(0,0,0,0.08)",
                background: "white",
                boxShadow: expanded ? "0 0 0 1px rgba(255,127,38,0.04)" : "none",
            }}
        >
            {/* Feature header row */}
            <button
                className="flex items-center w-full px-4 gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                style={{ height: 52, textAlign: "left" }}
                onClick={onToggle}
            >
                <div style={{ opacity: expanded ? 1 : 0.45 }}>
                    <ToolBoxIcon />
                </div>
                <span
                    className="flex-1 text-[14px] text-[#0a0a0a] truncate"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                    {feature.title}
                </span>
                <span
                    className="flex items-center justify-center rounded-[6px] px-2 text-[13px] text-[#0a0a0a] tabular-nums"
                    style={{
                        background: "#f0f0f5",
                        height: 22,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        flexShrink: 0,
                    }}
                >
                    {feature.storyCount}
                </span>
                <ChevronIcon open={expanded} />
            </button>

            {/* Expanded: story cards section */}
            {expanded && stories.length > 0 && (
                <>
                    <div className="px-4 pt-3 pb-1.5">
                        <span
                            className="text-[12px] text-[#717182]"
                            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                        >
                            Story Cards
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 px-4 pb-3" style={{ background: "white" }}>
                        {stories.map((story, i) => (
                            <StoryCard key={story.slug} story={story} index={i} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// ---- Main Features content ----

export function FeaturesContent({
    features: apiFeatures,
}: {
    features?: FeatureSummary[]
}) {
    // When API data is available use it directly; otherwise build a minimal shape from FALLBACK_FEATURES
    const features: FeatureSummary[] = apiFeatures && apiFeatures.length > 0
        ? apiFeatures
        : FALLBACK_FEATURES.map((f, i) => ({
            slug: f.name.toLowerCase().replace(/\s+/g, "-"),
            title: f.name,
            desc: "",
            status: "planned",
            order: i,
            storyCount: f.count,
            suggestionCount: 0,
            stories: (f.items ?? []).map((item, j) => ({
                slug: item.num,
                title: item.label,
                status: item.status ?? "todo",
                priority: item.priority,
                order: j,
            })),
        }))

    const [expanded, setExpanded] = useState<string[]>(
        FALLBACK_FEATURES.filter((f) => f.expanded).map((f) => f.name.toLowerCase().replace(/\s+/g, "-")),
    )

    const toggle = (slug: string) =>
        setExpanded((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        )

    return (
        <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#f7f7fa" }}>
            {/* Panel header */}
            <div
                className="flex items-center gap-2 px-4 shrink-0"
                style={{
                    height: 44,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    background: "white",
                }}
            >
                <ToolBoxIcon />
                <span
                    className="text-[14px] text-[#0a0a0a]"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                    Feature
                </span>
                <span
                    className="flex items-center justify-center rounded-[6px] px-2 text-[13px] text-[#0a0a0a] tabular-nums"
                    style={{
                        background: "#f0f0f5",
                        height: 22,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                    }}
                >
                    {features.length}
                </span>
                <div className="flex-1" />
                <button
                    className="flex items-center justify-center rounded-[6px] hover:bg-gray-100 cursor-pointer transition-colors"
                    style={{ width: 28, height: 28 }}
                    aria-label="Toggle panel view"
                >
                    <PanelToggleIcon />
                </button>
            </div>

            {/* Feature list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {features.map((f) => (
                    <FeatureItem
                        key={f.slug}
                        feature={f}
                        expanded={expanded.includes(f.slug)}
                        onToggle={() => toggle(f.slug)}
                    />
                ))}

                {/* Add feature button */}
                <button
                    className="flex items-center justify-center gap-2 w-full rounded-[12px] text-[14px] text-[#717182] hover:bg-gray-100 cursor-pointer transition-colors"
                    style={{
                        height: 44,
                        border: "1px dashed rgba(0,0,0,0.15)",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                        background: "white",
                    }}
                >
                    <Icon icon="lucide:plus" width={16} height={16} color="#717182" />
                    Add a feature
                </button>
            </div>
        </div>
    )
}
