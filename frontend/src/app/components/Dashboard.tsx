import { useState } from "react";
import svgPaths from "../../assets/svgDashboard";
import imgLogo from "../../assets/logo.png";

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
function TopBar() {
  return (
    <div
      className="flex items-center shrink-0 w-full"
      style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.1)", background: "white" }}
    >
      {/* Logo cell */}
      <div
        className="flex items-center px-2 shrink-0"
        style={{ height: "100%", borderRight: "1px solid rgba(0,0,0,0.1)", width: 103 }}
      >
        <img src={imgLogo} alt="Mona" style={{ height: 21, width: 85, objectFit: "cover" }} />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-3 flex-1">
        <span className="text-[14px] text-[#717182]" style={{ fontFamily: "Inter, sans-serif" }}>Project</span>
        <Svg12>{pf("M4.5 9L7.5 6L4.5 3", "#717182")}</Svg12>
        <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Inter, sans-serif" }}>Acme feedback tool</span>
      </div>

      {/* Sources cluster */}
      <div
        className="flex items-center gap-1 px-3 shrink-0"
        style={{ height: "100%", borderRight: "1px solid rgba(0,0,0,0.1)" }}
      >
        <span className="text-[12px] text-[#717182] mr-1" style={{ fontFamily: "Inter, sans-serif" }}>Sources</span>
        {/* Video icon */}
        <IconBtn>
          <Svg12>
            {pf(svgPaths.p3581cc00)}
            {pf(svgPaths.p1b795000)}
          </Svg12>
          <OrangeDot />
        </IconBtn>
        {/* Calendar icon */}
        <IconBtn>
          <Svg12>
            {pf("M4 1V3")}
            {pf("M8 1V3")}
            {pf(svgPaths.p333d5300)}
            {pf("M1.5 5H10.5")}
          </Svg12>
          <OrangeDot />
        </IconBtn>
        {/* Mail icon - dimmed */}
        <IconBtn dimmed>
          <Svg12>
            {pf("M11 6H1", "#0A0A0A")}
            {pf(svgPaths.p1a703e00)}
            {pf("M3 8H3.005")}
            {pf("M5 8H5.005")}
          </Svg12>
        </IconBtn>
        {/* Document icon */}
        <IconBtn>
          <Svg12>
            {pf(svgPaths.p17c66200)}
            {pf(svgPaths.p31eedf00)}
            {pf("M5 4.5H4")}
            {pf("M8 6.5H4")}
            {pf("M8 8.5H4")}
          </Svg12>
          <OrangeDot />
        </IconBtn>
        {/* Plus */}
        <div
          className="flex items-center justify-center rounded-[8px]"
          style={{ width: 24, height: 24, border: "1px dashed rgba(0,0,0,0.1)" }}
        >
          <Svg12>{pf("M2.5 6H9.5", "#717182")}{pf("M6 2.5V9.5", "#717182")}</Svg12>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 px-3 shrink-0">
        {/* Share */}
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
    </div>
  );
}

function OrangeDot() {
  return (
    <div
      className="absolute rounded-full"
      style={{ width: 6, height: 6, background: "#FF7F26", opacity: 0.51, top: -0.5, right: -1 }}
    />
  );
}

function IconBtn({ children, dimmed }: { children: React.ReactNode; dimmed?: boolean }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-gray-50"
      style={{
        width: 24, height: 24,
        background: dimmed ? "rgba(236,236,240,0.4)" : "white",
        border: "1px solid rgba(0,0,0,0.1)",
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      {children}
    </div>
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
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 220,
        background: "#dfe3e8",
        borderRight: "1px solid rgba(0,0,0,0.1)",
        height: "100vh",
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

function PRDContent() {
  const [activeNav, setActiveNav] = useState("Feature Requirements");
  const [activeTab, setActiveTab] = useState("PRD");
  const [expanded, setExpanded] = useState<string[]>(["The Global Marketplace Feed ("]);

  const tabs = ["Preview", "PRD", "Design", "Code"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "white" }}>
      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-3 shrink-0"
        style={{ height: 40, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "white" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-3 rounded-[6px] text-[14px] cursor-pointer transition-all"
            style={{
              height: 28,
              background: activeTab === tab ? "#002557" : "transparent",
              color: activeTab === tab ? "white" : "#717182",
              fontFamily: "Poppins, sans-serif",
              fontWeight: activeTab === tab ? 500 : 400,
            }}
          >
            {tab === "PRD" && (
              <span
                className="text-[10px] px-1 rounded"
                style={{ background: activeTab === tab ? "#FF7F26" : "#eee", color: activeTab === tab ? "white" : "#717182" }}
              >
                PRD
              </span>
            )}
            {tab !== "PRD" && tab}
            {tab === "PRD" && ""}
          </button>
        ))}
        <div className="flex-1" />
        <button className="flex items-center justify-center rounded-[8px] hover:bg-gray-50 cursor-pointer" style={{ width: 24, height: 24 }}>
          <Svg12>{pf("M6 1.5H1C1.5 1.5 1 1 1 1.5V10.5C1 11 1.5 11 1.5 11H10C10.5 11 10.5 10.5 10.5 10V5.5", "#717182")}</Svg12>
        </button>
      </div>

      {/* Body: left nav + content */}
      <div className="flex flex-1 overflow-hidden">
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
        <div className="flex-1 overflow-y-auto px-8 py-6">
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d={svgPaths.p2209e000} fill="#717182" />
            </svg>
            <span className="text-[14px] text-[#0a0a0a]" style={{ fontFamily: "Poppins, sans-serif" }}>Feature</span>
            <span
              className="px-2 rounded-[6px] text-[13px] text-[#0a0a0a]"
              style={{ background: "#f0f0f5", fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d={svgPaths.p2f778600} fill="#717182" />
                    </svg>
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
      </div>
    </div>
  );
}

// ── Dashboard root ────────────────────────────────────────────────────────────
export function Dashboard() {
  const [inboxCollapsed, setInboxCollapsed] = useState(false);

  return (
    <div className="flex flex-col size-full" style={{ background: "white", minHeight: 0 }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <InboxPanel collapsed={inboxCollapsed} onToggle={() => setInboxCollapsed(!inboxCollapsed)} />
        <PRDContent />
      </div>
    </div>
  );
}
