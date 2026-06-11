import { useState } from "react";
import type { FeatureSummary } from "../../api/projects";
import { DesignContent } from "./DesignContent";
import { FeatureListPanel } from "./FeatureListPanel";
import { PrdTabContent } from "./content/PrdTabContent";
import { MainTabBar } from "./content/MainTabBar";
import { useResizableWidth } from "./useResizableWidth";

type MainTabId = "PRD" | "Product";

const PRODUCT_LEFT_MIN_WIDTH = 240;
const PRODUCT_LEFT_MAX_WIDTH = 800;
const PRODUCT_LEFT_DEFAULT_WIDTH = 320;
const PRODUCT_LEFT_STORAGE_KEY = "mona-product-left-panel-width";

function ResizableHandle({
    onMouseDown,
}: {
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
}) {
    return (
        <div
            className="relative shrink-0 cursor-col-resize"
            style={{ width: 8 }}
            onMouseDown={onMouseDown}
        >
            <div
                className="absolute inset-y-0 left-[3px] w-px"
                style={{ background: "rgba(0,0,0,0.08)" }}
            />
        </div>
    );
}

export function ProjectWorkspaceContent({
    features: apiFeatures,
    projectSlug,
}: {
    features?: FeatureSummary[];
    projectSlug: string;
}) {
    const [activeTab, setActiveTab] = useState<MainTabId>("PRD");
    const { width: leftPanelWidth, onMouseDown } = useResizableWidth({
        min: PRODUCT_LEFT_MIN_WIDTH,
        max: PRODUCT_LEFT_MAX_WIDTH,
        default: PRODUCT_LEFT_DEFAULT_WIDTH,
        storageKey: PRODUCT_LEFT_STORAGE_KEY,
        side: "right",
    });

    return (
        <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{ background: "white" }}
        >
            <MainTabBar activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex flex-1 overflow-hidden">
                {activeTab === "PRD" ? (
                    <PrdTabContent projectSlug={projectSlug} />
                ) : activeTab === "Product" ? (
                    <div
                        className="flex flex-1 overflow-hidden"
                        style={{ background: "#f6f6f9", gap: 0 }}
                    >
                        <div
                            className="flex-shrink-0 overflow-hidden"
                            style={{ width: leftPanelWidth, padding: 16 }}
                        >
                            <FeatureListPanel
                                features={apiFeatures ?? []}
                                projectSlug={projectSlug}
                            />
                        </div>
                        <ResizableHandle onMouseDown={onMouseDown} />
                        <div
                            className="flex-1 min-w-0 overflow-hidden"
                            style={{ padding: 16 }}
                        >
                            <DesignContent projectSlug={projectSlug} />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
