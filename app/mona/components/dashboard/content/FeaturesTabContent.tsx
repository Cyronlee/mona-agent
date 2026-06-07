import type { FeatureSummary } from "../../../api/projects";
import { FeatureListPanel } from "../FeatureListPanel";

export function FeaturesTabContent({
    projectSlug,
    features,
}: {
    projectSlug: string;
    features: FeatureSummary[];
}) {
    return (
        <div
            className="flex flex-1 overflow-hidden"
            style={{ background: "#f6f6f9", padding: 16, gap: 16 }}
        >
            <FeatureListPanel features={features} projectSlug={projectSlug} />
        </div>
    );
}
