"use client";

import {
    SetupStep,
    type SetupDraft,
} from "@/app/new/components/NewSteps";

type Screen2Props = {
    initialName: string;
    initialDescription: string;
    errorMessage?: string | null;
    onBack: () => void;
    onStart: (payload: { title: string; description: string }) => void;
};

export function Screen2({
    initialName,
    initialDescription,
    errorMessage,
    onBack,
    onStart,
}: Screen2Props) {
    const initialDraft: SetupDraft = {
        projectName: initialName,
        domain: "Retail",
        description: initialDescription,
        toggles: null,
    };

    return (
        <SetupStep
            initialDraft={initialDraft}
            errorMessage={errorMessage}
            onBack={() => onBack()}
            onStart={(draft) =>
                onStart({
                    title: draft.projectName,
                    description: draft.description,
                })
            }
        />
    );
}
