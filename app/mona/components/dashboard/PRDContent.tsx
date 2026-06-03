import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { getProjectPrd } from "../../api/projects";
import type { FeatureSummary } from "../../api/projects";
import { DesignContent } from "./DesignContent";
import { FeaturesContent } from "./FeaturesContent";

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

const TABS_CONFIG = [
  { id: "Preview", label: "Preview", Icon: EyeIcon },
  { id: "PRD", label: "PRD", Icon: FileTextIcon },
  { id: "Design", label: "Design", Icon: PaletteIcon },
  { id: "Features", label: "Features", Icon: ListIcon },
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
        <Icon icon="lucide:more-horizontal" width={12} height={12} color="#717182" />
      </button>
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

function PrdBody({ projectSlug }: { projectSlug: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [headings, setHeadings] = useState<string[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProjectPrd(projectSlug)
      .then((prd) => {
        setContent(prd.content);
        const h2s = prd.content.match(/^## (.+)$/gm);
        if (h2s) {
          const texts = h2s.map((h) => h.replace(/^## /, ""));
          setHeadings(texts);
          setActiveHeading(texts[0]);
        }
      })
      .catch(console.error);
  }, [projectSlug]);

  const scrollToHeading = useCallback((heading: string) => {
    const container = containerRef.current;
    if (!container) return;
    const h2Elements = container.querySelectorAll("h2");
    for (const el of h2Elements) {
      if (el.textContent?.trim() === heading) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveHeading(heading);
        break;
      }
    }
  }, []);

  if (content === null) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-[#717182]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {headings.length > 0 && (
        <div
          className="flex flex-col gap-0.5 p-3 shrink-0 overflow-y-auto"
          style={{
            width: 180,
            borderRight: "1px solid rgba(0,0,0,0.06)",
            background: "#fafafa",
          }}
        >
          {headings.map((h) => (
            <button
              key={h}
              onClick={() => scrollToHeading(h)}
              className="text-left px-2 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-all"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: activeHeading === h ? 500 : 400,
                color: activeHeading === h ? "#FF7F26" : "#717182",
                background: activeHeading === h ? "#fff7f0" : "transparent",
              }}
            >
              {h}
            </button>
          ))}
        </div>
      )}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-8 py-6">
        <MDXEditor
          markdown={content}
          readOnly
          contentEditableClassName="prose prose-sm max-w-none focus:outline-none"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            tablePlugin(),
            codeBlockPlugin(),
          ]}
        />
      </div>
    </div>
  );
}

export function PRDContent({
  features: apiFeatures,
  projectSlug,
}: {
  features?: FeatureSummary[];
  projectSlug: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("PRD");

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: "white" }}
    >
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "PRD" ? (
          <PrdBody projectSlug={projectSlug} />
        ) : activeTab === "Design" ? (
          <DesignContent features={apiFeatures} />
        ) : activeTab === "Features" ? (
          <FeaturesContent features={apiFeatures} />
        ) : (
          <PlaceholderBody label={activeTab} />
        )}
      </div>
    </div>
  );
}
