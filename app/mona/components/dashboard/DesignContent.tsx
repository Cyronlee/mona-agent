import { useState } from "react";
import { Icon } from "@iconify/react";
import { PreviewTabContent } from "./content/PreviewTabContent";
import { CodeWorkspace } from "./CodeWorkspace";

const DESIGN_TABS = ["Prototype", "Design System", "Code"];

function DesignSystemPanel() {
  const HEADER_HEIGHT = 56;

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <iframe
        src="https://ui.shadcn.com/create"
        className="w-full border-0"
        title="shadcn/ui Design System"
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          height: `calc(100% + ${HEADER_HEIGHT}px)`,
          transform: `translateY(-${HEADER_HEIGHT}px)`,
        }}
      />
    </div>
  );
}

function DesignTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex items-end bg-[#eaeaea] rounded-t-[12px] shrink-0 h-[32px]">
      {DESIGN_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="flex items-center justify-center h-[32px] px-4 rounded-t-[12px] cursor-pointer"
          style={{
            width: 140,
            background: activeTab === tab ? "#feffff" : "#eaeaea",
            zIndex: activeTab === tab ? 2 : 1,
          }}
        >
          <span
            className="text-[14px] text-[#222]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}

export function DesignContent({ projectSlug }: { projectSlug: string }) {
  const [activeDesignTab, setActiveDesignTab] = useState(DESIGN_TABS[0]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden rounded-[12px] bg-white border border-[#e5e5e5] shadow-[0px_0px_3px_rgba(144,151,161,0.1)]">
        <DesignTabs activeTab={activeDesignTab} onChange={setActiveDesignTab} />
        {activeDesignTab === "Prototype" && (
          <PreviewTabContent projectSlug={projectSlug} />
        )}
        {activeDesignTab === "Design System" && (
          <DesignSystemPanel />
        )}
        {activeDesignTab === "Code" && (
          <CodeWorkspace projectSlug={projectSlug} />
        )}
      </div>
    </div>
  );
}
