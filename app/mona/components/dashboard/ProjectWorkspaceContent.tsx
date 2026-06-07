import { useState } from "react";
import type { FeatureSummary } from "../../api/projects";
import { CodeWorkspace } from "./CodeWorkspace";
import { DesignContent } from "./DesignContent";
import { FeaturesTabContent } from "./content/FeaturesTabContent";
import { PreviewTabContent } from "./content/PreviewTabContent";
import { PrdTabContent } from "./content/PrdTabContent";
import { WorkspaceTabBar } from "./content/WorkspaceTabBar";
import type { TabId } from "./content/tabs";

function PlaceholderBody({ label }: { label: string }) {
    return (
        <div
            className="flex-1 flex items-center justify-center text-[#717182]"
            style={{ fontFamily: "Poppins, sans-serif" }}
        >
            {label} Content (Placeholder)
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
    const [activeTab, setActiveTab] = useState<TabId>("PRD");

    return (
        <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{ background: "white" }}
        >
            <WorkspaceTabBar activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex flex-1 overflow-hidden">
                {activeTab === "Preview" ? (
                    <PreviewTabContent projectSlug={projectSlug} />
                ) : activeTab === "PRD" ? (
                    <PrdTabContent projectSlug={projectSlug} />
                ) : activeTab === "Design" ? (
                    <DesignContent />
                ) : activeTab === "Features" ? (
                    <FeaturesTabContent
                        features={apiFeatures ?? []}
                        projectSlug={projectSlug}
                    />
                ) : activeTab === "Code" ? (
                    <CodeWorkspace projectSlug={projectSlug} />
                ) : (
                    <PlaceholderBody label={activeTab} />
                )}
            </div>
        </div>
    );
}
