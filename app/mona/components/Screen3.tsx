"use client";

import { useEffect } from "react";
import { LoadingStep } from "@/app/new/components/NewSteps";

type Draft = {
    title: string;
    description: string;
};

type CreateProjectFn = (input: {
    title: string;
    desc?: string;
}) => Promise<{ slug: string }>;

type Screen3Props = {
    draft: Draft;
    onDone: (createdSlug: string) => void | Promise<void>;
    onFailure: (message: string) => void;
    createProjectFn: CreateProjectFn;
};

export function Screen3({
    draft,
    onDone,
    onFailure,
    createProjectFn,
}: Screen3Props) {
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const project = await createProjectFn({
                    title: draft.title,
                    desc: draft.description || undefined,
                });
                if (cancelled) return;
                await onDone(project.slug);
            } catch (error) {
                if (cancelled) return;
                const message =
                    error instanceof Error ? error.message : "Failed to create project";
                onFailure(message);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [createProjectFn, draft.description, draft.title, onDone, onFailure]);

    return <LoadingStep />;
}
