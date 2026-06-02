import { Svg14 } from "./icons";
import { useResizableWidth } from "./useResizableWidth";

const RIGHT_PANEL_MIN_WIDTH = 280;
const RIGHT_PANEL_MAX_WIDTH = 560;
const RIGHT_PANEL_DEFAULT_WIDTH = 360;
const RIGHT_PANEL_STORAGE_KEY = "mona-dashboard-right-panel-width";

const PANEL_OPTIONS = {
  min: RIGHT_PANEL_MIN_WIDTH,
  max: RIGHT_PANEL_MAX_WIDTH,
  default: RIGHT_PANEL_DEFAULT_WIDTH,
  storageKey: RIGHT_PANEL_STORAGE_KEY,
};

const AGENT_STATUSES = [
  {
    name: "Planner",
    status: "Working on synthesis",
    detail: "Clustered 12 stakeholder notes into three candidate backlog themes.",
  },
  {
    name: "Builder",
    status: "Waiting for decision",
    detail:
      "Needs confirmation on whether search should live in top nav or feed filters.",
  },
  {
    name: "Reviewer",
    status: "Ready",
    detail:
      "Can generate acceptance criteria after the selected suggestion is approved.",
  },
];

function ResizeHandle({ onMouseDown }: { onMouseDown: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div
      className="absolute inset-y-0 left-0 z-10 cursor-col-resize"
      style={{ width: 8 }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute inset-y-0 left-[3px] w-px"
        style={{ background: "rgba(0,0,0,0.08)" }}
      />
    </div>
  );
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex items-center justify-between shrink-0 pl-4 pr-3"
      style={{
        height: 40,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="rounded-full"
          style={{ width: 6, height: 6, background: "#4ade80" }}
        />
        <span
          className="text-[12px] text-[#0a0a0a]"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
        >
          AI Chat
        </span>
      </div>
      <button
        onClick={onClose}
        className="flex items-center justify-center rounded-[8px] hover:bg-gray-50"
        style={{ width: 24, height: 24 }}
        aria-label="Close AI panel"
      >
        <Svg14>
          <path
            d="M10.5 3.5L3.5 10.5"
            stroke="#717182"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 3.5L10.5 10.5"
            stroke="#717182"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg14>
      </button>
    </div>
  );
}

function MonaActiveBanner() {
  return (
    <div
      className="mb-4 rounded-[14px] p-3"
      style={{
        background: "#f8fafc",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <p
        className="mb-1 text-[11px] text-[#717182]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Mona Active
      </p>
      <p
        className="text-[13px] text-[#0a0a0a]"
        style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
      >
        Reviewing inbox suggestions and aligning PRD updates with design tasks.
      </p>
    </div>
  );
}

function AgentStatusItem({
  name,
  status,
  detail,
}: {
  name: string;
  status: string;
  detail: string;
}) {
  return (
    <div
      className="mb-3 rounded-[14px] p-3"
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span
          className="text-[12px] text-[#0a0a0a]"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
        >
          {name}
        </span>
        <span
          className="text-[10px] text-[#717182]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {status}
        </span>
      </div>
      <p
        className="text-[12px] text-[#4b5563]"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {detail}
      </p>
    </div>
  );
}

function PanelFooter() {
  return (
    <div
      className="shrink-0 p-3"
      style={{
        borderTop: "1px solid rgba(0,0,0,0.06)",
        background: "white",
      }}
    >
      <div
        className="rounded-[12px] px-3 py-2"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#f8fafc",
        }}
      >
        <p
          className="text-[12px] text-[#717182]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Ask Mona to apply a selected inbox suggestion to the PRD.
        </p>
      </div>
    </div>
  );
}

export function RightPanel({ onClose }: { onClose: () => void }) {
  const { width, onMouseDown } = useResizableWidth(PANEL_OPTIONS);

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
      style={{
        width,
        borderLeft: "1px solid rgba(0,0,0,0.08)",
        background: "#ffffff",
      }}
    >
      <ResizeHandle onMouseDown={onMouseDown} />
      <PanelHeader onClose={onClose} />

      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ background: "#fcfcfd" }}
      >
        <MonaActiveBanner />
        {AGENT_STATUSES.map((item) => (
          <AgentStatusItem key={item.name} {...item} />
        ))}
      </div>

      <PanelFooter />
    </aside>
  );
}
