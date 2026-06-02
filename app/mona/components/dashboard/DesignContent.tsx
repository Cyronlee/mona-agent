import { useState } from "react";
import svgPaths from "../../../assets/svgDashboard";
import { Svg12, Svg14, Svg16 } from "./icons";
import { ToolBoxIcon } from "./dashboardIcons";
import { toDesignFeatures, type DesignFeature, type DesignStatus } from "./prdData";

const DESIGN_TABS = ["Prototype", "Design system"];

function StatusIcon({ type }: { type: DesignStatus }) {
  if (type === "Done") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 24, height: 24, background: "#002557" }}
      >
        <Svg12>
          <path
            d="M2.5 6.5L5 9L9.5 3.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg12>
      </div>
    );
  }
  if (type === "WIP") {
    return (
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 24, height: 24, background: "#FF7F26" }}
      >
        <Svg12>
          <path d="M3 6h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </Svg12>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: 24, height: 24, background: "#ececf0" }}
    >
      <Svg12>
        <path
          d="M4 3.5v5M8 3.5v5"
          stroke="#717182"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg12>
    </div>
  );
}

function FeatureList({
  features,
}: {
  features: DesignFeature[];
}) {
  return (
    <div className="flex flex-col p-4 gap-2">
      {features.map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-2 p-2 rounded-[10px] border border-[rgba(0,0,0,0.1)] hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <StatusIcon type={f.status} />
          <span
            className="flex-1 text-[14px] text-[#0a0a0a] truncate"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            {f.name}
          </span>
          <span
            className="flex items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#717182]"
            style={{
              background: "#eef3f2",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 500,
            }}
          >
            {f.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeatureListPanel({ features }: { features: DesignFeature[] }) {
  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto rounded-[12px] bg-white"
      style={{
        width: 280,
        border: "1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 0px 3px rgba(144,151,161,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-[rgba(0,0,0,0.1)] shrink-0"
        style={{ height: 40 }}
      >
        <div className="flex items-center gap-2">
          <ToolBoxIcon />
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Feature
          </span>
          <span
            className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
            style={{
              background: "#eceef2",
              height: 22,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {features.length}
          </span>
        </div>
        <button className="hover:opacity-70">
          <Svg14>
            <path d={svgPaths.pc990c00} fill="#717182" />
          </Svg14>
        </button>
      </div>
      <FeatureList features={features} />
    </div>
  );
}

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
          <Svg16>
            <path
              d="M4 12v-2h8v2H4zm4-4L5 5h6L8 8z"
              fill="rgba(113,113,130,0.6)"
            />
          </Svg16>
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

export function DesignContent({
  features: apiFeatures,
}: {
  features?: Parameters<typeof toDesignFeatures>[0];
}) {
  const [activeDesignTab, setActiveDesignTab] = useState(DESIGN_TABS[0]);
  const features = toDesignFeatures(apiFeatures);

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={{ background: "#f6f6f9", padding: 16, gap: 16 }}
    >
      <FeatureListPanel features={features} />
      <div className="flex flex-col flex-1 overflow-hidden rounded-[12px] bg-white border border-[#e5e5e5] shadow-[0px_0px_3px_rgba(144,151,161,0.1)]">
        <DesignTabs activeTab={activeDesignTab} onChange={setActiveDesignTab} />
        <PrototypePanel />
      </div>
    </div>
  );
}
