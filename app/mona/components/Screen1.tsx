"use client";

import { IdeaStep } from "@/app/new/components/NewSteps";

export function Screen1({ onNext }: { onNext: (title: string) => void }) {
    return <IdeaStep onNext={onNext} />;
}
