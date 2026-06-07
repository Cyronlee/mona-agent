import { Icon } from "@iconify/react";
import { TABS_CONFIG, type TabId } from "./tabs";

export function WorkspaceTabBar({
    activeTab,
    onChange,
}: {
    activeTab: TabId;
    onChange: (id: TabId) => void;
}) {
    return (
        <div
            className="flex items-center gap-2 px-4 shrink-0"
            style={{
                height: 44,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                background: "white",
            }}
        >
            {TABS_CONFIG.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className="flex items-center gap-2 px-4 rounded-[8px] text-[14px] cursor-pointer transition-all"
                        style={{
                            height: 32,
                            background: isActive ? "#002557" : "white",
                            border: isActive
                                ? "1px solid #002557"
                                : "1px solid rgba(113,113,130,0.2)",
                            color: isActive ? "#FF7F26" : "#717182",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 600,
                        }}
                    >
                        <tab.Icon color={isActive ? "#FF7F26" : "#717182"} />
                        {tab.label}
                    </button>
                );
            })}
            <div className="flex-1" />
            <button
                className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 cursor-pointer"
                style={{ width: 24, height: 24 }}
                aria-label="More options"
            >
                <Icon
                    icon="lucide:more-horizontal"
                    width={12}
                    height={12}
                    color="#717182"
                />
            </button>
        </div>
    );
}
