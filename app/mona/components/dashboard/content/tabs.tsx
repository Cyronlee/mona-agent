import { Icon } from "@iconify/react";

function EyeIcon({ color }: { color: string }) {
    return <Icon icon="lucide:eye" width={14} height={14} color={color} />;
}

function FileTextIcon({ color }: { color: string }) {
    return <Icon icon="lucide:file-text" width={14} height={14} color={color} />;
}

function PaletteIcon({ color }: { color: string }) {
    return <Icon icon="lucide:palette" width={14} height={14} color={color} />;
}

function CodeIcon({ color }: { color: string }) {
    return <Icon icon="lucide:code" width={14} height={14} color={color} />;
}

function ListIcon({ color }: { color: string }) {
    return <Icon icon="lucide:list" width={14} height={14} color={color} />;
}

export const TABS_CONFIG = [
    { id: "Preview", label: "Preview", Icon: EyeIcon },
    { id: "PRD", label: "PRD", Icon: FileTextIcon },
    { id: "Design", label: "Design", Icon: PaletteIcon },
    { id: "Features", label: "Features", Icon: ListIcon },
    { id: "Code", label: "Code", Icon: CodeIcon },
] as const;

export type TabId = (typeof TABS_CONFIG)[number]["id"];
