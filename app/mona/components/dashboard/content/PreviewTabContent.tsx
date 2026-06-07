import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getProjectPreview,
    type ProjectPreviewState,
} from "../../../api/projects";
import { PreviewWebPane } from "./PreviewWebPane";

function StatusPill({ status }: { status: ProjectPreviewState["status"] }) {
    const tone = useMemo(() => {
        if (status === "ready") {
            return {
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
            };
        }
        if (status === "running") {
            return {
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                color: "#9a3412",
            };
        }
        if (status === "error") {
            return {
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
            };
        }
        return {
            background: "#f5f5f5",
            border: "1px solid #e4e4e7",
            color: "#52525b",
        };
    }, [status]);

    return (
        <span
            className="inline-flex items-center gap-1 rounded-[999px] px-2 py-1 text-[12px]"
            style={{
                ...tone,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                lineHeight: "12px",
            }}
        >
            {status === "running" && (
                <Icon
                    icon="lucide:loader-circle"
                    width={12}
                    height={12}
                    className="animate-spin"
                />
            )}
            {status}
        </span>
    );
}

export function PreviewTabContent({ projectSlug }: { projectSlug: string }) {
    const [preview, setPreview] = useState<ProjectPreviewState | null>(null);

    const loadPreview = useCallback(async () => {
        try {
            const data = await getProjectPreview(projectSlug);
            setPreview(data);
        } catch (error) {
            console.error("Failed to fetch project preview:", error);
            setPreview({
                url: "",
                status: "error",
                pid: null,
            });
        }
    }, [projectSlug]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadPreview();
    }, [loadPreview]);

    useEffect(() => {
        if (preview?.status !== "running") return;
        const timer = window.setInterval(() => {
            void loadPreview();
        }, 3000);
        return () => window.clearInterval(timer);
    }, [preview?.status, loadPreview]);

    if (preview === null) {
        return (
            <div className="flex-1 flex items-center justify-center text-[#717182]">
                Loading...
            </div>
        );
    }

    const url = preview.url;

    return (
        <div className="flex flex-col flex-1 min-h-0 p-2 gap-4" style={{ background: "#f6f6f9" }}>

            <PreviewWebPane key={url || "empty-preview"} url={url} />
        </div>
    );
}
