import { Icon } from "@iconify/react";
import { useResizableWidth } from "./useResizableWidth";
import { ChatPanel } from "../chat/ChatPanel";

const RIGHT_PANEL_MIN_WIDTH = 320;
const RIGHT_PANEL_MAX_WIDTH = 600;
const RIGHT_PANEL_DEFAULT_WIDTH = 380;
const RIGHT_PANEL_STORAGE_KEY = "mona-dashboard-right-panel-width";

const PANEL_OPTIONS = {
  min: RIGHT_PANEL_MIN_WIDTH,
  max: RIGHT_PANEL_MAX_WIDTH,
  default: RIGHT_PANEL_DEFAULT_WIDTH,
  storageKey: RIGHT_PANEL_STORAGE_KEY,
};

function ResizeHandle({
  onMouseDown,
}: {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
}) {
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

type RightPanelProps = {
  onClose: () => void;
  projectSlug: string;
};

export function RightPanel({ onClose, projectSlug }: RightPanelProps) {
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
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-[8px] hover:bg-gray-50"
        style={{ width: 24, height: 24 }}
        aria-label="Close chat panel"
      >
        <Icon icon="lucide:x" width={14} height={14} color="#717182" />
      </button>
      <ChatPanel projectSlug={projectSlug} />
    </aside>
  );
}
