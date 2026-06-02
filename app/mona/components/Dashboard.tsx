import { useCallback, useEffect, useRef, useState } from "react";
import svgPaths from "../../assets/svgDashboard";

const imgLogo = "/mona/logo.png";
const RIGHT_PANEL_MIN_WIDTH = 280;
const RIGHT_PANEL_MAX_WIDTH = 560;
const RIGHT_PANEL_DEFAULT_WIDTH = 360;
const RIGHT_PANEL_STORAGE_KEY = "mona-dashboard-right-panel-width";

function getInitialRightPanelWidth() {
  if (typeof window === "undefined") {
    return RIGHT_PANEL_DEFAULT_WIDTH;
  }

  try {
    const saved = window.localStorage.getItem(RIGHT_PANEL_STORAGE_KEY);
    if (!saved) {
      return RIGHT_PANEL_DEFAULT_WIDTH;
    }

    const parsed = Number.parseInt(saved, 10);
    if (!Number.isNaN(parsed) && parsed >= RIGHT_PANEL_MIN_WIDTH && parsed <= RIGHT_PANEL_MAX_WIDTH) {
      return parsed;
    }
  } catch {
    // ignore localStorage failures
  }

  return RIGHT_PANEL_DEFAULT_WIDTH;
}

// ── Tiny icon helpers ─────────────────────────────────────────────────────────
const pf = (d: string, stroke = "#0A0A0A") => (
  <path d={d} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
);

