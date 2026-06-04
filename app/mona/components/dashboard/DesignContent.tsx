import { useState } from "react";
import { Icon } from "@iconify/react";

const DESIGN_TABS = ["Prototype", "Design system"];

function PrototypeSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[12px] w-[315px] bg-[#ececf0] rounded-[4px]" />

      <div className="flex items-center justify-center p-6 bg-[#ececf0] rounded-[4px]">
        <div className="flex gap-10 items-center w-full max-w-[800px] justify-center">
          <div className="w-[326px] h-[160px] bg-white rounded-[8px] shadow-sm flex items-center justify-center text-gray-300" />
          <div className="w-[326px] h-[160px] bg-white rounded-[8px] shadow-sm flex items-center justify-center text-gray-300" />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-[80px] w-[202px] bg-[#ececf0] rounded-[4px]" />
        <div className="h-[80px] w-[202px] bg-[#ececf0] rounded-[4px]" />
        <div className="h-[80px] w-[202px] bg-[#ececf0] rounded-[4px]" />
      </div>

      <div className="h-[10px] w-full bg-[#ececf0] rounded-[4px]" />
      <div className="h-[10px] w-full bg-[#ececf0] rounded-[4px]" />
      <div className="h-[64px] w-full bg-[#ececf0] opacity-60 rounded-[4px]" />
    </div>
  );
}

function PrototypePanel() {
  return (
    <div className="flex flex-col flex-1 p-4 bg-[#feffff] overflow-y-auto">
      <div className="flex justify-end mb-3">
        <button className="flex items-center gap-1.5 px-2 h-[32px] rounded-[4px] bg-[#f6f6f9] hover:bg-gray-200 cursor-pointer">
          <Icon icon="lucide:download" width={16} height={16} color="rgba(113,113,130,0.6)" />
          <span
            className="text-[12px] text-[rgba(113,113,130,0.6)]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Export
          </span>
        </button>
      </div>
      <PrototypeSkeletons />
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

export function DesignContent() {
  const [activeDesignTab, setActiveDesignTab] = useState(DESIGN_TABS[0]);

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: "#f6f6f9", padding: 16 }}
    >
      <div className="flex flex-col flex-1 overflow-hidden rounded-[12px] bg-white border border-[#e5e5e5] shadow-[0px_0px_3px_rgba(144,151,161,0.1)]">
        <DesignTabs activeTab={activeDesignTab} onChange={setActiveDesignTab} />
        <PrototypePanel />
      </div>
    </div>
  );
}
