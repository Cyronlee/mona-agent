import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { CodeWorkspace } from "./CodeWorkspace";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { getProjectPrd, updateProjectPrd } from "../../api/projects";
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

function ReadOnlyEditor({ markdown }: { markdown: string }) {
  return (
    <MDXEditor
      markdown={markdown}
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
  );
}

function EditableEditor({
  markdown,
  mdxRef,
}: {
  markdown: string;
  mdxRef: React.RefObject<MDXEditorMethods | null>;
}) {
  return (
    <MDXEditor
      ref={mdxRef}
      markdown={markdown}
      contentEditableClassName="prose prose-sm max-w-none focus:outline-none min-h-[400px]"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        tablePlugin(),
        codeBlockPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <CreateLink />
              <CodeToggle />
              <InsertThematicBreak />
              <UndoRedo />
            </>
          ),
        }),
      ]}
    />
  );
}

function PrdBody({ projectSlug }: { projectSlug: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [headings, setHeadings] = useState<string[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const originalRef = useRef<string>("");
  const mdxRef = useRef<MDXEditorMethods | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProjectPrd(projectSlug)
      .then((prd) => {
        setContent(prd.content);
        originalRef.current = prd.content;
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

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setContent(originalRef.current);
    setEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    const markdown = mdxRef.current?.getMarkdown();
    if (markdown == null) return;
    setSaving(true);
    try {
      await updateProjectPrd(projectSlug, markdown);
      setContent(markdown);
      originalRef.current = markdown;
      setEditing(false);
    } catch (err) {
      console.error("Failed to save PRD:", err);
    } finally {
      setSaving(false);
    }
  }, [projectSlug]);

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
      {!editing && headings.length > 0 && (
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
      <div ref={containerRef} className="flex-1 overflow-y-auto px-8 py-6 relative">
        {!editing && (
          <div className="absolute top-6 right-8 z-10">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
              style={{
                height: 32,
                border: "1px solid rgba(0,0,0,0.1)",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              <Icon icon="lucide:pencil" width={14} height={14} color="#717182" />
              Edit
            </button>
          </div>
        )}
        {editing && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 rounded-[8px] text-[13px] text-white cursor-pointer disabled:opacity-50"
              style={{
                height: 32,
                background: "#002557",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              <Icon icon="lucide:check" width={14} height={14} color="white" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer disabled:opacity-50"
              style={{
                height: 32,
                border: "1px solid rgba(0,0,0,0.1)",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
              }}
            >
              <Icon icon="lucide:x" width={14} height={14} color="#717182" />
              Cancel
            </button>
          </div>
        )}
        {editing ? (
          <EditableEditor markdown={content} mdxRef={mdxRef} />
        ) : (
          <ReadOnlyEditor markdown={content} />
        )}
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
  let body: React.ReactNode;

  if (activeTab === "PRD") {
    body = <PrdBody projectSlug={projectSlug} />;
  } else if (activeTab === "Design") {
    body = <DesignContent features={apiFeatures} />;
  } else if (activeTab === "Features") {
    body = <FeaturesContent features={apiFeatures} />;
  } else if (activeTab === "Code") {
    body = <CodeWorkspace projectSlug={projectSlug} />;
  } else {
    body = <PlaceholderBody label={activeTab} />;
  }

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: "white" }}
    >
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">{body}</div>
    </div>
  );
}
