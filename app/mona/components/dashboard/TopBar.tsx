import svgPaths from "../../../assets/svgDashboard";
import { Svg12, Svg14, pf } from "./icons";
import {
  BellIcon,
  HelpIcon,
  PanelToggleIcon,
  SearchIcon,
} from "./dashboardIcons";

const imgLogo = "/mona/logo.png";

type TopBarProps = {
  inboxCollapsed: boolean;
  rightPanelOpen: boolean;
  onToggleInbox: () => void;
  onToggleRightPanel: () => void;
  projectTitle: string;
};

export function TopBar({
  inboxCollapsed,
  rightPanelOpen,
  onToggleInbox,
  onToggleRightPanel,
  projectTitle,
}: TopBarProps) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex items-center gap-3 px-3 shrink-0 w-full"
      style={{
        height: 48,
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        background: "white",
      }}
    >
      <button
        onClick={onToggleInbox}
        className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 transition-colors"
        style={{
          width: 28,
          height: 28,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
        aria-label={inboxCollapsed ? "Expand inbox" : "Collapse inbox"}
      >
        <PanelToggleIcon side="left" open={!inboxCollapsed} />
      </button>

      <div
        className="flex items-center px-2 shrink-0"
        style={{
          height: "100%",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          width: 103,
        }}
      >
        <img
          src={imgLogo}
          alt="Mona"
          style={{ height: 21, width: 85, objectFit: "cover" }}
        />
      </div>

      <div className="flex items-center gap-1.5 px-1 shrink-0">
        <span
          className="text-[14px] text-[#717182]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Project
        </span>
        <Svg12>{pf("M4.5 9L7.5 6L4.5 3", "#717182")}</Svg12>
        <span
          className="text-[14px] text-[#0a0a0a]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {projectTitle}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div
          className="flex h-8 w-full max-w-[320px] items-center gap-2 rounded-[10px] px-3"
          style={{
            background: "rgba(241,245,249,0.9)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <SearchIcon />
          <span
            className="text-[12px] text-[#717182]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            搜索文档、任务 (⌘K)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50"
          style={{ width: 28, height: 28 }}
          aria-label="Notifications"
        >
          <BellIcon />
        </button>
        <button
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50"
          style={{ width: 28, height: 28 }}
          aria-label="Help"
        >
          <HelpIcon />
        </button>
        <button
          onClick={onToggleRightPanel}
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 transition-colors"
          style={{
            width: 28,
            height: 28,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
          aria-label={rightPanelOpen ? "Collapse AI panel" : "Expand AI panel"}
        >
          <PanelToggleIcon side="right" open={rightPanelOpen} />
        </button>
        <button
          className="flex items-center gap-1 px-2 rounded-[8px] text-[12px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
          style={{
            height: 28,
            border: "1px solid rgba(0,0,0,0.1)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
          }}
        >
          <Svg12>
            {pf(svgPaths.pd38a270)}
            {pf(svgPaths.p21de3c80)}
            {pf(svgPaths.p36cd3c0)}
            {pf("M4.295 6.755L7.71 8.745")}
            {pf("M7.705 3.255L4.295 5.245")}
          </Svg12>
          Share
        </button>
        <button
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50"
          style={{ width: 28, height: 28 }}
          aria-label="Settings"
        >
          <Svg14>
            <path
              d={svgPaths.p1eaef80}
              stroke="#717182"
              strokeWidth="1.16667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={svgPaths.p4c1f200}
              stroke="#717182"
              strokeWidth="1.16667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg14>
        </button>
      </div>
    </header>
  );
}
