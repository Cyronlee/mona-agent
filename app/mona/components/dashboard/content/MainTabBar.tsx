import { Icon } from "@iconify/react";

function FileTextIcon({ color }: { color: string }) {
    return (
        <Icon icon="lucide:file-text" width={16} height={16} color={color} />
    );
}

function ShoppingBagIcon({ color }: { color: string }) {
    return (
        <Icon icon="lucide:shopping-bag" width={16} height={16} color={color} />
    );
}

type MainTabId = "PRD" | "Product";

const MAIN_TABS = [
    { id: "PRD" as const, label: "PRD", Icon: FileTextIcon },
    { id: "Product" as const, label: "Product", Icon: ShoppingBagIcon },
] as const;

export function MainTabBar({
    activeTab,
    onChange,
}: {
    activeTab: MainTabId;
    onChange: (id: MainTabId) => void;
}) {
    return (
        <div
            className="flex items-center px-4 shrink-0"
            style={{
                height: 44,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                background: "white",
            }}
        >
            <div
                className="inline-flex items-center rounded-[999px] overflow-hidden"
                style={{
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    height: 36,
                }}
            >
                {MAIN_TABS.map((tab, index) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className="flex items-center gap-2 px-5 text-[14px] cursor-pointer transition-all"
                            style={{
                                background: isActive ? "#002557" : "#ffffff",
                                color: isActive ? "#FF7F26" : "#717182",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                border: "none",
                                height: "100%",
                                borderRadius: isActive
                                    ? (index === 0 ? "999px 0 0 999px" : "0 999px 999px 0")
                                    : (index === 0 ? "999px 0 0 999px" : "0 999px 999px 0"),
                            }}
                        >
                            <tab.Icon color={isActive ? "#FF7F26" : "#717182"} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div className="flex-1" />
            <button
                className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 cursor-pointer"
                style={{ width: 24, height: 24 }}
                aria-label="More options"
            >
                <Icon
                    icon="lucide:more-horizontal"
                    width={16}
                    height={16}
                    color="#717182"
                />
            </button>
        </div>
    );
}
