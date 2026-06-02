import { useState } from "react";
import svgPaths from "../../../assets/svgDashboard";
import type { FeatureSummary } from "../../api/projects";
import { Svg12, Svg14, pf } from "./icons";
import { ToolBoxIcon } from "./dashboardIcons";
import { DesignContent } from "./DesignContent";
import {
  PRD_NAV,
  toPrdFeatures,
  type FeatureRow,
} from "./prdData";

function EyeIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.0833 1.75H2.91667C2.27233 1.75 1.75 2.27233 1.75 2.91667V11.0833C1.75 11.7277 2.27233 12.25 2.91667 12.25H11.0833C11.7277 12.25 12.25 11.7277 12.25 11.0833V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75Z"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 1.75V12.25"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66667 5.25L6.41667 7L4.66667 8.75"
        stroke={color}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileTextIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M4.08333 1.16667C3.43583 1.16667 2.91667 1.68583 2.91667 2.33333V11.6667C2.91667 12.3142 3.43583 12.8333 4.08333 12.8333H9.91667C10.5642 12.8333 11.0833 12.3142 11.0833 11.6667V4.08333L8.16667 1.16667H4.08333ZM4.08333 2.33333H7.58333V4.66667H9.91667V11.6667H4.08333V2.33333ZM5.25 5.83333V7H8.75V5.83333H5.25ZM5.25 8.16667V9.33333H8.75V8.16667H5.25Z"
        fill={color}
      />
    </svg>
  );
}

function PaletteIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d={svgPaths.p17c66200}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={svgPaths.p31eedf00}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 4.5H4" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6.5H4" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8.5H4" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CodeIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 10.5L0 7L3.5 3.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 10.5L14 7L10.5 3.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.16667 1.16667L5.83333 12.8333" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS_CONFIG = [
  { id: "Preview", label: "Preview", Icon: EyeIcon },
  { id: "PRD", label: "PRD", Icon: FileTextIcon },
  { id: "Design", label: "Design", Icon: PaletteIcon },
  { id: "Code", label: "Code", Icon: CodeIcon },
] as const;

type TabId = (typeof TABS_CONFIG)[number]["id"];

function TabBar({
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
        <Svg12>
          {pf(
            "M6 1.5H1C1.5 1.5 1 1 1 1.5V10.5C1 11 1.5 11 1.5 11H10C10.5 11 10.5 10.5 10.5 10V5.5",
            "#717182",
          )}
        </Svg12>
      </button>
    </div>
  );
}

function SectionNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (item: string) => void;
}) {
  return (
    <div
      className="flex flex-col gap-0.5 p-3 shrink-0 overflow-y-auto"
      style={{
        width: 180,
        borderRight: "1px solid rgba(0,0,0,0.06)",
        background: "#fafafa",
      }}
    >
      {PRD_NAV.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className="text-left px-2 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-all"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: active === item ? 500 : 400,
            color: active === item ? "#FF7F26" : "#717182",
            background: active === item ? "#fff7f0" : "transparent",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function PrdHeader() {
  return (
    <div className="flex items-start justify-between mb-4">
      <h1
        className="text-[22px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
      >
        Product Requirement Document
      </h1>
      <div className="flex gap-2">
        <button
          className="flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
          style={{
            height: 32,
            border: "1px solid rgba(0,0,0,0.1)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d={svgPaths.p127a080} fill="#717182" />
          </svg>
          History
        </button>
        <button
          className="flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
          style={{
            height: 32,
            border: "1px solid rgba(0,0,0,0.1)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d={svgPaths.p2213bc80} fill="#717182" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}

function FeatureCountBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <ToolBoxIcon />
      <span
        className="text-[14px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
      >
        Feature
      </span>
      <span
        className="px-2 rounded-[6px] text-[13px] text-[#0a0a0a]"
        style={{
          background: "#f0f0f5",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
        }}
      >
        {count}
      </span>
      <div className="flex-1" />
      <button className="hover:opacity-70">
        <Svg14>
          <path d={svgPaths.pc990c00} fill="#717182" />
        </Svg14>
      </button>
    </div>
  );
}

function FeatureSubItem({
  num,
  priority,
  label,
}: {
  num: string;
  priority: number;
  label: string;
}) {
  return (
    <div
      className="flex flex-col px-6 py-2 cursor-pointer hover:bg-blue-50"
      style={{ borderTop: "1px solid #e5e7eb" }}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: priority === 1 ? "#002557" : "#6b727e",
            flexShrink: 0,
          }}
        />
        <span
          className="text-[12px] text-[#717182]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {num} &nbsp; Priority {priority}
        </span>
      </div>
      <div
        className="pl-4 text-[14px] text-[#0a0a0a] pb-1"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
          borderBottom: "3px solid #002557",
          paddingBottom: 6,
          marginLeft: 16,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FeatureRowItem({
  feature,
  expanded,
  onToggle,
}: {
  feature: FeatureRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid #e5e7eb" }}>
      <button
        className="flex items-center justify-between w-full px-2 py-3 hover:bg-gray-50 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div className="opacity-50">
            <ToolBoxIcon />
          </div>
          <span
            className="text-[14px] text-[#0a0a0a]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {feature.name}
          </span>
        </div>
        <span
          className="text-[13px] text-[#717182]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {feature.count}
        </span>
      </button>

      {expanded && feature.items && (
        <div className="flex flex-col">
          {feature.items.map((item) => (
            <FeatureSubItem key={item.num} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

function PrdBody({ features }: { features: FeatureRow[] }) {
  const [activeNav, setActiveNav] = useState("Feature Requirements");
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (name: string) =>
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return (
    <div className="flex flex-1 overflow-hidden">
      <SectionNav active={activeNav} onChange={setActiveNav} />
      <div className="flex-1 overflow-y-auto px-8 py-6 relative">
        <PrdHeader />
        <h2
          className="text-[16px] text-[#0a0a0a] mb-3"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
        >
          Feature Requirements
        </h2>
        <FeatureCountBadge count={features.length} />
        <div
          className="flex flex-col"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          {features.map((f) => (
            <FeatureRowItem
              key={f.name}
              feature={f}
              expanded={expanded.includes(f.name)}
              onToggle={() => toggle(f.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderBody({ label }: { label: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center text-[#717182]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {label} Content (Placeholder)
    </div>
  );
}

export function PRDContent({ features: apiFeatures }: { features?: FeatureSummary[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("PRD");
  const features = toPrdFeatures(apiFeatures);

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: "white" }}
    >
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "PRD" ? (
          <PrdBody features={features} />
        ) : activeTab === "Design" ? (
          <DesignContent features={apiFeatures} />
        ) : (
          <PlaceholderBody label={activeTab} />
        )}
      </div>
    </div>
  );
}