function Svg12({ children }: { children: React.ReactNode }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">{children}</svg>
  );
}
function Svg14({ children }: { children: React.ReactNode }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{children}</svg>
  );
}
function Svg16({ children }: { children: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{children}</svg>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M6.41667 10.5C8.67283 10.5 10.5 8.67283 10.5 6.41667C10.5 4.1605 8.67283 2.33333 6.41667 2.33333C4.1605 2.33333 2.33333 4.1605 2.33333 6.41667C2.33333 8.67283 4.1605 10.5 6.41667 10.5Z" stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.6667 11.6667L9.44922 9.44922" stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M10.5 4.95833C10.5 3.02534 8.93299 1.45833 7 1.45833C5.067 1.45833 3.5 3.02534 3.5 4.95833V6.64555C3.5 7.00641 3.36088 7.35337 3.11167 7.61258L2.33333 8.41667H11.6667L10.8883 7.61258C10.6391 7.35337 10.5 7.00641 10.5 6.64555V4.95833Z" stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.54167 10.5C5.72203 11.0426 6.25369 11.4167 6.83333 11.4167H7.16667C7.74631 11.4167 8.27797 11.0426 8.45833 10.5" stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 11.6667C9.57733 11.6667 11.6667 9.57733 11.6667 7C11.6667 4.42267 9.57733 2.33333 7 2.33333C4.42267 2.33333 2.33333 4.42267 2.33333 7C2.33333 9.57733 4.42267 11.6667 7 11.6667Z" stroke="#717182" strokeWidth="1.16667" />
      <path d="M5.64648 5.60002C5.64648 4.85251 6.2523 4.24669 6.99982 4.24669C7.74733 4.24669 8.35315 4.85251 8.35315 5.60002C8.35315 6.18548 7.98061 6.68393 7.45964 6.86898C7.18964 6.96483 6.99982 7.21876 6.99982 7.50526V7.70002" stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" />
      <path d="M7 9.33331H7.00583" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PanelToggleIcon({ side, open }: { side: "left" | "right"; open: boolean }) {
  const arrowPoints = side === "left"
    ? open ? "8.5 4 5.5 7 8.5 10" : "5.5 4 8.5 7 5.5 10"
    : open ? "5.5 4 8.5 7 5.5 10" : "8.5 4 5.5 7 8.5 10";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="2" stroke="#717182" strokeWidth="1.16667" />
      <path d={side === "left" ? "M5 2.5V11.5" : "M9 2.5V11.5"} stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" />
      <polyline points={arrowPoints} stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopBar({
  inboxCollapsed,
  rightPanelOpen,
  onToggleInbox,
  onToggleRightPanel,
}: {
  inboxCollapsed: boolean;
  rightPanelOpen: boolean;
  onToggleInbox: () => void;
  onToggleRightPanel: () => void;
}) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex items-center gap-3 px-3 shrink-0 w-full"
      style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.1)", background: "white" }}
    >
      <button
        onClick={onToggleInbox}
        className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 transition-colors"
        style={{ width: 28, height: 28, border: "1px solid rgba(0,0,0,0.08)" }}
        aria-label={inboxCollapsed ? "Expand inbox" : "Collapse inbox"}
      >
        <PanelToggleIcon side="left" open={!inboxCollapsed} />
      </button>

      {/* Logo cell */}
      <div
        className="flex items-center px-2 shrink-0"
        style={{ height: "100%", borderRight: "1px solid rgba(0,0,0,0.1)", width: 103 }}
      >
        <img src={imgLogo} alt="Mona" style={{ height: 21, width: 85, objectFit: "cover" }} />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-1 shrink-0">
        <span className="text-[14px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>Project</span>
        <Svg12>{pf("M4.5 9L7.5 6L4.5 3", "#717182")}</Svg12>
        <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Inter, sans-serif" }}>Acme feedback tool</span>
      </div>

      <div
        className="flex flex-1 items-center justify-center px-6"
      >
        <div
          className="flex h-8 w-full max-w-[320px] items-center gap-2 rounded-[10px] px-3"
          style={{ background: "rgba(241,245,249,0.9)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <SearchIcon />
          <span className="text-[12px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>
            搜索文档、任务 (⌘K)
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button className="flex items-center justify-center rounded-[8px] hover:bg-gray-50" style={{ width: 28, height: 28 }} aria-label="Notifications">
          <BellIcon />
        </button>
        <button className="flex items-center justify-center rounded-[8px] hover:bg-gray-50" style={{ width: 28, height: 28 }} aria-label="Help">
          <HelpIcon />
        </button>
        <button
          onClick={onToggleRightPanel}
          className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 transition-colors"
          style={{ width: 28, height: 28, border: "1px solid rgba(0,0,0,0.08)" }}
          aria-label={rightPanelOpen ? "Collapse AI panel" : "Expand AI panel"}
        >
          <PanelToggleIcon side="right" open={rightPanelOpen} />
        </button>
        <button
          className="flex items-center gap-1 px-2 rounded-[8px] text-[12px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
          style={{ height: 28, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
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
        {/* Settings */}
        <button className="flex items-center justify-center rounded-[8px] hover:bg-gray-50" style={{ width: 28, height: 28 }}>
          <Svg14>
            <path d={svgPaths.p1eaef80} stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p4c1f200} stroke="#717182" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
          </Svg14>
        </button>
      </div>
    </header>
  );
}

function AgentStatusDot({ color, label, initials }: { color: string; label: string; initials: string }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <div className="relative flex items-center justify-center rounded-full text-[8px] text-white" style={{ width: 16, height: 16, background: color, fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
        {initials}
        <span className="absolute -bottom-[1px] -right-[1px] rounded-full border border-[#f8fafc]" style={{ width: 6, height: 6, background: label === "Busy" ? "#facc15" : label === "Online" ? "#4ade80" : "#94a3b8" }} />
      </div>
    </div>
  );
}

function BottomBar() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-3" style={{ height: 28, borderTop: "1px solid rgba(0,0,0,0.08)", background: "#f8fafc" }}>
      <span className="text-[10px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>
        Last sync: 2 mins ago
      </span>
      <div className="flex items-center gap-1.5">
        <AgentStatusDot color="#7c3aed" label="Online" initials="O" />
        <AgentStatusDot color="#2563eb" label="Busy" initials="P" />
        <AgentStatusDot color="#0f766e" label="Idle" initials="B" />
      </div>
    </footer>
  );
}

// ── Tab Icons ─────────────────────────────────────────────────────────────────
function EyeIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.0833 1.75H2.91667C2.27233 1.75 1.75 2.27233 1.75 2.91667V11.0833C1.75 11.7277 2.27233 12.25 2.91667 12.25H11.0833C11.7277 12.25 12.25 11.7277 12.25 11.0833V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75Z" stroke={color} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.75 1.75V12.25" stroke={color} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.66667 5.25L6.41667 7L4.66667 8.75" stroke={color} strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileTextIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4.08333 1.16667C3.43583 1.16667 2.91667 1.68583 2.91667 2.33333V11.6667C2.91667 12.3142 3.43583 12.8333 4.08333 12.8333H9.91667C10.5642 12.8333 11.0833 12.3142 11.0833 11.6667V4.08333L8.16667 1.16667H4.08333ZM4.08333 2.33333H7.58333V4.66667H9.91667V11.6667H4.08333V2.33333ZM5.25 5.83333V7H8.75V5.83333H5.25ZM5.25 8.16667V9.33333H8.75V8.16667H5.25Z" fill={color} />
    </svg>
  );
}

function PaletteIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d={svgPaths.p17c66200} stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <path d={svgPaths.p31eedf00} stroke={color} strokeLinecap="round" strokeLinejoin="round" />
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

// ── Left sidebar (Inbox) ──────────────────────────────────────────────────────
function InboxPanel({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);

  // Collapsed view
  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center shrink-0"
        style={{
          width: 41,
          background: "#dfe3e8",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "2px 0px 4px 0px rgba(0,0,0,0.15)",
          height: "100%",
        }}
      >
        <div className="flex flex-col gap-2 items-center pt-2 px-2">
          {/* Icon */}
          <Svg16>
            <path d={svgPaths.p2f778600} fill="#1C1B1F" />
          </Svg16>

          {/* Vertical "Inbox" text */}
          <div className="flex items-center justify-center h-[37px] w-[17px]">
            <div className="-rotate-90 flex-none">
              <p className="text-[14px] text-[#0a0a0a] whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif" }}>
                Inbox
              </p>
            </div>
          </div>

          {/* Badge */}
          <div
            className="flex items-center justify-center rounded-[8px] px-2"
            style={{ background: "#eceef2", height: 22, minWidth: 24 }}
          >
            <span className="text-[12px] text-[#030213]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              9
            </span>
          </div>
        </div>

        {/* Toggle button at bottom */}
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className="mb-3 hover:opacity-70 transition-opacity"
        >
          <Svg14>
            {pf(svgPaths.pc71600, "#717182")}
            {pf("M5.25 1.75V12.25", "#717182")}
            {pf(svgPaths.p9d4f800, "#717182")}
          </Svg14>
        </button>
      </div>
    );
  }

  // Expanded view
  const suggestions = [
    {
      id: 0,
      tag: "Sign Up",
      title: "Henry Howarth suggest to replace the old NPS prompt with the new 1–5 rating.",
      action: "Swap NPS prompt → 1–5 rating",
    },
    {
      id: 1,
      tag: "NPS prompt",
      title: "Henry Howarth suggest to help user to find the item more quickly.",
      action: "Add global search + filter",
    },
  ];

  const monaNote = "Add a global search function, and a global filter.";

  return (
    <div
      className="flex h-full flex-col shrink-0 overflow-y-auto"
      style={{
        width: 220,
        background: "#dfe3e8",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      {/* Inbox header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center gap-1">
          <Svg16>
            <path d={svgPaths.p2f778600} fill="#1C1B1F" />
          </Svg16>
          <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Inter, sans-serif" }}>Inbox</span>
          <span
            className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]"
            style={{ background: "#eceef2", height: 22, fontFamily: "Inter, sans-serif", fontWeight: 500 }}
          >
            9
          </span>
        </div>
        <button onClick={onToggle} className="hover:opacity-70">
          <Svg14>
            {pf(svgPaths.pc71600, "#717182")}
            {pf("M5.25 1.75V12.25", "#717182")}
            {pf(svgPaths.p9d4f800, "#717182")}
          </Svg14>
        </button>
      </div>

      {/* Suggestions */}
      <div className="px-4 pt-4 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Suggestions</span>
          <span className="text-[12px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>· 5</span>
        </div>
      </div>

      {suggestions.map((s) =>
        dismissed.includes(s.id) ? null : (
          <div
            key={s.id}
            className="mx-3 mb-2 p-3 rounded-[12px] flex flex-col gap-2"
            style={{
              background: "#fefdfc",
              border: "1px solid #dbe3ff",
              boxShadow: "0px -2px 4px 0px rgba(63,74,78,0.15), 0px -1px 3px 0px rgba(128,142,148,0.2)",
            }}
          >
            {/* Tag row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded-[8px] text-[12px] text-[#002557] cursor-pointer"
                  style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                >
                  {s.tag}
                </span>
              </div>
              <button onClick={() => setDismissed((d) => [...d, s.id])} className="hover:opacity-70">
                <Svg16>
                  <path d="M12 4L4 12" stroke="#002557" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 4L12 12" stroke="#002557" strokeLinecap="round" strokeLinejoin="round" />
                </Svg16>
              </button>
            </div>
            {/* Body */}
            <p className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</p>
            {/* Mona suggestion */}
            <div className="pt-1" style={{ borderTop: "1px dashed #EBC5A8" }}>
              <p className="text-[12px] text-[#717182] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>You may want me to:</p>
              <p className="text-[12px] text-[#0a0a0a] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.action}</p>
              <div className="flex gap-1.5">
                <button
                  className="flex items-center gap-1 px-2 rounded-[4px] text-[12px] text-white"
                  style={{ background: "#002557", height: 28, fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                  <Svg12>{pf("M10 3L4.5 8.5L2 6", "#FF7F26")}</Svg12>
                  Yes
                </button>
                <button
                  className="flex items-center px-2 rounded-[4px] text-[12px] text-[#002557]"
                  style={{ background: "white", height: 28, border: "1px solid rgba(0,37,87,0.6)", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                  Blocked
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Mona note card */}
      <div
        className="mx-3 mb-2 p-3 rounded-[12px] flex flex-col gap-2"
        style={{ background: "#fefdfc", border: "1px solid #dbe3ff" }}
      >
        <p className="text-[12px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>You may want to:</p>
        <p className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif" }}>{monaNote}</p>
        <div className="flex gap-1.5">
          <button
            className="flex items-center gap-1 px-2 rounded-[4px] text-[12px] text-white"
            style={{ background: "#002557", height: 28, fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            <Svg12>{pf("M10 3L4.5 8.5L2 6", "#FF7F26")}</Svg12>
            Yes
          </button>
          <button
            className="flex items-center px-2 rounded-[4px] text-[12px] text-[#002557]"
            style={{ background: "white", height: 28, border: "1px solid rgba(0,37,87,0.6)", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
          >
            Blocked
          </button>
          <button
            className="flex items-center justify-center rounded-[4px]"
            style={{ background: "white", width: 28, height: 28, border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <Svg16><path d={svgPaths.p14780cf0} fill="#002557" /></Svg16>
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="px-4 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Questions</span>
          <span className="text-[12px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>· 4</span>
        </div>
      </div>

      {/* Question card */}
      <div
        className="mx-3 mb-3 p-3 rounded-[12px] flex flex-col gap-2"
        style={{ background: "#fefdfc", border: "1px solid #dbe3ff" }}
      >
        <p className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif" }}>What tone should the UX writing adopt?</p>
        <div className="flex gap-1.5 flex-wrap">
          {["Neutral", "Friendly", "Playful"].map((opt) => (
            <span
              key={opt}
              className="px-2 py-0.5 rounded-full text-[12px] text-[#0a0a0a] cursor-pointer hover:bg-gray-100"
              style={{ border: "1px solid rgba(0,0,0,0.15)", fontFamily: "Poppins, sans-serif" }}
            >
              {opt}
            </span>
          ))}
        </div>
        <input
          className="w-full text-[12px] text-[#717182] rounded-[4px] px-2 outline-none"
          style={{ height: 28, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif" }}
          placeholder="Type your answer..."
        />
      </div>

      {/* Monkey avatar at bottom */}
      <div className="flex-1" />
      <div className="p-3">
        <div
          className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-90"
          style={{ width: 36, height: 36, background: "#002557" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d={svgPaths.p1e43ddf2} fill="#FF7F26" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ onClose }: { onClose: () => void }) {
  const [width, setWidth] = useState(getInitialRightPanelWidth);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(RIGHT_PANEL_DEFAULT_WIDTH);

  useEffect(() => {
    try {
      window.localStorage.setItem(RIGHT_PANEL_STORAGE_KEY, String(width));
    } catch {
      // ignore localStorage failures
    }
  }, [width]);

  const onMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragging.current = true;
    startX.current = event.clientX;
    startWidth.current = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragging.current) {
        return;
      }

      const delta = startX.current - moveEvent.clientX;
      const nextWidth = Math.min(
        RIGHT_PANEL_MAX_WIDTH,
        Math.max(RIGHT_PANEL_MIN_WIDTH, startWidth.current + delta),
      );
      setWidth(nextWidth);
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [width]);

  return (
    <aside
      className="relative flex h-full shrink-0 flex-col overflow-hidden"
      style={{ width, borderLeft: "1px solid rgba(0,0,0,0.08)", background: "#ffffff" }}
    >
      <div
        className="absolute inset-y-0 left-0 z-10 cursor-col-resize"
        style={{ width: 8 }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute inset-y-0 left-[3px] w-px" style={{ background: "rgba(0,0,0,0.08)" }} />
      </div>

      <div className="flex items-center justify-between shrink-0 pl-4 pr-3" style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="rounded-full" style={{ width: 6, height: 6, background: "#4ade80" }} />
          <span className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
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
            <path d="M10.5 3.5L3.5 10.5" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.5 3.5L10.5 10.5" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" />
          </Svg14>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "#fcfcfd" }}>
        <div className="mb-4 rounded-[14px] p-3" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="mb-1 text-[11px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>Mona Active</p>
          <p className="text-[13px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>
            Reviewing inbox suggestions and aligning PRD updates with design tasks.
          </p>
        </div>

        {[
          {
            name: "Planner",
            status: "Working on synthesis",
            detail: "Clustered 12 stakeholder notes into three candidate backlog themes.",
          },
          {
            name: "Builder",
            status: "Waiting for decision",
            detail: "Needs confirmation on whether search should live in top nav or feed filters.",
          },
          {
            name: "Reviewer",
            status: "Ready",
            detail: "Can generate acceptance criteria after the selected suggestion is approved.",
          },
        ].map((item) => (
          <div key={item.name} className="mb-3 rounded-[14px] p-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[12px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                {item.name}
              </span>
              <span className="text-[10px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>
                {item.status}
              </span>
            </div>
            <p className="text-[12px] text-[#4b5563]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "white" }}>
        <div className="rounded-[12px] px-3 py-2" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "#f8fafc" }}>
          <p className="text-[12px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>
            Ask Mona to apply a selected inbox suggestion to the PRD.
          </p>
        </div>
      </div>
    </aside>
  );
}

// ── PRD content ───────────────────────────────────────────────────────────────
const PRD_NAV = [
  "Background & Vision",
  "Personas & Scenarios",
  "Architecture & Flow",
  "Feature Requirements",
  "Non-Functional Requirements",
];

const FEATURES = [
  { name: "In-App Messaging", count: 3, expanded: false },
  { name: "Payment & Escrow (Core Trust Feature)", count: 4, expanded: false },
  { name: "Request & Matching System", count: 3, expanded: false },
  {
    name: "The Global Marketplace Feed (",
    count: 3,
    expanded: true,
    items: [
      { num: "037", priority: 1, label: "Explore Tab (Curated Feed)" },
      { num: "038", priority: 1, label: "Feed Filtering (Country & Category)" },
      { num: "026", priority: 2, label: "Item Detail Redirection (Interaction)" },
      { num: "025", priority: 1, label: "Keyword Search" },
    ],
  },
  { name: "User Authentication & Profile", count: 3, expanded: false },
  { name: "Navigation bar", count: 2, expanded: false },
  { name: "Sign Up", count: 3, expanded: false },
];

const TABS_CONFIG = [
  { id: "Preview", label: "Preview", Icon: EyeIcon },
  { id: "PRD", label: "PRD", Icon: FileTextIcon },
  { id: "Design", label: "Design", Icon: PaletteIcon },
  { id: "Code", label: "Code", Icon: CodeIcon },
];

// ── Design Content ────────────────────────────────────────────────────────────

function ToolBoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path d="M3.41667 15.5833V8.52625C3.41667 8.15083 3.54618 7.83465 3.80521 7.57771C4.06424 7.32076 4.38132 7.19229 4.75646 7.19229H6.70833V5.75208C6.70833 5.37569 6.83785 5.05903 7.09687 4.80208C7.3559 4.54514 7.67299 4.41667 8.04812 4.41667H11.9519C12.327 4.41667 12.6441 4.54618 12.9031 4.80521C13.1622 5.06424 13.2917 5.38132 13.2917 5.75646V7.19229H15.2435C15.6187 7.19229 15.9358 7.32181 16.1948 7.58083C16.4538 7.83986 16.5833 8.15694 16.5833 8.53208V15.5833H3.41667ZM7.24354 11.9294V12.6794H6.16021V11.9294H4.5V14.5H15.5V11.9294H13.8398V12.6794H12.7565V11.9294H7.24354ZM4.5 8.53208V10.8463H6.16021V10.0963H7.24354V10.8463H12.7565V10.0963H13.8398V10.8463H15.5V8.53208C15.5 8.46792 15.4733 8.40917 15.4198 8.35583C15.3665 8.30236 15.3077 8.27562 15.2435 8.27562H4.75646C4.69229 8.27562 4.63354 8.30236 4.58021 8.35583C4.52674 8.40917 4.5 8.46792 4.5 8.53208ZM7.79167 7.19229H12.2083V5.75646C12.2083 5.69229 12.1816 5.63354 12.1281 5.58021C12.0748 5.52674 12.016 5.5 11.9519 5.5H8.04812C7.98396 5.5 7.92521 5.52674 7.87188 5.58021C7.8184 5.63354 7.79167 5.69229 7.79167 5.75646V7.19229Z" fill="#717182" />
    </svg>
  );
}

function StatusIcon({ type }: { type: "Done" | "WIP" | "Paused" }) {
  if (type === "Done") {
    return (
      <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: "#002557" }}>
        <Svg12><path d="M2.5 6.5L5 9L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg12>
      </div>
    );
  }
  if (type === "WIP") {
    return (
      <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: "#FF7F26" }}>
        <Svg12><path d="M3 6h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></Svg12>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 24, height: 24, background: "#ececf0" }}>
      <Svg12><path d="M4 3.5v5M8 3.5v5" stroke="#717182" strokeWidth="1.5" strokeLinecap="round" /></Svg12>
    </div>
  );
}

const DESIGN_FEATURES = [
  { name: "In-App Messaging", count: 3, status: "Paused" },
  { name: "Payment & Escrow", count: 4, status: "Done" },
  { name: "Request & Matching System", count: 3, status: "Done" },
  { name: "The Global Marketplace Feed", count: 3, status: "Done" },
  { name: "User Authentication & Profile", count: 3, status: "Done" },
  { name: "Navigation bar", count: 2, status: "Done" },
  { name: "Sign Up", count: 3, status: "WIP" },
];

function DesignContent() {
  const [activeDesignTab, setActiveDesignTab] = useState("Prototype");

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: "#f6f6f9", padding: 16, gap: 16 }}>
      {/* Left Panel */}
      <div className="flex flex-col shrink-0 overflow-y-auto rounded-[12px] bg-white" style={{ width: 280, border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0px 0px 3px rgba(144,151,161,0.1)" }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(0,0,0,0.1)] shrink-0" style={{ height: 40 }}>
          <div className="flex items-center gap-2">
            <ToolBoxIcon />
            <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Feature</span>
            <span className="flex items-center justify-center rounded-[8px] px-2 text-[12px] text-[#030213]" style={{ background: "#eceef2", height: 22, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>7</span>
          </div>
          <button className="hover:opacity-70"><Svg14><path d={svgPaths.pc990c00} fill="#717182" /></Svg14></button>
        </div>
        <div className="flex flex-col p-4 gap-2">
          {DESIGN_FEATURES.map(f => (
            <div key={f.name} className="flex items-center gap-2 p-2 rounded-[10px] border border-[rgba(0,0,0,0.1)] hover:bg-gray-50 cursor-pointer transition-colors">
              <StatusIcon type={f.status as any} />
              <span className="flex-1 text-[14px] text-[#0a0a0a] truncate" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>{f.name}</span>
              <span className="flex items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] text-[#717182]" style={{ background: "#eef3f2", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>{f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col flex-1 overflow-hidden rounded-[12px] bg-white border border-[#e5e5e5] shadow-[0px_0px_3px_rgba(144,151,161,0.1)]">
        {/* Top Tabs */}
        <div className="flex items-end bg-[#eaeaea] rounded-t-[12px] shrink-0 h-[32px]">
          {["Prototype", "Design system"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDesignTab(tab)}
              className="flex items-center justify-center h-[32px] px-4 rounded-t-[12px] cursor-pointer"
              style={{
                width: 140,
                background: activeDesignTab === tab ? "#feffff" : "#eaeaea",
                zIndex: activeDesignTab === tab ? 2 : 1
              }}
            >
              <span className="text-[14px] text-[#222]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1 p-4 bg-[#feffff] overflow-y-auto">
          {/* Toolbar */}
          <div className="flex justify-end mb-3">
            <button className="flex items-center gap-1.5 px-2 h-[32px] rounded-[4px] bg-[#f6f6f9] hover:bg-gray-200 cursor-pointer">
              <Svg16><path d="M4 12v-2h8v2H4zm4-4L5 5h6L8 8z" fill="rgba(113,113,130,0.6)" /></Svg16>
              <span className="text-[12px] text-[rgba(113,113,130,0.6)]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Export</span>
            </button>
          </div>

          {/* Skeletons */}
          <div className="flex flex-col gap-3">
            <div className="h-[12px] w-[315px] bg-[#ececf0] rounded-[4px]" />

            <div className="flex items-center justify-center p-6 bg-[#ececf0] rounded-[4px]">
              <div className="flex gap-10 items-center w-full max-w-[800px] justify-center">
                {/* Fake Image Cards */}
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
        </div>
      </div>
    </div>
  );
}

function PRDContent() {
  const [activeNav, setActiveNav] = useState("Feature Requirements");
  const [activeTab, setActiveTab] = useState("PRD");
  const [expanded, setExpanded] = useState<string[]>(["The Global Marketplace Feed ("]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "white" }}>
      {/* Tabs */}
      <div
        className="flex items-center gap-2 px-4 shrink-0"
        style={{ height: 44, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "white" }}
      >
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 rounded-[8px] text-[14px] cursor-pointer transition-all"
              style={{
                height: 32,
                background: isActive ? "#002557" : "white",
                border: isActive ? "1px solid #002557" : "1px solid rgba(113,113,130,0.2)",
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
        <button className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 cursor-pointer" style={{ width: 24, height: 24 }}>
          <Svg12>{pf("M6 1.5H1C1.5 1.5 1 1 1 1.5V10.5C1 11 1.5 11 1.5 11H10C10.5 11 10.5 10.5 10.5 10V5.5", "#717182")}</Svg12>
        </button>
      </div>

      {/* Body: left nav + content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "PRD" ? (
          <>
            {/* Section nav */}
            <div
              className="flex flex-col gap-0.5 p-3 shrink-0 overflow-y-auto"
              style={{ width: 180, borderRight: "1px solid rgba(0,0,0,0.06)", background: "#fafafa" }}
            >
              {PRD_NAV.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveNav(item)}
                  className="text-left px-2 py-1.5 rounded-[6px] text-[13px] cursor-pointer transition-all"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: activeNav === item ? 500 : 400,
                    color: activeNav === item ? "#FF7F26" : "#717182",
                    background: activeNav === item ? "#fff7f0" : "transparent",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Main PRD area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 relative">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-[22px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                  Product Requirement Document
                </h1>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
                    style={{ height: 32, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d={svgPaths.p127a080} fill="#717182" />
                    </svg>
                    History
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] text-[#0a0a0a] cursor-pointer hover:bg-gray-50"
                    style={{ height: 32, border: "1px solid rgba(0,0,0,0.1)", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d={svgPaths.p2213bc80} fill="#717182" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Feature Requirements */}
              <h2 className="text-[16px] text-[#0a0a0a] mb-3" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                Feature Requirements
              </h2>

              {/* Feature count badge */}
              <div className="flex items-center gap-2 mb-3">
                <ToolBoxIcon />
                <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>Feature</span>
                <span
                  className="px-2 rounded-[6px] text-[13px] text-[#0a0a0a]"
                  style={{ background: "#f0f0f5", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  7
                </span>
                <div className="flex-1" />
                <button className="hover:opacity-70">
                  <Svg14><path d={svgPaths.pc990c00} fill="#717182" /></Svg14>
                </button>
              </div>

              {/* Feature rows */}
              <div className="flex flex-col" style={{ borderTop: "1px solid #e5e7eb" }}>
                {FEATURES.map((f) => (
                  <div key={f.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    {/* Row */}
                    <button
                      className="flex items-center justify-between w-full px-2 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpanded((e) =>
                        e.includes(f.name) ? e.filter((x) => x !== f.name) : [...e, f.name]
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="opacity-50"><ToolBoxIcon /></div>
                        <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif" }}>{f.name}</span>
                      </div>
                      <span className="text-[13px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>{f.count}</span>
                    </button>

                    {/* Expanded sub-items */}
                    {expanded.includes(f.name) && f.items && (
                      <div className="flex flex-col">
                        {f.items.map((item) => (
                          <div
                            key={item.num}
                            className="flex flex-col px-6 py-2 cursor-pointer hover:bg-blue-50"
                            style={{ borderTop: "1px solid #e5e7eb" }}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <div
                                className="rounded-full"
                                style={{ width: 8, height: 8, background: item.priority === 1 ? "#002557" : "#6b727e", flexShrink: 0 }}
                              />
                              <span className="text-[12px] text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>
                                {item.num} &nbsp; Priority {item.priority}
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
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : activeTab === "Design" ? (
          <DesignContent />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#717182]" style={{ fontFamily: "Poppins, sans-serif" }}>
            {activeTab} Content (Placeholder)
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard root ────────────────────────────────────────────────────────────
export function Dashboard() {
  const [inboxCollapsed, setInboxCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden" style={{ background: "#ffffff", minHeight: 0 }}>
      <TopBar
        inboxCollapsed={inboxCollapsed}
        rightPanelOpen={rightPanelOpen}
        onToggleInbox={() => setInboxCollapsed(!inboxCollapsed)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 48, marginBottom: 28 }}>
        <InboxPanel collapsed={inboxCollapsed} onToggle={() => setInboxCollapsed(!inboxCollapsed)} />
        <main className="flex flex-1 overflow-hidden" style={{ background: "#ffffff" }}>
          <PRDContent />
        </main>
        {rightPanelOpen && <RightPanel onClose={() => setRightPanelOpen(false)} />}
      </div>
      <BottomBar />
    </div>
  );
}
